// =========================================================
// Validator - Người dùng
// =========================================================

import { z } from 'zod';
import { TrangThaiNguoiDung } from '@/types/enums';

/** Schema tạo người dùng */
export const taoNguoiDungSchema = z.object({
  maNguoiDung: z
    .string({ required_error: 'Mã người dùng là bắt buộc' })
    .min(1, 'Mã người dùng không được để trống')
    .max(50, 'Mã người dùng tối đa 50 ký tự'),
  hoTen: z
    .string({ required_error: 'Họ tên là bắt buộc' })
    .min(1, 'Họ tên không được để trống')
    .max(255, 'Họ tên tối đa 255 ký tự'),
  email: z
    .string({ required_error: 'Email là bắt buộc' })
    .email('Email không hợp lệ')
    .max(255, 'Email tối đa 255 ký tự'),
  soDienThoai: z
    .string()
    .max(20, 'Số điện thoại tối đa 20 ký tự')
    .regex(/^[0-9+\-\s()]*$/, 'Số điện thoại không hợp lệ')
    .optional()
    .nullable(),
  matKhau: z
    .string({ required_error: 'Mật khẩu là bắt buộc' })
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(100, 'Mật khẩu tối đa 100 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
    ),
  anhDaiDien: z.string().max(500, 'URL ảnh tối đa 500 ký tự').optional().nullable(),
  vaiTroId: z.string({ required_error: 'Vai trò là bắt buộc' }),
  trangThai: z
    .nativeEnum(TrangThaiNguoiDung, { errorMap: () => ({ message: 'Trạng thái không hợp lệ' }) })
    .optional()
    .default(TrangThaiNguoiDung.HOAT_DONG),
});

/** Schema cập nhật người dùng */
export const capNhatNguoiDungSchema = z.object({
  hoTen: z
    .string()
    .min(1, 'Họ tên không được để trống')
    .max(255, 'Họ tên tối đa 255 ký tự')
    .optional(),
  email: z
    .string()
    .email('Email không hợp lệ')
    .max(255, 'Email tối đa 255 ký tự')
    .optional(),
  soDienThoai: z
    .string()
    .max(20, 'Số điện thoại tối đa 20 ký tự')
    .regex(/^[0-9+\-\s()]*$/, 'Số điện thoại không hợp lệ')
    .optional()
    .nullable(),
  anhDaiDien: z.string().max(500, 'URL ảnh tối đa 500 ký tự').optional().nullable(),
  vaiTroId: z.string().optional(),
  trangThai: z
    .nativeEnum(TrangThaiNguoiDung, { errorMap: () => ({ message: 'Trạng thái không hợp lệ' }) })
    .optional(),
});

/** Schema đổi mật khẩu */
export const doiMatKhauSchema = z.object({
  matKhauCu: z.string({ required_error: 'Mật khẩu cũ là bắt buộc' }),
  matKhauMoi: z
    .string({ required_error: 'Mật khẩu mới là bắt buộc' })
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(100, 'Mật khẩu tối đa 100 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
    ),
});

export type TaoNguoiDungInput = z.infer<typeof taoNguoiDungSchema>;
export type CapNhatNguoiDungInput = z.infer<typeof capNhatNguoiDungSchema>;
export type DoiMatKhauInput = z.infer<typeof doiMatKhauSchema>;
