// =========================================================
// Enums - Các giá trị enum dùng chung trong hệ thống
// =========================================================

/** Trạng thái người dùng */
export enum TrangThaiNguoiDung {
  HOAT_DONG = 'HOAT_DONG',
  KHONG_HOAT_DONG = 'KHONG_HOAT_DONG',
  BI_KHOA = 'BI_KHOA',
}

/** Trạng thái ca làm việc */
export enum TrangThaiCaLamViec {
  HOAT_DONG = 'HOAT_DONG',
  KHONG_HOAT_DONG = 'KHONG_HOAT_DONG',
}

/** Trạng thái kỳ đăng ký lịch */
export enum TrangThaiKyDangKy {
  NHAP = 'NHAP',
  MO = 'MO',
  DONG = 'DONG',
  DA_CHOT = 'DA_CHOT',
}

/** Trạng thái ca làm việc theo ngày */
export enum TrangThaiCaTheoNgay {
  MO = 'MO',
  DA_DAY = 'DA_DAY',
  DONG = 'DONG',
  HUY = 'HUY',
}

/** Trạng thái đăng ký ca */
export enum TrangThaiDangKy {
  CHO_DUYET = 'CHO_DUYET',
  DA_DUYET = 'DA_DUYET',
  TU_CHOI = 'TU_CHOI',
  DA_HUY = 'DA_HUY',
}

/** Loại yêu cầu thay đổi lịch */
export enum LoaiYeuCau {
  DOI_CA = 'DOI_CA',
  THEM_CA = 'THEM_CA',
  HUY_CA = 'HUY_CA',
}

/** Trạng thái yêu cầu thay đổi */
export enum TrangThaiYeuCau {
  CHO_DUYET = 'CHO_DUYET',
  DA_DUYET = 'DA_DUYET',
  TU_CHOI = 'TU_CHOI',
  DA_HUY = 'DA_HUY',
}

/** HTTP Methods */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
}

/** Kênh thông báo */
export enum KenhThongBao {
  WEB = 'WEB',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  ZALO = 'ZALO',
}

/** Loại sự kiện thông báo */
export enum LoaiSuKien {
  DANG_KY_THANH_CONG = 'DANG_KY_THANH_CONG',
  DANG_KY_DUOC_DUYET = 'DANG_KY_DUOC_DUYET',
  DANG_KY_BI_TU_CHOI = 'DANG_KY_BI_TU_CHOI',
  YEU_CAU_DOI_CA_DUOC_DUYET = 'YEU_CAU_DOI_CA_DUOC_DUYET',
  YEU_CAU_DOI_CA_BI_TU_CHOI = 'YEU_CAU_DOI_CA_BI_TU_CHOI',
  KY_DANG_KY_MO = 'KY_DANG_KY_MO',
  KY_DANG_KY_SAP_DONG = 'KY_DANG_KY_SAP_DONG',
}

/** Trạng thái nội quy */
export enum TrangThaiNoiQuy {
  HOAT_DONG = 'HOAT_DONG',
  KHONG_HOAT_DONG = 'KHONG_HOAT_DONG',
}

/** Hành động nhật ký */
export enum HanhDongNhatKy {
  TAO = 'TAO',
  CAP_NHAT = 'CAP_NHAT',
  XOA = 'XOA',
  DUYET = 'DUYET',
  TU_CHOI = 'TU_CHOI',
  HUY = 'HUY',
  DANG_NHAP = 'DANG_NHAP',
  DANG_XUAT = 'DANG_XUAT',
}
