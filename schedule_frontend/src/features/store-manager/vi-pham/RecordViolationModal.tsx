import React, { useState } from "react";
import { X } from "lucide-react";

export interface ViolationReport {
  staffName: string;
  staffCode: string;
  category: string;
  description: string;
  resolution: string;
}

const STAFF = ["Nguyễn Minh Anh · NV024", "Lê Quốc Bảo · NV025", "Phạm Ngọc Linh · NV026", "Đặng Gia Huy · NV027", "Võ Thanh Thảo · NV028"];
const CATEGORIES = ["Chấm công (Đi muộn / Về sớm)", "Tác phong & Đồng phục", "Bàn giao ca chưa chuẩn", "Vệ sinh an toàn thực phẩm", "Thái độ phục vụ khách hàng"];
const RESOLUTIONS = ["Nhắc nhở nội bộ & Rút kinh nghiệm", "Yêu cầu học lại quy trình đào tạo", "Chuyển quản lý cấp cao xem xét"];
const fieldClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium outline-hidden";

function Labeled({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

/** Form lập biên bản vi phạm cho nhân viên. */
export function RecordViolationModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (report: ViolationReport) => void }) {
  const [staff, setStaff] = useState(STAFF[0]);
  // Giữ nguyên giá trị khởi tạo cũ ("Chấm công") để không thay đổi dữ liệu gửi lên
  const [category, setCategory] = useState("Chấm công");
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState("Nhắc nhở nội bộ");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const [staffName, staffCode] = staff.split(" · ");
    onSubmit({ staffName, staffCode, category, description, resolution });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="text-base font-extrabold text-slate-800">Lập biên bản nhân viên</h3>
          <button onClick={onClose} aria-label="Đóng" className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5 text-xs">
          <Labeled label="Nhân viên vi phạm" required>
            <select value={staff} onChange={(event) => setStaff(event.target.value)} className={fieldClass}>
              {STAFF.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Labeled>
          <Labeled label="Phân loại sự việc" required>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}>
              {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Labeled>
          <Labeled label="Nội dung chi tiết sự việc" required>
            <textarea
              rows={3}
              required
              placeholder="Ghi nhận cụ thể thời gian, biểu hiện và diễn biến..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`${fieldClass} resize-none p-3`}
            />
          </Labeled>
          <Labeled label="Hướng xử lý đề xuất">
            <select value={resolution} onChange={(event) => setResolution(event.target.value)} className={fieldClass}>
              {RESOLUTIONS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Labeled>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">Hủy</button>
            <button type="submit" className="btn btn-primary btn-sm px-5">Lưu & Gửi thông báo</button>
          </div>
        </form>
      </div>
    </div>
  );
}
