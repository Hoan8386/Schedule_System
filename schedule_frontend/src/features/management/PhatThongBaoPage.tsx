"use client";

import React, { useCallback, useState } from "react";
import { BellRing, Clock, FileText, Info, RefreshCw, Send, Users } from "lucide-react";
import { Alert, Badge, Button, Card, CardHeader, EmptyState, PageHeader, Spinner } from "@/components/ui";
import { broadcastApi, type BroadcastAudience, type BroadcastPriority } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { useKeyedLoad } from "@/features/statistics/useStatistics";

const AUDIENCE_LABEL: Record<BroadcastAudience, string> = {
  ALL: "Tất cả nhân viên",
  SHIFT_TODAY: "Nhân viên có ca làm hôm nay",
  STORE_MANAGERS: "Trưởng cửa hàng",
};

const PRIORITY: Record<BroadcastPriority, { label: string; hint: string; tone: "neutral" | "warning" | "danger" }> = {
  NORMAL: { label: "Bình thường", hint: "Thông báo chung", tone: "neutral" },
  HIGH: { label: "Quan trọng", hint: "Cần nhân viên chú ý", tone: "warning" },
  URGENT: { label: "Khẩn cấp", hint: "Cần xử lý ngay", tone: "danger" },
};

/** Mẫu soạn nhanh (chỉ điền sẵn nội dung, có thể sửa trước khi gửi). */
const QUICK_TEMPLATES: { title: string; message: string; priority: BroadcastPriority }[] = [
  {
    title: "[ĐỔI LỊCH CA] Thay đổi lịch phân ca tuần tới",
    message: "Quản lý đã cập nhật lại bảng phân ca tuần mới. Các bạn vui lòng vào mục Lịch làm việc kiểm tra ca và xác nhận trước 20:00 tối nay.",
    priority: "HIGH",
  },
  {
    title: "[ĐĂNG KÝ CA] Kỳ đăng ký ca mới đã mở",
    message: "Kỳ đăng ký ca mới đã mở. Các bạn vào mục Đăng ký ca để chọn ca phù hợp trước khi đợt đăng ký đóng.",
    priority: "NORMAL",
  },
  {
    title: "[HỌP GIAO BAN] Họp đột xuất đầu ca làm",
    message: "Toàn bộ nhân sự ca chiều tập trung trước giờ làm 15 phút để họp giao ban và phổ biến quy trình mới.",
    priority: "URGENT",
  },
  {
    title: "[VỆ SINH CỬA HÀNG] Tổng vệ sinh định kỳ cuối tuần",
    message: "Nhắc các bạn hoàn tất checklist vệ sinh máy móc và bàn ghế trước khi bàn giao ca tối.",
    priority: "NORMAL",
  },
];

const fieldClass = "w-full rounded-xl border border-slate-300 bg-surface px-3 py-2 font-medium text-slate-800 outline-hidden focus:border-brand-500";

