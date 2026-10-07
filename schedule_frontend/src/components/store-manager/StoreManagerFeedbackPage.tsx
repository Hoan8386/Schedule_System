"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  MessageCircle,
  Search,
  CheckCircle2,
  Clock,
  X,
  Send,
  AlertCircle,
} from "lucide-react";

interface FeedbackItem {
  id: string;
  senderName: string;
  senderCode: string;
  title: string;
  content: string;
  shiftDetail: string;
  date: string;
  status: "NEW" | "PROCESSING" | "RESOLVED";
}

const mockEmployeeFeedbacks: FeedbackItem[] = [
  {
    id: "FB-021",
    senderName: "Lê Quốc Bảo",
    senderCode: "NV025",
    title: "Bổ sung dụng cụ cho ca tối",
    content: "Một số kẹp gắp tại quầy đã xuống cấp.",
    shiftDetail: "04/10 · Ca tối (16:00 – 22:00)",
    date: "04/10 22:15",
    status: "PROCESSING",
  },
  {
    id: "FB-022",
    senderName: "Phạm Ngọc Linh",
    senderCode: "NV026",
    title: "Đề xuất lịch nghỉ giữa ca",
    content: "Sắp xếp nghỉ để quầy luôn có người.",
    shiftDetail: "04/10 · Ca sáng (08:00 – 14:00)",
    date: "05/10 08:10",
    status: "NEW",
  },
  {
    id: "FB-020",
    senderName: "Nguyễn Minh Anh",
    senderCode: "NV024",
    title: "Cải thiện mẫu bàn giao",
    content: "Thêm mục kiểm tra hàng tồn đầu ca.",
    shiftDetail: "03/10 · Ca sáng (08:00 – 14:00)",
    date: "03/10 14:10",
    status: "PROCESSING",
  },
  {
    id: "FB-023",
    senderName: "Võ Thanh Thảo",
    senderCode: "NV028",
    title: "Đề xuất bổ sung găng tay",
    content: "Thêm cỡ nhỏ trong kho dụng cụ.",
    shiftDetail: "04/10 · Ca tối (16:00 – 22:00)",
    date: "05/10 07:50",
    status: "NEW",
  },
  {
    id: "FB-019",
    senderName: "Trần Minh Phúc",
    senderCode: "NV029",
    title: "Hướng dẫn vệ sinh cuối ca",
    content: "Đã nhận checklist và hướng dẫn mới.",
    shiftDetail: "01/10 · Ca sáng (08:00 – 14:00)",
    date: "01/10 14:05",
    status: "RESOLVED",
  },
];

interface StoreManagerFeedbackPageProps {
  initialTab?: "nhanvien" | "hethong";
}

export default function StoreManagerFeedbackPage({
  initialTab = "nhanvien",
}: StoreManagerFeedbackPageProps) {
  const [tab, setTab] = useState<"nhanvien" | "hethong">(initialTab);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(mockEmployeeFeedbacks);
  const [search, setSearch] = useState("");
  const [activeItem, setActiveItem] = useState<FeedbackItem | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleResolve = (id: string) => {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "RESOLVED" } : f))
    );
    setActiveItem(null);
    alert("Đã đánh dấu giải quyết và phản hồi tới nhân viên!");
  };

  const newCount = feedbacks.filter((f) => f.status === "NEW").length;
  const processingCount = feedbacks.filter((f) => f.status === "PROCESSING").length;
  const resolvedCount = feedbacks.filter((f) => f.status === "RESOLVED").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          {tab === "nhanvien" ? "Quản lý feedback nhân viên" : "Feedback hệ thống"}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Lắng nghe và phản hồi nhân viên tại chi nhánh BLOAN Nguyễn Trãi.
        </p>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Mới nhận</span>
            <div className="text-3xl font-black text-slate-800 mt-1">
              {newCount} feedback
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Chưa có phản hồi của Trưởng cửa hàng
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Đang xử lý</span>
            <div className="text-3xl font-black text-slate-800 mt-1">
              {processingCount} feedback
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Cần theo dõi hoặc trao đổi thêm
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Đã giải quyết</span>
            <div className="text-3xl font-black text-slate-800 mt-1">
              {resolvedCount} feedback
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Trong kỳ 01 – 05/10/2026</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Feedback List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Danh sách phản hồi
          </h3>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm chủ đề, tên hoặc mã"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
              />
            </div>

            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden">
              <option>01/10 – 05/10/2026</option>
              <option>Tháng 09/2026</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">Người gửi</th>
                <th className="py-3 px-4">Chủ đề & nội dung</th>
                <th className="py-3 px-4">Ca liên quan</th>
                <th className="py-3 px-4">Ngày gửi</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {feedbacks.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{f.senderName}</p>
                    <p className="text-[11px] text-slate-400">
                      {f.senderCode} · {f.id}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{f.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{f.content}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{f.shiftDetail}</td>
                  <td className="py-3.5 px-4 text-slate-500">{f.date}</td>
                  <td className="py-3.5 px-4">
                    {f.status === "NEW" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Mới
                      </span>
                    )}
                    {f.status === "PROCESSING" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        Đang xử lý
                      </span>
                    )}
                    {f.status === "RESOLVED" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        Đã giải quyết
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveItem(f)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700"
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">
                  {activeItem.id} · {activeItem.senderCode}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-0.5">
                  {activeItem.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-slate-400 text-[11px]">
                  Người gửi: <span className="font-bold text-slate-800">{activeItem.senderName}</span> · Ca: {activeItem.shiftDetail}
                </p>
                <p className="text-slate-800 font-medium leading-relaxed pt-1">
                  &ldquo;{activeItem.content}&rdquo;
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  Phản hồi của Trưởng cửa hàng:
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung phản hồi hướng dẫn xử lý hoặc xác nhận tiếp nhận..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-hidden resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setActiveItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleResolve(activeItem.id)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow-xs transition-all"
                >
                  Gửi phản hồi & Giải quyết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
