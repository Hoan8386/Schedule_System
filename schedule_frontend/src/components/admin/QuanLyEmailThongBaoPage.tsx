"use client";

import React, { useState } from "react";
import {
  Mail,
  Server,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  Info,
  BellRing,
  HelpCircle,
  Tag,
  Sparkles,
} from "lucide-react";

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

const initialEmailTemplates: EmailTemplate[] = [
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

const initialNotificationTemplates: NotificationTemplate[] = [
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

const mockLogs = [
  { recipient: "mai.lt@bloan.vn", type: "EMAIL", template: "Lịch làm việc tuần mới", subject: "[Ăn Vặt BLOAN] Lịch làm việc tuần...", time: "16:42 · 05/10", status: "ĐÃ GỬI" },
  { recipient: "hoan33356@gmail.com", type: "EMAIL", template: "Kích hoạt tài khoản", subject: "[Ăn Vặt BLOAN] Kích hoạt tài khoản...", time: "16:30 · 05/10", status: "ĐÃ GỬI" },
  { recipient: "Nguyễn Văn An (NV-102)", type: "APP_NOTIF", template: "Nhắc nhở ca làm việc", subject: "Nhắc nhở: Sắp tới giờ ca làm việc!", time: "15:20 · 05/10", status: "ĐÃ ĐỌC" },
  { recipient: "khanh.lq@bloan.vn", type: "EMAIL", template: "Biên bản vi phạm", subject: "[Ăn Vặt BLOAN] Ghi nhận vi phạm...", time: "15:10 · 05/10", status: "ĐÃ GỬI" },
  { recipient: "Trần Thu Hằng (NV-204)", type: "APP_NOTIF", template: "Duyệt đơn nghỉ phép", subject: "Đơn xin nghỉ phép của bạn đã được duyệt", time: "11:30 · 05/10", status: "ĐÃ ĐỌC" },
  { recipient: "nam.tv@bloan.vn", type: "EMAIL", template: "Phiếu quyết toán tháng", subject: "[Ăn Vặt BLOAN] Phiếu quyết toán...", time: "10:05 · 05/10", status: "ĐÃ MỞ" },
];

export default function QuanLyEmailThongBaoPage() {
  const [activeTab, setActiveTab] = useState<"email_templates" | "notif_templates" | "smtp" | "logs">("email_templates");

  // State Mẫu Email
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(initialEmailTemplates);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<EmailTemplate>(initialEmailTemplates[0]);

  // State Mẫu Thông Báo Riêng
  const [notifTemplates, setNotifTemplates] = useState<NotificationTemplate[]>(initialNotificationTemplates);
  const [selectedNotifTemplate, setSelectedNotifTemplate] = useState<NotificationTemplate>(initialNotificationTemplates[0]);

  // State Cấu hình SMTP
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("noreply@anvatbloan.vn");
  const [smtpPassword, setSmtpPassword] = useState("••••••••••••••••");
  const [senderName, setSenderName] = useState("Ăn Vặt BLOAN - Quản Lý Nhân Sự");
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);

  const handleTestSmtp = () => {
    setIsTestingSmtp(true);
    setTimeout(() => {
      setIsTestingSmtp(false);
      alert("Kết nối máy chủ SMTP thành công! Email kiểm tra đã được gửi đến: cskh@anvatbloan.vn");
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-lg">
              ADMIN CENTER
            </span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-700 text-xs font-bold">Kênh liên lạc & Thông báo</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Quản lý thông báo & Email hệ thống
            </h1>
            <div className="relative group">
              <button
                type="button"
                className="w-6 h-6 rounded-full bg-slate-200 hover:bg-amber-100 text-slate-700 hover:text-amber-800 flex items-center justify-center font-bold transition-all cursor-help border border-slate-300 shadow-2xs"
                title="Thông tin hệ thống Email & Thông báo"
              >
                <Info className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <div className="absolute left-0 top-8 z-40 hidden group-hover:block w-80 p-3.5 bg-slate-900 text-white rounded-xl shadow-2xl transition-all pointer-events-none border border-slate-700">
                <p className="text-slate-200 text-xs leading-relaxed font-medium">
                  Cấu hình mẫu thư điện tử tự động, mẫu thông báo ứng dụng và thiết lập máy chủ kết nối SMTP an toàn.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Thông báo điều hướng sang Người Quản Lý */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-3.5 py-2 text-xs font-bold text-amber-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Chức năng phát thông báo tới nhân sự đã được chuyển giao cho Cấp Quản Lý vận hành.</span>
        </div>
      </div>

      {/* 4 Thẻ Thống Kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700">Email đã gửi tháng này</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              4,280
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
            <Mail className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700">Mẫu Email hệ thống</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              {emailTemplates.length} Mẫu
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 border border-blue-200">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700">Mẫu Thông báo riêng</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              {notifTemplates.length} Mẫu
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 border border-purple-200">
            <BellRing className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700">Máy chủ SMTP</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 tracking-tight">
              ĐÃ KẾT NỐI
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
            <Server className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("email_templates")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "email_templates"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Mẫu Email tự động ({emailTemplates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("notif_templates")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "notif_templates"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Mẫu Thông báo riêng (In-App) ({notifTemplates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("smtp")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "smtp"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Cấu hình SMTP Server</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "logs"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Lịch sử gửi thư & thông báo</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: MẪU EMAIL TỰ ĐỘNG (DANH MỤC TRONG DROPDOWN)             */}
      {/* ============================================================== */}
      {activeTab === "email_templates" ? (
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-6 space-y-5">
          {/* Thanh Dropdown chọn mẫu thư tự động */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <label className="text-xs font-black text-slate-800 whitespace-nowrap">
                Chọn mẫu thư tự động:
              </label>
              <select
                value={selectedEmailTemplate.id}
                onChange={(e) => {
                  const found = emailTemplates.find((t) => t.id === e.target.value);
                  if (found) setSelectedEmailTemplate(found);
                }}
                className="w-full sm:max-w-md px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs outline-hidden focus:border-amber-500 cursor-pointer"
              >
                {emailTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} — [{tpl.code}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg">
                Mã: {selectedEmailTemplate.code}
              </span>
              <button
                onClick={() => alert(`Đã lưu nội dung mẫu email "${selectedEmailTemplate.name}" thành công!`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Lưu mẫu email</span>
              </button>
            </div>
          </div>

          {/* Form chỉnh sửa mẫu email */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Tiêu đề thư điện tử (Email Subject) *
              </label>
              <input
                type="text"
                value={selectedEmailTemplate.subject}
                onChange={(e) =>
                  setSelectedEmailTemplate({ ...selectedEmailTemplate, subject: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Các biến số hỗ trợ (Nhấn để chèn vào nội dung):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {selectedEmailTemplate.variables.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setSelectedEmailTemplate({
                        ...selectedEmailTemplate,
                        content: selectedEmailTemplate.content + " " + v,
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 font-mono text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Nội dung thư điện tử (HTML / Text Body):
              </label>
              <textarea
                rows={11}
                value={selectedEmailTemplate.content}
                onChange={(e) =>
                  setSelectedEmailTemplate({ ...selectedEmailTemplate, content: e.target.value })
                }
                className="w-full p-3.5 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 outline-hidden focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      ) : activeTab === "notif_templates" ? (
        /* ============================================================== */
        /* TAB 2: MẪU THÔNG BÁO RIÊNG (IN-APP NOTIFICATIONS)               */
        /* ============================================================== */
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-6 space-y-5">
          {/* Thanh Dropdown chọn mẫu thông báo riêng */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <label className="text-xs font-black text-slate-800 whitespace-nowrap">
                Chọn mẫu thông báo riêng:
              </label>
              <select
                value={selectedNotifTemplate.id}
                onChange={(e) => {
                  const found = notifTemplates.find((t) => t.id === e.target.value);
                  if (found) setSelectedNotifTemplate(found);
                }}
                className="w-full sm:max-w-md px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs outline-hidden focus:border-amber-500 cursor-pointer"
              >
                {notifTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} — [{tpl.code}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-purple-900 bg-purple-100 border border-purple-300 px-2.5 py-1 rounded-lg">
                Mã: {selectedNotifTemplate.code}
              </span>
              <button
                onClick={() => alert(`Đã lưu nội dung mẫu thông báo "${selectedNotifTemplate.name}" thành công!`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Lưu mẫu thông báo</span>
              </button>
            </div>
          </div>

          {/* Form cấu hình mẫu thông báo riêng */}
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Mức độ ưu tiên thông báo *</label>
                <select
                  value={selectedNotifTemplate.priority}
                  onChange={(e) =>
                    setSelectedNotifTemplate({
                      ...selectedNotifTemplate,
                      priority: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 bg-white outline-hidden focus:border-amber-500"
                >
                  <option value="NORMAL">Thông thường (Chuông nhẹ)</option>
                  <option value="HIGH">Quan trọng (Banner nổi)</option>
                  <option value="URGENT">Khẩn cấp (Rung chuông & Pop-up)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Phân loại nghiệp vụ *</label>
                <select
                  value={selectedNotifTemplate.type}
                  onChange={(e) =>
                    setSelectedNotifTemplate({
                      ...selectedNotifTemplate,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 bg-white outline-hidden focus:border-amber-500"
                >
                  <option value="CA_LAM">Lịch làm việc & Ca trực</option>
                  <option value="CHAM_CONG">Chấm công & Điểm danh</option>
                  <option value="LUONG">Lương & Thưởng</option>
                  <option value="NOI_QUY">Nội quy & Kỷ luật</option>
                  <option value="KHAN_CAP">Khẩn cấp toàn hệ thống</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Tiêu đề thông báo hiển thị trên ứng dụng (In-app Title) *
              </label>
              <input
                type="text"
                value={selectedNotifTemplate.title}
                onChange={(e) =>
                  setSelectedNotifTemplate({ ...selectedNotifTemplate, title: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Các biến số hỗ trợ (Nhấn để chèn):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {selectedNotifTemplate.variables.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setSelectedNotifTemplate({
                        ...selectedNotifTemplate,
                        message: selectedNotifTemplate.message + " " + v,
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-900 font-mono text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Nội dung thông báo chi tiết (In-app Message Content):
              </label>
              <textarea
                rows={5}
                value={selectedNotifTemplate.message}
                onChange={(e) =>
                  setSelectedNotifTemplate({ ...selectedNotifTemplate, message: e.target.value })
                }
                className="w-full p-3.5 border border-slate-300 rounded-xl font-medium text-xs text-slate-900 outline-hidden focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      ) : activeTab === "smtp" ? (
        /* ============================================================== */
        /* TAB 3: SMTP CONFIG (CÓ THÊM CHỮ I HƯỚNG DẪN NGƯỜI DÙNG)        */
        /* ============================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-300 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold border border-blue-200">
                <Server className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Cấu hình máy chủ gửi Email (SMTP Settings)</h3>
                <div className="relative group">
                  <button
                    type="button"
                    className="w-5 h-5 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 flex items-center justify-center font-bold text-[11px] border border-slate-300 cursor-help"
                  >
                    <Info className="w-3 h-3 stroke-[2.5]" />
                  </button>
                  <div className="absolute left-0 top-6 z-30 hidden group-hover:block w-72 p-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs pointer-events-none">
                    <p className="font-bold text-amber-400 mb-0.5">Thông số SMTP:</p>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Hệ thống Spring Boot sử dụng giao thức JavaMailSender để gửi thư tự động qua tài khoản doanh nghiệp.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="font-bold text-slate-800">SMTP Host *</label>
                  <div className="relative group">
                    <button type="button" className="text-slate-500 hover:text-amber-700 cursor-help">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute left-0 bottom-6 z-30 hidden group-hover:block w-64 p-2.5 bg-slate-900 text-white rounded-xl text-[11px]">
                      Ví dụ: <strong>smtp.gmail.com</strong> (Google) hoặc <strong>smtp.office365.com</strong> (Outlook).
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-bold text-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="font-bold text-slate-800">Cổng (Port) *</label>
                  <div className="relative group">
                    <button type="button" className="text-slate-500 hover:text-amber-700 cursor-help">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute right-0 bottom-6 z-30 hidden group-hover:block w-64 p-2.5 bg-slate-900 text-white rounded-xl text-[11px]">
                      Cổng <strong>587</strong> hỗ trợ mã hóa TLS/STARTTLS. Cổng <strong>465</strong> hỗ trợ SSL.
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Tài khoản SMTP (Email gửi) *</label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-bold text-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="font-bold text-slate-800">Mật khẩu ứng dụng (App Password) *</label>
                  <div className="relative group">
                    <button type="button" className="text-amber-700 hover:text-amber-900 cursor-help">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute right-0 bottom-6 z-30 hidden group-hover:block w-72 p-3 bg-slate-900 text-white rounded-xl text-[11px] leading-relaxed">
                      <p className="font-bold text-amber-400 mb-1">Lưu ý quan trọng:</p>
                      Không dùng mật khẩu đăng nhập email thông thường! Hãy tạo mã 16 ký tự trong mục <em>Mật khẩu ứng dụng</em> của tài khoản Google/Microsoft.
                    </div>
                  </div>
                </div>
                <input
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-bold text-slate-800 block mb-1">Tên hiển thị người gửi (Sender Display Name)</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-bold text-slate-900"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={handleTestSmtp}
                disabled={isTestingSmtp}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                <span>{isTestingSmtp ? "Đang gửi thử..." : "Gửi Email kiểm tra (Test SMTP)"}</span>
              </button>

              <button
                onClick={() => alert("Đã lưu thiết lập kết nối SMTP thành công!")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Lưu thông số SMTP</span>
              </button>
            </div>
          </div>

          {/* Hộp hướng dẫn bên phải */}
          <div className="lg:col-span-4 bg-amber-50/60 rounded-2xl border border-amber-200 p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-black">
              <Info className="w-4 h-4 text-amber-700 stroke-[2.5]" />
              <span>Hướng dẫn lấy App Password Gmail</span>
            </div>
            <ol className="list-decimal pl-4 space-y-2 text-slate-700 font-medium leading-relaxed">
              <li>Đăng nhập tài khoản Google của doanh nghiệp.</li>
              <li>Truy cập <strong>Quản lý Tài khoản Google → Bảo mật</strong>.</li>
              <li>Bật <strong>Xác minh 2 bước (2-Step Verification)</strong>.</li>
              <li>Tìm mục <strong>Mật khẩu ứng dụng (App passwords)</strong>.</li>
              <li>Đặt tên ứng dụng (vd: <em>BLOAN System</em>) và nhấn <strong>Tạo</strong>.</li>
              <li>Sao chép mã 16 chữ số được cấp và dán vào ô mật khẩu bên cạnh.</li>
            </ol>
            <div className="p-3 bg-white rounded-xl border border-amber-300 text-[11px] text-amber-950 font-bold mt-2">
              💡 Cổng mặc định khuyến nghị: Host <code>smtp.gmail.com</code> và Port <code>587</code>.
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* TAB 4: NHẬT KÝ GỬI THƯ & THÔNG BÁO                             */
        /* ============================================================== */
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Nhật ký phát thư & thông báo (Notification Logs)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs font-black text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  <th className="px-5 py-3.5">Người nhận</th>
                  <th className="px-5 py-3.5">Kênh gửi</th>
                  <th className="px-5 py-3.5">Mẫu thư / Thông báo</th>
                  <th className="px-5 py-3.5">Tiêu đề</th>
                  <th className="px-5 py-3.5">Thời gian</th>
                  <th className="px-5 py-3.5 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {mockLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{log.recipient}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                        log.type === "EMAIL"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-purple-100 text-purple-800 border-purple-200"
                      }`}>
                        {log.type === "EMAIL" ? "Email SMTP" : "App Notif"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">{log.template}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-semibold">{log.subject}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono">{log.time}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
