/**
 * Dữ liệu mẫu cho trang Thông báo & Email (chưa có API backend tương ứng).
 */

// ==========================================
// 1. ĐỊNH NGHĨA DỮ LIỆU MẪU EMAIL TỰ ĐỘNG
// ==========================================
export interface EmailTemplate {
  id: string;
  code: string;
  name: string;
  subject: string;
  variables: string[];
  lastUpdated: string;
  enabled: boolean;
  content: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "tpl_1",
    code: "AUTH_REGISTER_CONFIRM",
    name: "Xác nhận tạo tài khoản & Kích hoạt",
    subject: "[Ăn Vặt BLOAN] Kích hoạt tài khoản nhân viên của bạn",
    variables: ["{{fullName}}", "{{username}}", "{{tempPassword}}", "{{activationLink}}"],
    lastUpdated: "02/10/2026",
    enabled: true,
    content: `Chào {{fullName}},

Chào mừng bạn đã gia nhập đại gia đình Ăn Vặt BLOAN!
Tài khoản làm việc của bạn đã được thiết lập thành công trên hệ thống Workforce Management:
- Tên đăng nhập: {{username}}
- Mật khẩu tạm thời: {{tempPassword}}

Vui lòng bấm vào liên kết dưới đây để kích hoạt tài khoản và đổi mật khẩu mới:
{{activationLink}}

Trân trọng,
Ban Điều Hành Chuỗi Ăn Vặt BLOAN.`,
  },
  {
    id: "tpl_2",
    code: "SHIFT_SCHEDULE_PUBLISHED",
    name: "Thông báo lịch làm việc tuần mới",
    subject: "[Ăn Vặt BLOAN] Lịch làm việc tuần mới đã được công bố",
    variables: ["{{fullName}}", "{{weekRange}}", "{{storeName}}", "{{shiftCount}}"],
    lastUpdated: "04/10/2026",
    enabled: true,
    content: `Chào {{fullName}},

Lịch làm việc của bạn tại cửa hàng {{storeName}} trong tuần {{weekRange}} đã được Trưởng cửa hàng phê duyệt.
- Tổng số ca phân bổ: {{shiftCount}} ca.

Vui lòng truy cập ứng dụng di động hoặc cổng Web để kiểm tra chi tiết từng ca và điểm danh đúng giờ!

Ăn Vặt BLOAN.`,
  },
  {
    id: "tpl_3",
    code: "VIOLATION_PENALTY_NOTICE",
    name: "Thông báo biên bản vi phạm kỷ luật",
    subject: "[Ăn Vặt BLOAN] Thông báo ghi nhận vi phạm quy chế làm việc",
    variables: ["{{fullName}}", "{{ticketCode}}", "{{violationType}}", "{{penaltyAmount}}", "{{date}}"],
    lastUpdated: "01/10/2026",
    enabled: true,
    content: `Chào {{fullName}},

Hệ thống ghi nhận biên bản vi phạm mã số {{ticketCode}}:
- Hành vi: {{violationType}}
- Thời gian: {{date}}
- Mức khấu trừ dự kiến: {{penaltyAmount}}

Nếu có bất kỳ thắc mắc hoặc giải trình, vui lòng gửi phản hồi trên hệ thống trong vòng 24 giờ kể từ khi nhận được email này.

Phòng Nhân Sự BLOAN.`,
  },
  {
    id: "tpl_4",
    code: "MONTHLY_PAYSLIP_DELIVERY",
    name: "Gửi phiếu lương quyết toán tháng",
    subject: "[Ăn Vặt BLOAN] Phiếu quyết toán thu nhập & lương tháng {{monthYear}}",
    variables: ["{{fullName}}", "{{monthYear}}", "{{totalShifts}}", "{{netSalary}}"],
    lastUpdated: "28/09/2026",
    enabled: true,
    content: `Chào {{fullName}},

Đính kèm là bảng chi tiết quyết toán thu nhập tháng {{monthYear}} của bạn tại Ăn Vặt BLOAN:
- Tổng số ca hoàn thành: {{totalShifts}} ca
- Thực nhận sau trừ thuế/phạt: {{netSalary}}

Tiền lương sẽ được chuyển khoản vào tài khoản ngân hàng đã đăng ký trước ngày 05 hàng tháng.

Phòng Kế Toán Ăn Vặt BLOAN.`,
  },
];

