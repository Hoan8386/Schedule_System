"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  Server,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Plus,
  Eye,
  Sliders,
  BellRing,
  Check,
} from "lucide-react";

interface EmailTemplate {
  id: string;
  code: string;
  name: string;
  subject: string;
  variables: string[];
  lastUpdated: string;
  enabled: boolean;
  content: string;
}

const initialTemplates: EmailTemplate[] = [
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

const mockLogs = [
  { recipient: "mai.lt@bloan.vn", template: "Lịch làm việc tuần mới", subject: "[Ăn Vặt BLOAN] Lịch làm việc tuần...", time: "16:42 · 05/10", status: "ĐÃ GỬI" },
  { recipient: "hoan33356@gmail.com", template: "Kích hoạt tài khoản", subject: "[Ăn Vặt BLOAN] Kích hoạt tài khoản...", time: "16:30 · 05/10", status: "ĐÃ GỬI" },
  { recipient: "khanh.lq@bloan.vn", template: "Biên bản vi phạm", subject: "[Ăn Vặt BLOAN] Thông báo ghi nhận...", time: "15:10 · 05/10", status: "ĐÃ GỬI" },
  { recipient: "nam.tv@bloan.vn", template: "Phiếu quyết toán tháng", subject: "[Ăn Vặt BLOAN] Phiếu quyết toán...", time: "10:05 · 05/10", status: "ĐÃ MỞ" },
];

export default function QuanLyEmailThongBaoPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "smtp" | "broadcast" | "logs">("templates");
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(initialTemplates[0]);

  // SMTP state
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("noreply@anvatbloan.vn");
  const [smtpPassword, setSmtpPassword] = useState("••••••••••••••••");
  const [senderName, setSenderName] = useState("Ăn Vặt BLOAN - Quản Lý Nhân Sự");
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);

  // Broadcast state
  const [broadcastTarget, setBroadcastTarget] = useState("ALL_EMPLOYEES");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sendChannels, setSendChannels] = useState({ email: true, app: true, zalo: false });

  const handleTestSmtp = () => {
    setIsTestingSmtp(true);
    setTimeout(() => {
      setIsTestingSmtp(false);
      alert("Kết nối máy chủ SMTP thành công! Email kiểm tra đã được gửi đến: hoan33356@gmail.com");
    }, 1000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      alert("Vui lòng điền tiêu đề và nội dung thông báo!");
      return;
    }
    alert(`Đã phát thông báo khẩn cấp đến toàn chuỗi thành công qua Email và Ứng dụng!`);
    setBroadcastTitle("");
    setBroadcastMessage("");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
              ADMIN CENTER
            </span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-500 text-xs font-semibold">Kênh liên lạc & Email</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            Quản lý thông báo & Hệ thống gửi Email
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cấu hình mẫu thư điện tử tự động, thiết lập máy chủ SMTP và phát thông báo khẩn cấp toàn hệ thống Ăn Vặt BLOAN.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab("broadcast")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
          >
            <Send className="w-4 h-4" />
            <span>Phát thông báo khẩn cấp</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Email đã gửi tháng này</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              4,280
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">99.4% Đã nhận thành công</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Mẫu Email hệ thống</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {templates.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Tự động kích hoạt theo sự kiện</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Máy chủ SMTP</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 tracking-tight">
              ĐÃ KẾT NỐI
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">{smtpHost}:{smtpPort}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Thông báo phát toàn chuỗi</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              12
            </div>
            <p className="text-[11px] text-amber-700 mt-1 font-semibold">Tất cả nhân sự đã đọc</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("templates")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "templates"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mẫu Email hệ thống ({templates.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("smtp")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "smtp"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Cấu hình SMTP Server</span>
        </button>
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "broadcast"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Phát thông báo toàn hệ thống</span>
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "logs"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Lịch sử gửi thư</span>
        </button>
      </div>

      {activeTab === "templates" ? (
        /* TAB 1: EMAIL TEMPLATES */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of templates (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Danh mục mẫu thư tự động</h3>
              <p className="text-[11px] text-slate-400">Chọn mẫu để chỉnh sửa nội dung và biến động</p>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                    selectedTemplate.id === tpl.id ? "bg-amber-50/40 border-l-4 border-l-amber-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{tpl.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{tpl.code}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1 truncate">{tpl.subject}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {tpl.variables.length} biến số
                    </span>
                    <span className="text-[10px] text-slate-400">Cập nhật: {tpl.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor & Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Chỉnh sửa mẫu: {selectedTemplate.name}</h3>
                <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                  {selectedTemplate.code}
                </span>
              </div>
              <button
                onClick={() => alert(`Đã lưu nội dung mẫu "${selectedTemplate.name}"!`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Lưu mẫu email</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu đề thư (Email Subject) *</label>
                <input
                  type="text"
                  value={selectedTemplate.subject}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Các biến số hỗ trợ (Nhấn để chèn):</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.variables.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          content: selectedTemplate.content + " " + v,
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-mono text-[11px] font-bold transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung thư điện tử (Body text/HTML):</label>
                <textarea
                  rows={10}
                  value={selectedTemplate.content}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, content: e.target.value })
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 outline-hidden focus:border-amber-400 leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "smtp" ? (
        /* TAB 2: SMTP CONFIG */
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Cấu hình máy chủ gửi Email (SMTP Settings)</h3>
              <p className="text-[11px] text-slate-400">Thông số kết nối Spring Boot JavaMailSender</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">SMTP Host</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Cổng (Port)</label>
              <input
                type="text"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tài khoản SMTP (Email gửi)</label>
              <input
                type="email"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mật khẩu ứng dụng (App Password)</label>
              <input
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">Tên hiển thị người gửi (Sender Display Name)</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleTestSmtp}
              disabled={isTestingSmtp}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>{isTestingSmtp ? "Đang gửi thử..." : "Gửi Email kiểm tra (Test SMTP)"}</span>
            </button>
            <button
              onClick={() => alert("Đã lưu thiết lập kết nối SMTP thành công!")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs shadow-xs"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Lưu thông số SMTP</span>
            </button>
          </div>
        </div>
      ) : activeTab === "broadcast" ? (
        /* TAB 3: BROADCAST NOTIFICATIONS */
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Soạn thông báo khẩn cấp toàn hệ thống</h3>
              <p className="text-[11px] text-slate-400">Tin nhắn sẽ được gửi tức thì qua Email và Thông báo trong ứng dụng</p>
            </div>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Đối tượng nhận thông báo:</label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium bg-white"
              >
                <option value="ALL_EMPLOYEES">Tất cả nhân sự toàn hệ thống (1,248 nhân sự)</option>
                <option value="ALL_STORE_MANAGERS">Chỉ Trưởng cửa hàng & Quản lý (24 người)</option>
                <option value="HCM_STORES">Các chi nhánh khu vực TP. Hồ Chí Minh</option>
                <option value="HN_STORES">Các chi nhánh khu vực Hà Nội</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Kênh truyền thông:</label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={sendChannels.email}
                    onChange={(e) => setSendChannels({ ...sendChannels, email: e.target.checked })}
                    className="rounded accent-amber-500"
                  />
                  <span>Hòm thư Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={sendChannels.app}
                    onChange={(e) => setSendChannels({ ...sendChannels, app: e.target.checked })}
                    className="rounded accent-amber-500"
                  />
                  <span>Thông báo ứng dụng (In-app Notification)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={sendChannels.zalo}
                    onChange={(e) => setSendChannels({ ...sendChannels, zalo: e.target.checked })}
                    className="rounded accent-amber-500"
                  />
                  <span>Zalo ZNS</span>
                </label>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tiêu đề thông báo *</label>
              <input
                type="text"
                required
                placeholder="vd: [THÔNG BÁO KHẨN] Điều chỉnh thời gian chốt ca làm việc dịp lễ 20/10"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nội dung chi tiết *</label>
              <textarea
                rows={5}
                required
                placeholder="Nhập nội dung thông báo gửi đến toàn thể nhân sự..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-800"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs transition-all shadow-sm shadow-amber-200"
              >
                <Send className="w-4 h-4" />
                <span>Gửi thông báo tức thì</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* TAB 4: LOGS */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Nhật ký phát thư điện tử (Notification Logs)</h3>
            <p className="text-[11px] text-slate-400">Các lượt gửi thư tự động qua hệ thống</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Người nhận</th>
                  <th className="px-5 py-3">Mẫu thư</th>
                  <th className="px-5 py-3">Tiêu đề</th>
                  <th className="px-5 py-3">Thời gian</th>
                  <th className="px-5 py-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {mockLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-800">{log.recipient}</td>
                    <td className="px-5 py-4 font-medium text-slate-600">{log.template}</td>
                    <td className="px-5 py-4 text-slate-600">{log.subject}</td>
                    <td className="px-5 py-4 text-slate-400">{log.time}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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
