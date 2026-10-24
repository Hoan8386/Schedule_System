package com.vn.schedule.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.vn.schedule.util.ApiException;

/**
 * Sao lưu / khôi phục toàn bộ database dưới dạng file .sql (tương thích mysql CLI / Workbench).
 * Dùng kết nối JDBC riêng (không lấy từ pool) để các lệnh SET trong script
 * (FOREIGN_KEY_CHECKS, time_zone, sql_mode...) không lan sang connection của ứng dụng.
 */
@Service
public class DatabaseBackupService {
    private static final int ROWS_PER_INSERT = 200;
    /** Không cho script đổi / tạo / xóa database khác – luôn nhập vào database đang cấu hình. */
    private static final Pattern SKIPPED = Pattern.compile(
            "^(USE\\s|CREATE\\s+(DATABASE|SCHEMA)\\s|DROP\\s+(DATABASE|SCHEMA)\\s)", Pattern.CASE_INSENSITIVE);
    private static final Pattern DEFINER = Pattern.compile("\\sDEFINER=`[^`]*`@`[^`]*`");

    private final String url;
    private final String username;
    private final String password;
    private final AtomicBoolean busy = new AtomicBoolean(false);

    public DatabaseBackupService(
            @Value("${spring.datasource.url}") String url,
            @Value("${spring.datasource.username:}") String username,
            @Value("${spring.datasource.password:}") String password) {
        this.url = url;
        this.username = username;
        this.password = password;
    }

    /** Database đã có tài khoản nào chưa (bảng chưa tồn tại = chưa có). */
    public boolean isInitialized() {
        try (Connection connection = open(); Statement statement = connection.createStatement();
                ResultSet rs = statement.executeQuery("SELECT COUNT(*) FROM `user`")) {
            return rs.next() && rs.getLong(1) > 0;
        } catch (SQLException exception) {
            return false;
        }
    }

    public byte[] exportSql() {
        lock();
        try (Connection connection = open()) {
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            try (Writer out = new OutputStreamWriter(bytes, StandardCharsets.UTF_8)) {
                execute(connection, "SET time_zone = '+00:00'");
                out.write("-- Schedule System database export\n");
                out.write("-- Database: " + connection.getCatalog() + "\n");
                out.write("-- Generated: " + LocalDateTime.now() + "\n\n");
                out.write("SET NAMES utf8mb4;\n");
                out.write("SET time_zone = '+00:00';\n");
                out.write("SET FOREIGN_KEY_CHECKS = 0;\n");
                out.write("SET UNIQUE_CHECKS = 0;\n");
                out.write("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n\n");

                List<String> views = new ArrayList<>();
                for (String[] table : tables(connection)) {
                    if ("VIEW".equalsIgnoreCase(table[1])) {
                        views.add(table[0]);
                    } else {
                        writeTable(connection, table[0], out);
                    }
                }
                for (String view : views) {
                    writeView(connection, view, out);
                }

                out.write("SET UNIQUE_CHECKS = 1;\n");
                out.write("SET FOREIGN_KEY_CHECKS = 1;\n");
            }
            return bytes.toByteArray();
        } catch (SQLException | IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Xuất database thất bại: " + exception.getMessage());
        } finally {
            busy.set(false);
        }
    }

    /** Chạy lần lượt từng câu lệnh trong script; dừng ở câu lỗi đầu tiên. Trả về số câu lệnh đã chạy. */
    public int importSql(byte[] script) {
        String text = new String(script, StandardCharsets.UTF_8);
        if (text.startsWith("﻿")) {
            text = text.substring(1);
        }
        List<String> statements = SqlScriptSplitter.split(text);
        if (statements.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File SQL không có câu lệnh nào");
        }

        lock();
        int executed = 0;
        try (Connection connection = open(); Statement statement = connection.createStatement()) {
            connection.setAutoCommit(true);
            for (int index = 0; index < statements.size(); index++) {
                String sql = statements.get(index);
                if (SKIPPED.matcher(sql).find()) {
                    continue;
                }
                try {
                    statement.execute(sql);
                    executed++;
                } catch (SQLException exception) {
                    String preview = sql.length() > 200 ? sql.substring(0, 200) + "..." : sql;
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Lỗi ở câu lệnh thứ " + (index + 1) + " (đã chạy "
                            + executed + " câu): " + exception.getMessage() + " — " + preview);
                }
            }
            return executed;
        } catch (SQLException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể kết nối database: " + exception.getMessage());
        } finally {
            busy.set(false);
        }
    }

