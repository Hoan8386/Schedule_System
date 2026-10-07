"use client";

import React, { useState } from "react";
import {
  Search,
  Check,
  X,
  Info,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface RequestItem {
  id: string;
  type: "REGISTER" | "SWAP" | "CANCEL";
  staffName: string;
  staffCode: string;
  shiftDetail: string;
  reason: string;
  submitTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const mockRequests: RequestItem[] = [
  {
    id: "DK-031",
    type: "REGISTER",
    staffName: "Lê Quốc Bảo",
    staffCode: "NV025",
    shiftDetail: "15/10 · Ca tối (16:00 – 22:00 · 6 giờ)",
    reason: "Đăng ký theo lịch trống",
    submitTime: "Gửi 04/10 · 19:10",
    status: "PENDING",
  },
  {
    id: "DK-032",
    type: "REGISTER",
    staffName: "Võ Thanh Thảo",
    staffCode: "NV028",
    shiftDetail: "17/10 · Ca sáng (08:00 – 14:00 · 6 giờ)",
    reason: "Có thể làm cuối tuần",
    submitTime: "Gửi 05/10 · 07:40",
    status: "PENDING",
  },
  {
    id: "DK-033",
    type: "REGISTER",
    staffName: "Trần Minh Phúc",
    staffCode: "NV029",
    shiftDetail: "18/10 · Ca tối (16:00 – 22:00 · 6 giờ)",
    reason: "Đăng ký ca tuần tới",
    submitTime: "Gửi 05/10 · 08:05",
    status: "PENDING",
  },
  {
    id: "DC-024",
    type: "SWAP",
    staffName: "Nguyễn Minh Anh",
    staffCode: "NV024",
    shiftDetail: "08/10 Ca tối → 09/10 Ca sáng",
    reason: "Trùng lịch học bổ sung chuyên ngành",
    submitTime: "Gửi 04/10 · 20:15",
    status: "PENDING",
  },
  {
    id: "DC-025",
    type: "SWAP",
    staffName: "Lê Quốc Bảo",
    staffCode: "NV025",
    shiftDetail: "10/10 Ca sáng → 10/10 Ca tối",
    reason: "Hỗ trợ đổi ca với NV028",
    submitTime: "Gửi 05/10 · 09:00",
    status: "PENDING",
  },
  {
    id: "HC-018",
    type: "CANCEL",
    staffName: "Phạm Ngọc Linh",
    staffCode: "NV026",
    shiftDetail: "11/10 · Ca tối (16:00 – 22:00)",
    reason: "Có lịch khám sức khỏe định kỳ",
    submitTime: "Gửi 04/10 · 21:00",
    status: "PENDING",
  },
];

export default function StoreManagerShiftRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>(mockRequests);
  const [activeTab, setActiveTab] = useState<"REGISTER" | "SWAP" | "CANCEL">("REGISTER");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
    );
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r))
    );
  };

  const filteredRequests = requests.filter((r) => {
    if (r.type !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.staffName.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (statusFilter !== "all") {
      if (statusFilter === "pending" && r.status !== "PENDING") return false;
      if (statusFilter === "approved" && r.status !== "APPROVED") return false;
      if (statusFilter === "rejected" && r.status !== "REJECTED") return false;
    }
    return true;
  });

  const registerCount = requests.filter((r) => r.type === "REGISTER" && r.status === "PENDING").length;
  const swapCount = requests.filter((r) => r.type === "SWAP" && r.status === "PENDING").length;
  const cancelCount = requests.filter((r) => r.type === "CANCEL" && r.status === "PENDING").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Xử lý yêu cầu ca
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Xem xét đăng ký, đổi và hủy ca của nhân viên tại cửa hàng.
        </p>
      </div>

      {/* Info notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <p>
          Bạn chỉ duyệt yêu cầu của nhân viên thuộc BLOAN Nguyễn Trãi. Đăng ký ca của chính bạn nằm ở mục “Đăng ký ca của tôi”.
        </p>
      </div>

      {/* Main Request Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header & Tabs */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-slate-800">
                Yêu cầu của nhân viên
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                {registerCount + swapCount + cancelCount} yêu cầu chờ duyệt
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setActiveTab("REGISTER")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "REGISTER"
                    ? "bg-amber-500 text-slate-900 shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                Đăng ký ({registerCount})
              </button>
              <button
                onClick={() => setActiveTab("SWAP")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "SWAP"
                    ? "bg-amber-500 text-slate-900 shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                Đổi ca ({swapCount})
              </button>
              <button
                onClick={() => setActiveTab("CANCEL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "CANCEL"
                    ? "bg-amber-500 text-slate-900 shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                Hủy ca ({cancelCount})
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên nhân viên hoặc mã yêu cầu"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden hover:border-slate-300"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-hidden">
              <option>12 – 18/10/2026</option>
              <option>05 – 11/10/2026</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-hidden"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">Nhân viên</th>
                <th className="py-3 px-4">Ca & ngày</th>
                <th className="py-3 px-4">Lý do</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRequests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{r.staffName}</p>
                    <p className="text-[11px] text-slate-400">
                      {r.staffCode} · {r.id}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{r.shiftDetail}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-700">{r.reason}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{r.submitTime}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    {r.status === "PENDING" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Chờ duyệt
                      </span>
                    )}
                    {r.status === "APPROVED" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Đã duyệt
                      </span>
                    )}
                    {r.status === "REJECTED" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                        Từ chối
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {r.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-all shadow-xs"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          className="px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold transition-all"
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] font-medium">
                        Đã hoàn tất
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị 1–{filteredRequests.length} trong {filteredRequests.length} yêu cầu</span>
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

      {/* Lần xử lý gần đây */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Lần xử lý gần đây
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="py-2.5 px-4">Yêu cầu</th>
                <th className="py-2.5 px-4">Nhân viên</th>
                <th className="py-2.5 px-4">Kết quả</th>
                <th className="py-2.5 px-4">Ghi nhận</th>
                <th className="py-2.5 px-4 text-right">Người xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800">
                  DK-030 · 12/10
                </td>
                <td className="py-3 px-4">Nguyễn Minh Anh</td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    Đã duyệt
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500">
                  Ca sáng · Còn sức chứa
                </td>
                <td className="py-3 px-4 text-right">
                  <p className="font-bold text-slate-800">Trần Thu Hà</p>
                  <p className="text-[10px] text-slate-400">04/10 · 17:30</p>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800">
                  HC-017 · 09/10
                </td>
                <td className="py-3 px-4">Võ Thanh Thảo</td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                    Đã từ chối
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500">
                  Cần xác nhận lại phương án bàn giao
                </td>
                <td className="py-3 px-4 text-right">
                  <p className="font-bold text-slate-800">Trần Thu Hà</p>
                  <p className="text-[10px] text-slate-400">04/10 · 16:10</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
