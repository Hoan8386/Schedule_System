/** Dữ liệu mẫu cho trang Tổng quan (chưa nối API thống kê). */
import { chartColors } from "@/lib/theme";

export const ATTENDANCE_TREND = [
  { day: "Thứ 2", dungGio: 410, diMuon: 8 },
  { day: "Thứ 3", dungGio: 415, diMuon: 6 },
  { day: "Thứ 4", dungGio: 400, diMuon: 10 },
  { day: "Thứ 5", dungGio: 420, diMuon: 7 },
  { day: "Thứ 6", dungGio: 430, diMuon: 12 },
  { day: "Thứ 7", dungGio: 380, diMuon: 9 },
  { day: "CN", dungGio: 390, diMuon: 8 },
];

export const REQUEST_STATUS = [
  { name: "Đã duyệt", value: 85, color: chartColors.success },
  { name: "Chờ xử lý", value: 12, color: chartColors.brand },
  { name: "Từ chối", value: 3, color: chartColors.danger },
];

export const STAFF_BY_STORE = [
  { store: "Nguyễn Trãi", nv: 120 },
  { store: "CMT8", nv: 95 },
  { store: "Lê Lợi", nv: 150 },
  { store: "Quang Trung", nv: 80 },
  { store: "Tú Xương", nv: 110 },
  { store: "Sư Vạn Hạnh", nv: 130 },
];

export const RECENT_REQUESTS = [
  { initials: "TH", name: "Trần Hùng", code: "NV-8821", store: "CH Nguyễn Trãi", type: "Đổi ca làm", date: "05/10/2026", status: "Chờ duyệt" },
  { initials: "LM", name: "Lê Minh", code: "NV-3392", store: "CH Lê Lợi", type: "Hủy ca làm", date: "04/10/2026", status: "Chờ duyệt" },
  { initials: "PA", name: "Phương Anh", code: "NV-1044", store: "CH CMT8", type: "Xin nghỉ phép", date: "04/10/2026", status: "Đã duyệt" },
];

export const RECENT_VIOLATIONS = [
  { name: "Nguyễn Văn An", time: "10:15 Hôm nay", desc: "Đi muộn > 15 phút tại CH Nguyễn Trãi", tag: "Nhắc nhở", tagColor: "bg-brand-50 text-brand-700 border-brand-200" },
  { name: "Phạm Bích Trâm", time: "Hôm qua", desc: "Nghỉ ca không phép tại CH Lê Lợi", tag: "Cảnh cáo", tagColor: "bg-red-50 text-red-700 border-red-200" },
  { name: "Lý Hải Nam", time: "Hôm qua", desc: "Sai quy định đồng phục tại CH CMT8", tag: "Nhắc nhở", tagColor: "bg-brand-50 text-brand-700 border-brand-200" },
];

export const MANAGER_TODOS = [
  { id: 1, text: "Phê duyệt đơn đăng ký ca chuỗi - Tuần 12-18/10", sub: "12 yêu cầu đang chờ từ các cửa hàng", tag: "Ưu tiên cao", deadline: "Hôm nay 17:00", done: false },
  { id: 2, text: "Gửi báo cáo doanh thu & nhân sự tuần 1", sub: "Hoàn tất trước cuộc họp giao ban", tag: "Báo cáo", deadline: "Sáng mai 08:30", done: false },
  { id: 3, text: "Kiểm tra bảng tính lương toàn chuỗi T10", sub: "Đã hoàn thành lúc 09:15", tag: "Lương", deadline: "Đã xong", done: true },
];