    private void lock() {
        if (!busy.compareAndSet(false, true)) {
            throw new ApiException(HttpStatus.CONFLICT, "Đang có một thao tác xuất / nhập database khác, vui lòng thử lại sau");
        }
    }

    private Connection open() throws SQLException {
        return DriverManager.getConnection(url, username, password);
    }

    private static void execute(Connection connection, String sql) throws SQLException {
        try (Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }

    /** [tên bảng, loại (BASE TABLE / VIEW)] theo thứ tự tên. */
    private static List<String[]> tables(Connection connection) throws SQLException {
        List<String[]> result = new ArrayList<>();
        try (Statement statement = connection.createStatement();
                ResultSet rs = statement.executeQuery("SHOW FULL TABLES")) {
            while (rs.next()) {
                result.add(new String[] { rs.getString(1), rs.getString(2) });
            }
        }
        result.sort((a, b) -> a[0].compareToIgnoreCase(b[0]));
        return result;
    }

    private static void writeTable(Connection connection, String table, Writer out) throws SQLException, IOException {
        String name = quoteName(table);
        out.write("-- Table " + name + "\n");
        out.write("DROP TABLE IF EXISTS " + name + ";\n");
        try (Statement statement = connection.createStatement();
                ResultSet rs = statement.executeQuery("SHOW CREATE TABLE " + name)) {
            rs.next();
            out.write(rs.getString(2) + ";\n\n");
        }

        // fetchSize MIN_VALUE: Connector/J đọc từng dòng thay vì nạp cả bảng vào RAM
        try (Statement statement = connection.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)) {
            statement.setFetchSize(Integer.MIN_VALUE);
            try (ResultSet rs = statement.executeQuery("SELECT * FROM " + name)) {
                ResultSetMetaData meta = rs.getMetaData();
                int columns = meta.getColumnCount();
                StringBuilder header = new StringBuilder("INSERT INTO ").append(name).append(" (");
                for (int column = 1; column <= columns; column++) {
                    header.append(column > 1 ? ", " : "").append(quoteName(meta.getColumnName(column)));
                }
                header.append(") VALUES\n");

                int rows = 0;
                while (rs.next()) {
                    out.write(rows % ROWS_PER_INSERT == 0 ? header.toString() : ",\n");
                    out.write("(");
                    for (int column = 1; column <= columns; column++) {
                        if (column > 1) {
                            out.write(", ");
                        }
                        out.write(literal(rs, meta, column));
                    }
                    out.write(")");
                    rows++;
                    if (rows % ROWS_PER_INSERT == 0) {
                        out.write(";\n");
                    }
                }
                if (rows % ROWS_PER_INSERT != 0) {
                    out.write(";\n");
                }
            }
        }
        out.write("\n");
    }

    private static void writeView(Connection connection, String view, Writer out) throws SQLException, IOException {
        String name = quoteName(view);
        try (Statement statement = connection.createStatement();
                ResultSet rs = statement.executeQuery("SHOW CREATE VIEW " + name)) {
            rs.next();
            out.write("-- View " + name + "\n");
            out.write("DROP VIEW IF EXISTS " + name + ";\n");
            // Bỏ DEFINER để nhập được trên máy chủ khác tài khoản MySQL
            out.write(DEFINER.matcher(rs.getString(2)).replaceAll("") + ";\n\n");
        }
    }

    private static String literal(ResultSet rs, ResultSetMetaData meta, int column) throws SQLException {
        int type = meta.getColumnType(column);
        String typeName = meta.getColumnTypeName(column).toUpperCase(Locale.ROOT);
        switch (type) {
            case Types.BINARY, Types.VARBINARY, Types.LONGVARBINARY, Types.BLOB -> {
                byte[] bytes = rs.getBytes(column);
                return bytes == null ? "NULL" : bytes.length == 0 ? "''" : "X'" + HexFormat.of().formatHex(bytes) + "'";
            }
            case Types.BIT, Types.BOOLEAN, Types.TINYINT, Types.SMALLINT, Types.INTEGER, Types.BIGINT,
                    Types.DECIMAL, Types.NUMERIC, Types.FLOAT, Types.REAL, Types.DOUBLE -> {
                Object value = rs.getObject(column);
                if (value == null) {
                    return "NULL";
                }
                if (value instanceof Boolean flag) {
                    return flag ? "1" : "0";
                }
                if (value instanceof byte[] bits) {
                    return "X'" + HexFormat.of().formatHex(bits) + "'";
                }
                if (value instanceof java.math.BigDecimal decimal) {
                    return decimal.toPlainString();
                }
                return value.toString();
            }
            default -> {
                // YEAR bị Connector/J báo là DATE → lấy số năm
                if ("YEAR".equals(typeName)) {
                    int year = rs.getInt(column);
                    return rs.wasNull() ? "NULL" : String.valueOf(year);
                }
                String value = rs.getString(column);
                return value == null ? "NULL" : quoteString(value);
            }
        }
    }

