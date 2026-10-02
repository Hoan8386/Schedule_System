// =========================================================
// Validator - Yêu cầu thay đổi lịch
// =========================================================

import { z } from 'zod';
import { LoaiYeuCau } from '@/types/enums';

/** Schema tạo yêu cầu thay đổi lịch */
export const taoYeuCauSchema = z.object({
  loaiYeuCau: z.nativeEnum(LoaiYeuCau, {
    errorMap: () => ({ message: 'Loại yêu cầu phải là DOI_CA, THEM_CA hoặc HUY_CA' }),
  }),
  dangKyCaId: z.string().optional().nullable(),
  caCuId: z.string().optional().nullable(),
  caMoiId: z.string().optional().nullable(),
  lyDo: z
    .string({ required_error: 'Lý do là bắt buộc' })
    .min(1, 'Lý do không được để trống')
    .max(5000, 'Lý do tối đa 5000 ký tự'),
});

/** Schema duyệt yêu cầu */
export const duyetYeuCauSchema = z.object({
  ghiChuXuLy: z.string().max(5000).optional().nullable(),
});

/** Schema từ chối yêu cầu */
export const tuChoiYeuCauSchema = z.object({
  ghiChuXuLy: z
    .string({ required_error: 'Ghi chú xử lý là bắt buộc' })
    .min(1, 'Ghi chú xử lý không được để trống')
    .max(5000, 'Ghi chú tối đa 5000 ký tự'),
});

export type TaoYeuCauInput = z.infer<typeof taoYeuCauSchema>;
export type DuyetYeuCauInput = z.infer<typeof duyetYeuCauSchema>;
export type TuChoiYeuCauInput = z.infer<typeof tuChoiYeuCauSchema>;