/** Phát thông báo trong ứng dụng tới nhân sự; người nhận thấy ở chuông thông báo. */
export default function PhatThongBaoPage() {
  const [storeId, setStoreId] = useState<number | undefined>(undefined);
  const [audience, setAudience] = useState<BroadcastAudience>("ALL");
  const [priority, setPriority] = useState<BroadcastPriority>("NORMAL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [version, setVersion] = useState(0);

  const audiences = useKeyedLoad(`${storeId ?? "all"}|${version}`, () => broadcastApi.getAudiences(storeId), "Không thể tải đối tượng nhận");
  const history = useKeyedLoad(`history|${version}`, () => broadcastApi.getHistory(10), "Không thể tải lịch sử phát thông báo");
  const reload = useCallback(() => setVersion((value) => value + 1), []);

  const counts = audiences.data?.counts;
  const recipientCount = counts?.[audience] ?? 0;
  const stores = audiences.data?.stores ?? [];
  const scopeName = storeId
    ? stores.find((store) => store.storeId === storeId)?.storeName ?? "Cửa hàng đã chọn"
    : audiences.data?.global
      ? "Toàn chuỗi"
      : "Các cửa hàng bạn quản lý";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !message.trim()) {
      notify.warning("Vui lòng điền đầy đủ tiêu đề và nội dung thông báo!");
      return;
    }
    if (recipientCount === 0) {
      notify.warning("Không có nhân viên nào thuộc đối tượng đã chọn");
      return;
    }
    if (!window.confirm(`Phát thông báo tới ${recipientCount} người (${AUDIENCE_LABEL[audience]} · ${scopeName})?`)) return;
    setSending(true);
    try {
      await broadcastApi.send({ audience, storeId, title: title.trim(), content: message.trim(), priority });
      setTitle("");
      setMessage("");
      reload();
    } catch {
      // Lỗi đã được hiện bằng toast từ HTTP client
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Phát thông báo tới nhân sự"
        subtitle="Gửi thông báo trong ứng dụng: người nhận thấy ngay ở chuông thông báo khi đăng nhập."
        actions={
          <Button variant="secondary" size="sm" onClick={reload} disabled={audiences.loading || history.loading}>
            <RefreshCw className={audiences.loading || history.loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
            Làm mới
          </Button>
        }
      />

      {audiences.error && <Alert>{audiences.error}</Alert>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader title="Soạn nội dung thông báo" icon={BellRing} />
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 p-5 text-xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-bold text-slate-800">Cửa hàng</span>
                <select
                  value={storeId ?? ""}
                  onChange={(event) => setStoreId(event.target.value ? Number(event.target.value) : undefined)}
                  className={fieldClass}
                >
                  <option value="">{audiences.data?.global ? "Toàn chuỗi (mọi cửa hàng)" : "Tất cả cửa hàng tôi quản lý"}</option>
                  {stores.map((store) => (
                    <option key={store.storeId} value={store.storeId}>{store.storeName}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block font-bold text-slate-800">Mức độ ưu tiên *</span>
                <select value={priority} onChange={(event) => setPriority(event.target.value as BroadcastPriority)} className={fieldClass}>
                  {(Object.keys(PRIORITY) as BroadcastPriority[]).map((key) => (
                    <option key={key} value={key}>
                      {PRIORITY[key].label} ({PRIORITY[key].hint})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <span className="mb-1 block font-bold text-slate-800">Đối tượng nhận *</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(Object.keys(AUDIENCE_LABEL) as BroadcastAudience[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAudience(key)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition",
                      audience === key ? "border-brand-400 bg-brand-50 ring-2 ring-brand-200" : "border-slate-200 hover:border-brand-300"
                    )}
                  >
                    <p className="font-bold text-slate-800">{AUDIENCE_LABEL[key]}</p>
                    <p className="mt-1 text-lg font-black text-brand-700">
                      {counts ? counts[key] : <Spinner className="justify-start" />}
                      {counts && <span className="ml-1 text-[11px] font-semibold text-slate-400">người</span>}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block font-bold text-slate-800">Tiêu đề thông báo *</span>
              <input
                type="text"
                maxLength={255}
                placeholder="vd: [LƯU Ý] Điều chỉnh lịch ca làm chiều nay..."
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={cn(fieldClass, "py-2.5 font-bold")}
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold text-slate-800">Nội dung chi tiết *</span>
              <textarea
                rows={5}
                placeholder="Nhập nội dung thông báo gửi đến nhân viên..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className={cn(fieldClass, "p-3 leading-relaxed")}
              />
            </label>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Users className="h-3.5 w-3.5" />
                Sẽ gửi tới <strong className="text-slate-800">{recipientCount}</strong> người · {AUDIENCE_LABEL[audience]} · {scopeName}
              </p>
              <Button type="submit" icon={Send} disabled={sending || !counts}>
                {sending ? "Đang phát thông báo..." : "Phát thông báo ngay"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-5 lg:col-span-5">
          <Card>
            <CardHeader title="Mẫu soạn nhanh" icon={FileText} />
            <div className="space-y-2 p-5">
              <p className="text-[11px] text-slate-500">Bấm vào mẫu để điền sẵn tiêu đề, nội dung và mức độ ưu tiên:</p>
              {QUICK_TEMPLATES.map((template) => (
                <button
                  key={template.title}
                  type="button"
                  onClick={() => {
                    setTitle(template.title);
                    setMessage(template.message);
                    setPriority(template.priority);
                  }}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-brand-300 hover:bg-brand-50"
                >
                  <p className="truncate text-xs font-bold text-slate-900">{template.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-600">{template.message}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Thông báo đã phát gần đây" icon={Clock} iconClassName="text-blue-700" />
            <div className="space-y-2.5 p-5 text-xs">
              {history.error && <Alert>{history.error}</Alert>}
              {!history.data && history.loading && <Spinner label="Đang tải lịch sử..." />}
              {history.data && history.data.length === 0 && <EmptyState>Chưa phát thông báo nào.</EmptyState>}
              {history.data?.map((item) => {
                const meta = PRIORITY[item.priority] ?? PRIORITY.NORMAL;
                const readPercent = item.recipients ? Math.round((item.readCount * 100) / item.recipients) : 0;
                return (
                  <div key={item.batchId} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-800">{item.title}</p>
                      <span className="shrink-0 font-mono text-[10px] text-slate-500">{formatDateTime(item.sentAt)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-slate-600">{item.content}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <span className="text-[11px] text-slate-600">
                        Đã đọc <strong>{item.readCount}</strong>/{item.recipients} người
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${readPercent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="flex items-start gap-3 rounded-2xl border border-brand-200/80 bg-brand-50/60 p-4 text-xs text-brand-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <p>Thông báo được gửi trong ứng dụng (chuông thông báo). Người gửi không nhận thông báo của chính mình.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
