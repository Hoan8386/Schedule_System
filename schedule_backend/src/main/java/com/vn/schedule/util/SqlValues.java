package com.vn.schedule.util;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

/** Đọc kết quả native query: chuyển kiểu cột JDBC về kiểu Java và định dạng chuỗi trả về API. */
public final class SqlValues {
    private SqlValues() {
    }

    @SuppressWarnings("unchecked")
    public static List<Object[]> rows(EntityManager entityManager, String sql, Map<String, ?> params) {
        Query query = entityManager.createNativeQuery(sql);
        params.forEach(query::setParameter);
        return ((List<Object>) query.getResultList()).stream()
                .map(row -> row instanceof Object[] values ? values : new Object[] { row })
                .toList();
    }

    public static long count(EntityManager entityManager, String sql, Map<String, ?> params) {
        List<Object[]> result = rows(entityManager, sql, params);
        return result.isEmpty() ? 0 : toLong(result.get(0)[0]);
    }

    public static double round(double value, int scale) {
        return BigDecimal.valueOf(value).setScale(scale, RoundingMode.HALF_UP).doubleValue();
    }

    public static BigDecimal money(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(0, RoundingMode.HALF_UP);
    }

    public static String text(Object value) {
        return value == null ? null : value.toString();
    }

    public static Integer toInt(Object value) {
        return value == null ? null : ((Number) value).intValue();
    }

    public static long toLong(Object value) {
        return value == null ? 0 : ((Number) value).longValue();
    }

    public static boolean toBool(Object value) {
        if (value instanceof Boolean bool) return bool;
        if (value instanceof Number number) return number.intValue() != 0;
        return value != null && Boolean.parseBoolean(value.toString());
    }

    public static BigDecimal toDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal decimal) return decimal;
        return new BigDecimal(value.toString());
    }

    public static LocalDate toDate(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDate date) return date;
        if (value instanceof java.sql.Date date) return date.toLocalDate();
        if (value instanceof LocalDateTime dateTime) return dateTime.toLocalDate();
        if (value instanceof java.util.Date date) return new java.sql.Date(date.getTime()).toLocalDate();
        return LocalDate.parse(value.toString().substring(0, 10));
    }

    public static LocalTime toTime(Object value) {
        if (value == null) return null;
        if (value instanceof LocalTime time) return time;
        if (value instanceof java.sql.Time time) return time.toLocalTime();
        return LocalTime.parse(value.toString());
    }

    public static LocalDateTime toDateTime(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDateTime dateTime) return dateTime;
        if (value instanceof java.sql.Timestamp timestamp) return timestamp.toLocalDateTime();
        if (value instanceof java.time.OffsetDateTime offset) return offset.toLocalDateTime();
        if (value instanceof java.time.Instant instant) return LocalDateTime.ofInstant(instant, java.time.ZoneId.systemDefault());
        return LocalDateTime.parse(value.toString().replace(' ', 'T'));
    }

    /** HH:mm */
    public static String formatTime(LocalTime time) {
        return time == null ? null : time.toString().substring(0, 5);
    }

    /** yyyy-MM-dd'T'HH:mm */
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.truncatedTo(ChronoUnit.MINUTES).toString();
    }

    public static String formatDateTime(Object value) {
        return formatDateTime(toDateTime(value));
    }
}
