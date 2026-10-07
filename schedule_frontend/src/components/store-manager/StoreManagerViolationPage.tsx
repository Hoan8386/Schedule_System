"use client";

import React, { useState } from "react";
import {
  FileText,
  Search,
  ClipboardList,
  CheckSquare,
  AlertTriangle,
  X,
  Check,
  Info,
} from "lucide-react";

interface ViolationItem {
  id: string;
  staffName: string;
  staffCode: string;
  title: string;
  shiftDetail: string;
  category: string;
  time: string;
  status: "PENDING_VERIFY" | "PROCESSING" | "COMPLETED";
}

const mockViolations: ViolationItem[] = [
  {
    id: "VP-012",
    staffName: "Nguyễn Minh Anh",
    staffCode: "NV024",
    title: "Đến ca muộn",
    shiftDetail: "Ca sáng · 04/10 · 08:00 – 14:00",
    category: "Chấm công",
    time: "04/10/2026 08:12",
    status: "PENDING_VERIFY",
  },
  {
    id: "VP-013",
    staffName: "Lê Quốc Bảo",
    staffCode: "NV025",
    title: "Thiếu mục bàn giao",
    shiftDetail: "Ca tối · 04/10 · 16:00 – 22:00",
    category: "Bàn giao ca",
    time: "04/10/2026 22:05",
    status: "PENDING_VERIFY",
  },
  {
    id: "VP-011",
    staffName: "Đặng Gia Huy",
    staffCode: "NV027",
    title: "Chưa đủ đồng phục",
    shiftDetail: "Ca sáng · 03/10 · 08:00 – 14:00",
    category: "Tác phong",
    time: "03/10/2026 08:00",
    status: "PROCESSING",
  },
  {
    id: "VP-010",
    staffName: "Võ Thanh Thảo",
    staffCode: "NV028",
    title: "Chưa ký bàn giao",
    shiftDetail: "Ca tối · 02/10 · 16:00 – 22:00",
    category: "Bàn giao ca",
    time: "02/10/2026 22:10",
    status: "COMPLETED",
  },
  {
    id: "VP-009",
    staffName: "Trần Minh Phúc",
    staffCode: "NV029",
    title: "Thiếu mục vệ sinh",
    shiftDetail: "Ca sáng · 01/10 · 08:00 – 14:00",
    category: "Quy trình",
    time: "01/10/2026 13:50",
    status: "COMPLETED",
  },
];

interface StoreManagerViolationPageProps {
  initialTab?: string;
}