// ==========================================
// 2. ĐỊNH NGHĨA DỮ LIỆU MẪU THÔNG BÁO RIÊNG (IN-APP)
// ==========================================
export interface NotificationTemplate {
  id: string;
  code: string;
  name: string;
  title: string;
  message: string;
  type: "CA_LAM" | "CHAM_CONG" | "LUONG" | "NOI_QUY" | "KHAN_CAP";
  priority: "NORMAL" | "HIGH" | "URGENT";
  variables: string[];
  lastUpdated: string;
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "notif_1",
    code: "NOTIF_SHIFT_REMINDER",
    name: "Nhắc nhở ca làm việc sắp diễn ra",
    title: "Nhắc nhở: Sắp tới giờ ca làm việc!",
    message: "Chào {{fullName}}, bạn có ca {{shiftName}} tại {{storeName}} bắt đầu lúc {{startTime}}. Vui lòng đến trước 10 phút để chuẩn bị và chấm công FaceID.",
    type: "CA_LAM",
    priority: "HIGH",
    variables: ["{{fullName}}", "{{shiftName}}", "{{storeName}}", "{{startTime}}"],
    lastUpdated: "08/10/2026",
  },
  {
    id: "notif_2",
    code: "NOTIF_LEAVE_APPROVED",
    name: "Kết quả duyệt đơn xin nghỉ phép",
    title: "Đơn xin nghỉ phép của bạn đã được duyệt",
    message: "Đơn xin nghỉ ngày {{leaveDate}} của bạn đã được Quản lý {{managerName}} phê duyệt. Ca làm việc đã được bố trí người thay thế.",
    type: "CA_LAM",
    priority: "NORMAL",
    variables: ["{{fullName}}", "{{leaveDate}}", "{{managerName}}"],
    lastUpdated: "05/10/2026",
  },
  {
    id: "notif_3",
    code: "NOTIF_SWAP_REQUEST",
    name: "Yêu cầu đổi ca từ đồng nghiệp",
    title: "Đồng nghiệp đề xuất đổi ca làm việc",
    message: "Nhân viên {{senderName}} gửi yêu cầu đổi ca {{senderShift}} sang ca {{targetShift}} ngày {{date}}. Vui lòng vào ứng dụng để phản hồi.",
    type: "CA_LAM",
    priority: "HIGH",
    variables: ["{{fullName}}", "{{senderName}}", "{{senderShift}}", "{{targetShift}}", "{{date}}"],
    lastUpdated: "06/10/2026",
  },
  {
    id: "notif_4",
    code: "NOTIF_VIOLATION_TICKET",
    name: "Ghi nhận biên bản vi phạm kỷ luật",
    title: "Thông báo biên bản vi phạm kỷ luật",
    message: "Ghi nhận biên bản số {{ticketCode}}: Lỗi '{{violationType}}'. Mức khấu trừ dự kiến: {{penaltyAmount}}. Vui lòng liên hệ Quản lý nếu cần giải trình.",
    type: "NOI_QUY",
    priority: "URGENT",
    variables: ["{{fullName}}", "{{ticketCode}}", "{{violationType}}", "{{penaltyAmount}}"],
    lastUpdated: "02/10/2026",
  },
  {
    id: "notif_5",
    code: "NOTIF_PAYROLL_READY",
    name: "Phiếu lương tháng đã phát hành",
    title: "Phiếu lương tháng {{monthYear}} đã sẵn sàng",
    message: "Phiếu lương tháng {{monthYear}} của bạn đã được đối soát hoàn tất với số tiền thực nhận {{netSalary}}. Mở ứng dụng để xem chi tiết.",
    type: "LUONG",
    priority: "NORMAL",
    variables: ["{{fullName}}", "{{monthYear}}", "{{netSalary}}"],
    lastUpdated: "01/10/2026",
  },
  {
    id: "notif_6",
    code: "NOTIF_ANNOUNCEMENT",
    name: "Thông báo khẩn cấp từ Ban Điều Hành",
    title: "[KHẨN CẤP] {{announcementTitle}}",
    message: "{{announcementContent}} - Vui lòng tuân thủ hướng dẫn từ Ban Quản Lý cửa hàng.",
    type: "KHAN_CAP",
    priority: "URGENT",
    variables: ["{{announcementTitle}}", "{{announcementContent}}"],
    lastUpdated: "10/10/2026",
  },
];

export const MOCK_LOGS = [
  { recipient: "mai.lt@bloan.vn", type: "EMAIL", template: "Lịch làm việc tuần mới", subject: "[Ăn Vặt BLOAN] Lịch làm việc tuần...", time: "16:42 · 05/10", status: "ĐÃ GỬI" },
  { recipient: "hoan33356@gmail.com", type: "EMAIL", template: "Kích hoạt tài khoản", subject: "[Ăn Vặt BLOAN] Kích hoạt tài khoản...", time: "16:30 · 05/10", status: "ĐÃ GỬI" },
  { recipient: "Nguyễn Văn An (NV-102)", type: "APP_NOTIF", template: "Nhắc nhở ca làm việc", subject: "Nhắc nhở: Sắp tới giờ ca làm việc!", time: "15:20 · 05/10", status: "ĐÃ ĐỌC" },
  { recipient: "khanh.lq@bloan.vn", type: "EMAIL", template: "Biên bản vi phạm", subject: "[Ăn Vặt BLOAN] Ghi nhận vi phạm...", time: "15:10 · 05/10", status: "ĐÃ GỬI" },
  { recipient: "Trần Thu Hằng (NV-204)", type: "APP_NOTIF", template: "Duyệt đơn nghỉ phép", subject: "Đơn xin nghỉ phép của bạn đã được duyệt", time: "11:30 · 05/10", status: "ĐÃ ĐỌC" },
  { recipient: "nam.tv@bloan.vn", type: "EMAIL", template: "Phiếu quyết toán tháng", subject: "[Ăn Vặt BLOAN] Phiếu quyết toán...", time: "10:05 · 05/10", status: "ĐÃ MỞ" },
];
