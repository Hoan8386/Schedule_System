export interface BrandSettings {
  storeName: string;
  slogan: string;
  hotline: string;
  email: string;
  address: string;
  taxCode: string;
  logoPath: string;
  primaryColor: string;
  accentColor: string;
}

/** Giá trị mặc định – trùng với token --brand-500 / --accent trong styles/theme.css */
export const DEFAULT_BRAND: BrandSettings = {
  storeName: "Ăn Vặt BLOAN",
  slogan: "Đậm Vị Truyền Thống – Trọn Vị Yêu Thương",
  hotline: "1900 8386",
  email: "cskh@anvatbloan.vn",
  address: "124 Nguyễn Trãi, Thanh Xuân, Hà Nội",
  taxCode: "0109888999",
  logoPath: "/logo/logo1.jpg",
  primaryColor: "#F59E0B",
  accentColor: "#ED1C24",
};

export const COLOR_PRESETS = [
  { label: "Vàng Cam BLOAN", primary: "#F59E0B", accent: "#ED1C24" },
  { label: "Đỏ Rực Rỡ", primary: "#ED1C24", accent: "#F59E0B" },
  { label: "Trà Sữa Matcha", primary: "#10B981", accent: "#F59E0B" },
  { label: "Xanh Sapphire", primary: "#2563EB", accent: "#F59E0B" },
  { label: "Tím Khoai Môn", primary: "#8B5CF6", accent: "#EC4899" },
];

export const LOGO_OPTIONS = [
  { path: "/logo/logo1.jpg", label: "Logo 1 (Chính thức)" },
  { path: "/logo/logo2.jpg", label: "Logo 2 (Họa tiết vàng)" },
  { path: "/logo/logo3.jpg", label: "Logo 3 (Vuông nét)" },
];