    private static String quoteName(String name) {
        return "`" + name.replace("`", "``") + "`";
    }

    private static String quoteString(String value) {
        StringBuilder builder = new StringBuilder(value.length() + 2).append('\'');
        for (int index = 0; index < value.length(); index++) {
            char ch = value.charAt(index);
            switch (ch) {
                case '\\' -> builder.append("\\\\");
                case '\'' -> builder.append("\\'");
                case '\0' -> builder.append("\\0");
                case '\n' -> builder.append("\\n");
                case '\r' -> builder.append("\\r");
                case '\u001a' -> builder.append("\\Z");
                default -> builder.append(ch);
            }
        }
        return builder.append('\'').toString();
    }

    /**
     * Tách script SQL thành từng câu lệnh: hiểu chuỗi '...', "...", `...`, comment (-- , #, /* *\/),
     * comment thực thi /*! *\/ (giữ lại) và lệnh DELIMITER của mysql CLI (dùng cho PROCEDURE / TRIGGER).
     */
    static final class SqlScriptSplitter {
        private SqlScriptSplitter() {
        }

        static List<String> split(String script) {
            List<String> statements = new ArrayList<>();
            StringBuilder current = new StringBuilder();
            String delimiter = ";";
            int length = script.length();
            int index = 0;

            while (index < length) {
                char ch = script.charAt(index);

                // DELIMITER chỉ có nghĩa ở đầu dòng, khi chưa bắt đầu câu lệnh nào
                if ((index == 0 || script.charAt(index - 1) == '\n') && isBlank(current)) {
                    int lineEnd = script.indexOf('\n', index);
                    String line = script.substring(index, lineEnd < 0 ? length : lineEnd).trim();
                    if (line.regionMatches(true, 0, "DELIMITER ", 0, 10)) {
                        delimiter = line.substring(10).trim();
                        current.setLength(0);
                        index = lineEnd < 0 ? length : lineEnd + 1;
                        continue;
                    }
                }

                if (ch == '\'' || ch == '"' || ch == '`') {
                    int end = index + 1;
                    while (end < length) {
                        char next = script.charAt(end);
                        if (next == '\\' && ch != '`' && end + 1 < length) {
                            end += 2;
                        } else if (next == ch) {
                            // '' / "" / `` lồng nhau = ký tự thoát
                            if (end + 1 < length && script.charAt(end + 1) == ch) {
                                end += 2;
                            } else {
                                break;
                            }
                        } else {
                            end++;
                        }
                    }
                    end = Math.min(end + 1, length);
                    current.append(script, index, end);
                    index = end;
                    continue;
                }

                boolean dashComment = ch == '-' && index + 1 < length && script.charAt(index + 1) == '-'
                        && (index + 2 >= length || Character.isWhitespace(script.charAt(index + 2)));
                if (dashComment || ch == '#') {
                    int lineEnd = script.indexOf('\n', index);
                    index = lineEnd < 0 ? length : lineEnd;
                    continue;
                }

                if (ch == '/' && index + 1 < length && script.charAt(index + 1) == '*') {
                    int end = script.indexOf("*/", index + 2);
                    end = end < 0 ? length : end + 2;
                    boolean executable = index + 2 < length && script.charAt(index + 2) == '!';
                    if (executable) {
                        current.append(script, index, end);
                    } else {
                        current.append(' ');
                    }
                    index = end;
                    continue;
                }

                if (script.startsWith(delimiter, index)) {
                    add(statements, current);
                    index += delimiter.length();
                    continue;
                }

                current.append(ch);
                index++;
            }
            add(statements, current);
            return statements;
        }

        /** Dừng ở ký tự khác trắng đầu tiên – không copy cả câu INSERT dài mỗi lần xuống dòng. */
        private static boolean isBlank(StringBuilder current) {
            for (int index = 0; index < current.length(); index++) {
                if (!Character.isWhitespace(current.charAt(index))) {
                    return false;
                }
            }
            return true;
        }

        private static void add(List<String> statements, StringBuilder current) {
            String sql = current.toString().trim();
            if (!sql.isEmpty()) {
                statements.add(sql);
            }
            current.setLength(0);
        }
    }
}
