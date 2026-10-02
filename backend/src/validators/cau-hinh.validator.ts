// =========================================================
// Validator - Cấu hình hệ thống
// =========================================================

import { z } from 'zod';

export const capNhatCauHinhSchema = z.object({
  giaTri: z.string().optional().nullable(),
  moTa: z.string().max(5000).optional().nullable(),
  dangHoatDong: z.boolean().optional(),
});

export type CapNhatCauHinhInput = z.infer<typeof capNhatCauHinhSchema>;
