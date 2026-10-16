import React, { useState } from "react";
import { Check, Info, Play, Server } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-slate-900 outline-hidden focus:border-brand-500";

/** Biểu tượng "i" có tooltip khi rê chuột. */
function Hint({ children, align = "left", width = "w-64" }: { children: React.ReactNode; align?: "left" | "right"; width?: string }) {
  return (
    <div className="group relative">
      <button type="button" className="cursor-help text-slate-500 hover:text-brand-700">
        <Info className="h-3.5 w-3.5" />
      </button>
      <div className={`absolute bottom-6 z-30 hidden ${width} rounded-xl bg-slate-900 p-2.5 text-[11px] leading-relaxed text-white group-hover:block ${align === "left" ? "left-0" : "right-0"}`}>
        {children}
      </div>
    </div>
  );
}

/** Cấu hình máy chủ SMTP gửi email và hướng dẫn lấy App Password. */
export function SmtpTab() {
  const [settings, setSettings] = useState({
    host: "smtp.gmail.com",
    port: "587",
    user: "noreply@anvatbloan.vn",
    password: "••••••••••••••••",
    senderName: "Ăn Vặt BLOAN - Quản Lý Nhân Sự",
  });
  const [testing, setTesting] = useState(false);
  const set = (key: keyof typeof settings) => (event: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, [key]: event.target.value });

  const test = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      alert("Kết nối máy chủ SMTP thành công! Email kiểm tra đã được gửi đến: cskh@anvatbloan.vn");
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-4 rounded-2xl border border-slate-300 bg-surface p-6 shadow-xs lg:col-span-8">
        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 bg-blue-100 font-bold text-blue-800">
            <Server className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Cấu hình máy chủ gửi Email (SMTP Settings)</h3>
          <Hint width="w-72">
            <p className="mb-0.5 font-bold text-brand-400">Thông số SMTP:</p>
            Hệ thống Spring Boot sử dụng giao thức JavaMailSender để gửi thư tự động qua tài khoản doanh nghiệp.
          </Hint>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <label className="font-bold text-slate-800">SMTP Host *</label>
              <Hint>
                Ví dụ: <strong>smtp.gmail.com</strong> (Google) hoặc <strong>smtp.office365.com</strong> (Outlook).
              </Hint>
            </div>
            <input type="text" value={settings.host} onChange={set("host")} className={inputClass} />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <label className="font-bold text-slate-800">Cổng (Port) *</label>
              <Hint align="right">
                Cổng <strong>587</strong> hỗ trợ mã hóa TLS/STARTTLS. Cổng <strong>465</strong> hỗ trợ SSL.
              </Hint>
            </div>
            <input type="text" value={settings.port} onChange={set("port")} className={`${inputClass} font-mono`} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="mb-1 block font-bold text-slate-800">Tài khoản SMTP (Email gửi) *</label>
            <input type="email" value={settings.user} onChange={set("user")} className={inputClass} />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <label className="font-bold text-slate-800">Mật khẩu ứng dụng (App Password) *</label>
              <Hint align="right" width="w-72">
                <p className="mb-1 font-bold text-brand-400">Lưu ý quan trọng:</p>
                Không dùng mật khẩu đăng nhập email thông thường! Hãy tạo mã 16 ký tự trong mục <em>Mật khẩu ứng dụng</em> của tài khoản Google/Microsoft.
              </Hint>
            </div>
            <input type="password" value={settings.password} onChange={set("password")} className={`${inputClass} font-mono`} />
          </div>
        </div>

        <div className="text-xs">
          <label className="mb-1 block font-bold text-slate-800">Tên hiển thị người gửi (Sender Display Name)</label>
          <input type="text" value={settings.senderName} onChange={set("senderName")} className={inputClass} />
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <button onClick={test} disabled={testing} className="btn btn-secondary">
            <Play className="h-3.5 w-3.5 fill-brand-600 text-brand-600" />
            <span>{testing ? "Đang gửi thử..." : "Gửi Email kiểm tra (Test SMTP)"}</span>
          </button>
          <button onClick={() => alert("Đã lưu thiết lập kết nối SMTP thành công!")} className="btn btn-primary px-5">
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Lưu thông số SMTP</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 text-xs lg:col-span-4">
        <div className="flex items-center gap-2 font-black text-brand-900">
          <Info className="h-4 w-4 stroke-[2.5] text-brand-700" />
          <span>Hướng dẫn lấy App Password Gmail</span>
        </div>
        <ol className="list-decimal space-y-2 pl-4 font-medium leading-relaxed text-slate-700">
          <li>Đăng nhập tài khoản Google của doanh nghiệp.</li>
          <li>Truy cập <strong>Quản lý Tài khoản Google → Bảo mật</strong>.</li>
          <li>Bật <strong>Xác minh 2 bước (2-Step Verification)</strong>.</li>
          <li>Tìm mục <strong>Mật khẩu ứng dụng (App passwords)</strong>.</li>
          <li>Đặt tên ứng dụng (vd: <em>BLOAN System</em>) và nhấn <strong>Tạo</strong>.</li>
          <li>Sao chép mã 16 chữ số được cấp và dán vào ô mật khẩu bên cạnh.</li>
        </ol>
        <div className="mt-2 rounded-xl border border-brand-300 bg-white p-3 text-[11px] font-bold text-brand-950">
          💡 Cổng mặc định khuyến nghị: Host <code>smtp.gmail.com</code> và Port <code>587</code>.
        </div>
      </div>
    </div>
  );
}