export default function StoreManagerViolationPage({
  initialTab,
}: StoreManagerViolationPageProps) {
  const [violations, setViolations] = useState<ViolationItem[]>(mockViolations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(initialTab === "lapbienban");

  // Form states for creating a new report
  const [staff, setStaff] = useState("Nguyễn Minh Anh · NV024");
  const [violationType, setViolationType] = useState("Chấm công");
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState("Nhắc nhở nội bộ");

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newV: ViolationItem = {
      id: `VP-01${violations.length + 1}`,
      staffName: staff.split(" · ")[0],
      staffCode: staff.split(" · ")[1],
      title: description.slice(0, 30) || "Ghi nhận sự việc mới",
      shiftDetail: "Ca hiện tại",
      category: violationType,
      time: "05/10/2026 10:30",
      status: "PROCESSING",
    };
    setViolations([newV, ...violations]);
    setIsRecordModalOpen(false);
    alert("Đã lập biên bản sự việc và gửi thông báo tới nhân viên!");
  };

  const filtered = violations.filter((v) => {
    if (search) {
      const q = search.toLowerCase();
      if (!v.staffName.toLowerCase().includes(q) && !v.id.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (statusFilter !== "all") {
      if (statusFilter === "pending" && v.status !== "PENDING_VERIFY") return false;
      if (statusFilter === "processing" && v.status !== "PROCESSING") return false;
      if (statusFilter === "completed" && v.status !== "COMPLETED") return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Xử lý vi phạm
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận, xác minh và theo dõi sự việc của nhân viên tại BLOAN Nguyễn Trãi.
          </p>
        </div>
        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
        >
          <FileText className="w-4 h-4" />
          <span>Lập biên bản</span>
        </button>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Chờ xác minh
            </span>
            <div className="text-3xl font-black text-slate-800 mt-1">
              2 sự việc
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Cần trao đổi với nhân viên
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Search className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Đang xử lý
            </span>
            <div className="text-3xl font-black text-slate-800 mt-1">
              1 sự việc
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Đã ghi nhận phản hồi
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Đã hoàn tất
            </span>
            <div className="text-3xl font-black text-slate-800 mt-1">
              2 sự việc
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Đã lưu hướng xử lý
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Danh sách sự việc · Tháng 10/2026
          </h3>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm nhân viên hoặc mã sự việc"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden hover:border-slate-300"
              />
            </div>

            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden">
              <option>01/10 – 05/10/2026</option>
              <option>Tháng 09/2026</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác minh</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn tất</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">Nhân viên</th>
                <th className="py-3 px-4">Sự việc</th>
                <th className="py-3 px-4">Phân loại</th>
                <th className="py-3 px-4">Thời điểm</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{v.staffName}</p>
                    <p className="text-[10px] text-slate-400">{v.staffCode}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">
                      {v.id} · {v.title}
                    </p>
                    <p className="text-[11px] text-slate-400">{v.shiftDetail}</p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">
                    {v.category}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{v.time}</td>
                  <td className="py-3.5 px-4">
                    {v.status === "PENDING_VERIFY" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Chờ xác minh
                      </span>
                    )}
                    {v.status === "PROCESSING" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        Đang xử lý
                      </span>
                    )}
                    {v.status === "COMPLETED" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        Hoàn tất
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {v.status === "PENDING_VERIFY" ? (
                      <button
                        onClick={() => alert(`Đang mở biên bản xác minh ${v.id}`)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700"
                      >
                        Xử lý
                      </button>
                    ) : (
                      <button
                        onClick={() => alert(`Xem chi tiết hồ sơ ${v.id}`)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium text-slate-600"
                      >
                        Xem
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị 1–{filtered.length} trong {filtered.length} sự việc</span>
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400">
              Trước
            </button>
            <button className="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 font-bold flex items-center justify-center">
              1
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Info notice footer */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <p>
          Sự việc cần được xác minh và ghi nhận phản hồi trước khi kết luận. Hướng xử lý không tự động tạo khoản phạt hoặc khấu trừ tiền công.
        </p>
      </div>

      {/* Lập biên bản Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800">
                Lập biên bản nhân viên
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  Nhân viên vi phạm <span className="text-red-500">*</span>
                </label>
                <select
                  value={staff}
                  onChange={(e) => setStaff(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
                >
                  <option>Nguyễn Minh Anh · NV024</option>
                  <option>Lê Quốc Bảo · NV025</option>
                  <option>Phạm Ngọc Linh · NV026</option>
                  <option>Đặng Gia Huy · NV027</option>
                  <option>Võ Thanh Thảo · NV028</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  Phân loại sự việc <span className="text-red-500">*</span>
                </label>
                <select
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
                >
                  <option>Chấm công (Đi muộn / Về sớm)</option>
                  <option>Tác phong & Đồng phục</option>
                  <option>Bàn giao ca chưa chuẩn</option>
                  <option>Vệ sinh an toàn thực phẩm</option>
                  <option>Thái độ phục vụ khách hàng</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  Nội dung chi tiết sự việc <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ghi nhận cụ thể thời gian, biểu hiện và diễn biến..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  Hướng xử lý đề xuất
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
                >
                  <option>Nhắc nhở nội bộ & Rút kinh nghiệm</option>
                  <option>Yêu cầu học lại quy trình đào tạo</option>
                  <option>Chuyển quản lý cấp cao xem xét</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-all shadow-xs"
                >
                  Lưu & Gửi thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
