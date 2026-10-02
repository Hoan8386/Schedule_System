// =========================================================
// Validator - Ca làm việc theo ngày (Lịch)
// =========================================================

import { z } from 'zod';
import { TrangThaiCaTheoNgay } from '@/types/enums';

/** Schema tạo ca theo ngày (đơn lẻ) */
export const taoCaTheoNgaySchema = z.object({
  kyDangKyLichId: z.string({ required_error: 'ID kỳ đăng ký là bắt buộc' }),
  caLamViecId: z.string({ required_error: 'ID ca làm việc là bắt buộc' }),
  ngayLamViec: z
    .string({ required_error: 'Ngày làm việc là bắt buộc' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày làm việc phải có định dạng YYYY-MM-DD'),
  gioBatDau: z.string().regex(/^\d{2}:\d{2}$/, 'Giờ bắt đầu phải có định dạng HH:mm').optional(),
  gioKetThuc: z.string().regex(/^\d{2}:\d{2}$/, 'Giờ kết thúc phải có định dạng HH:mm').optional(),
  soNguoiToiDa: z.number().int().min(1, 'Số người tối đa phải lớn hơn 0').optional(),
  trangThai: z.nativeEnum(TrangThaiCaTheoNgay).optional().default(TrangThaiCaTheoNgay.MO),
});

/** Schema tạo hàng loạt ca theo ngày */
export const taoCaTheoNgayBatchSchema = z.object({
  kyDangKyLichId: z.string({ required_error: 'ID kỳ đăng ký là bắt buộc' }),
  caLamViecIds: z
    .array(z.string())
    .min(1, 'Phải chọn ít nhất 1 ca làm việc'),
  tuNgay: z
    .string({ required_error: 'Ngày bắt đầu là bắt buộc' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày bắt đầu phải có định dạng YYYY-MM-DD'),
  denNgay: z
    .string({ required_error: 'Ngày kết thúc là bắt buộc' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày kết thúc phải có định dạng YYYY-MM-DD'),
  boQuaNgayLe: z.boolean().optional().default(true),
  boQuaChuNhat: z.boolean().optional().default(false),
  boQuaThuBay: z.boolean().optional().default(false),
});

/** Schema cập nhật ca theo ngày */
export const capNhatCaTheoNgaySchema = z.object({
  soNguoiToiDa: z.number().int().min(1).optional(),
  trangThai: z.nativeEnum(TrangThaiCaTheoNgay).optional(),
});

export type TaoCaTheoNgayInput = z.infer<typeof taoCaTheoNgaySchema>;
export type TaoCaTheoNgayBatchInput = z.infer<typeof taoCaTheoNgayBatchSchema>;
export type CapNhatCaTheoNgayInput = z.infer<typeof capNhatCaTheoNgaySchema>;
