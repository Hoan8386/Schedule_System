package com.vn.schedule.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:nguyenthanhhoan300904@gmail.com}")
    private String fromEmail;

    @Value("${shopping.frontend-login-url:http://localhost:3000/login}")
    private String loginUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendAccountCreatedEmail(String toEmail, String fullName, String employeeCode, String username, String rawPassword) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Bỏ qua gửi email: Địa chỉ email người nhận trống");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, "Ăn Vặt BLOAN - Quản Lý Nhân Sự");
            helper.setTo(toEmail.trim());
            helper.setSubject("🎉 Thông tin tài khoản nhân viên - Ăn Vặt BLOAN");

            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
                        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                        .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 28px 24px; text-align: center; color: #ffffff; }
                        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
                        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
                        .content { padding: 28px 24px; }
                        .greeting { font-size: 15px; margin-bottom: 16px; line-height: 1.6; }
                        .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
                        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 14px; }
                        .info-row:last-child { border-bottom: none; }
                        .label { color: #64748b; font-weight: 500; }
                        .value { color: #0f172a; font-weight: 700; font-family: monospace, sans-serif; }
                        .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 6px; font-weight: 700; }
                        .btn-container { text-align: center; margin: 26px 0; }
                        .btn { display: inline-block; background-color: #f59e0b; color: #ffffff !important; padding: 12px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3); }
                        .note { font-size: 12px; color: #64748b; line-height: 1.6; border-left: 3px solid #f59e0b; padding-left: 12px; margin-top: 20px; }
                        .footer { background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>ĂN VẶT BLOAN</h1>
                            <p>Hệ Thống Phân Ca & Quản Lý Nhân Sự</p>
                        </div>
                        <div class="content">
                            <p class="greeting">Xin chào <strong>%s</strong>,</p>
                            <p class="greeting">Chào mừng bạn đã gia nhập đội ngũ <strong>Ăn Vặt BLOAN</strong>! Quản lý đã khởi tạo tài khoản nhân viên của bạn trên hệ thống phân ca và làm việc.</p>
                            
                            <div class="card">
                                <div class="info-row">
                                    <span class="label">Mã nhân viên:</span>
                                    <span class="value"><span class="badge">%s</span></span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Tên đăng nhập (Username):</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Mật khẩu tạm thời:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Email liên kết:</span>
                                    <span class="value">%s</span>
                                </div>
                            </div>

                            <div class="btn-container">
                                <a href="%s" class="btn" target="_blank">Đăng Nhập Hệ Thống</a>
                            </div>

                            <p class="note">
                                <strong>Lưu ý bảo mật:</strong> Để đảm bảo an toàn cho tài khoản cá nhân, vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên. Tuyệt đối không chia sẻ mật khẩu này cho bất kỳ ai khác.
                            </p>
                        </div>
                        <div class="footer">
                            Email tự động từ Hệ thống Quản trị Nhân sự - Ăn Vặt BLOAN.<br/>
                            Nếu bạn cần hỗ trợ, vui lòng liên hệ quản lý cửa hàng trực tiếp.
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                    fullName != null && !fullName.isBlank() ? fullName : "Nhân viên",
                    employeeCode != null && !employeeCode.isBlank() ? employeeCode : "Chưa có",
                    username,
                    rawPassword,
                    toEmail,
                    loginUrl
                );

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Đã gửi email thông tin tài khoản thành công đến: {}", toEmail);
        } catch (Exception e) {
            log.error("Không thể gửi email thông tin tài khoản đến {}: {}", toEmail, e.getMessage(), e);
        }
    }
}
