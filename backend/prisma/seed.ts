// =========================================================
// Seed Data - Dữ liệu khởi tạo hệ thống
// =========================================================

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import bcryptjs from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');

  // =========================================================
  // 1. Tạo vai trò
  // =========================================================
  console.log('📋 Tạo vai trò...');

  const vaiTroAdmin = await prisma.vaiTro.upsert({
    where: { maVaiTro: 'ADMIN' },
    update: {},
    create: {
      maVaiTro: 'ADMIN',
      tenVaiTro: 'Quản trị viên',
      moTa: 'Quản trị viên hệ thống - có toàn quyền',
      dangHoatDong: true,
    },
  });

  const vaiTroQuanLy = await prisma.vaiTro.upsert({
    where: { maVaiTro: 'QUAN_LY' },
    update: {},
    create: {
      maVaiTro: 'QUAN_LY',
      tenVaiTro: 'Quản lý',
      moTa: 'Quản lý - quản lý lịch và nhân viên',
      dangHoatDong: true,
    },
  });

  const vaiTroNhanVien = await prisma.vaiTro.upsert({
    where: { maVaiTro: 'NHAN_VIEN' },
    update: {},
    create: {
      maVaiTro: 'NHAN_VIEN',
      tenVaiTro: 'Nhân viên',
      moTa: 'Nhân viên - đăng ký và xem lịch làm việc',
      dangHoatDong: true,
    },
  });

  console.log(`  ✅ Đã tạo ${3} vai trò`);

  // =========================================================
  // 2. Tạo quyền
  // =========================================================
  console.log('🔐 Tạo quyền...');

  const quyenData = [
    // Auth
    { maQuyen: 'AUTH_LOGIN', tenQuyen: 'Đăng nhập', apiPath: '/api/auth/signin', httpMethod: 'POST', moTa: 'Đăng nhập hệ thống' },

    // Người dùng
    { maQuyen: 'NGUOI_DUNG_XEM', tenQuyen: 'Xem danh sách người dùng', apiPath: '/api/nguoi-dung', httpMethod: 'GET', moTa: 'Xem danh sách người dùng' },
    { maQuyen: 'NGUOI_DUNG_XEM_CHI_TIET', tenQuyen: 'Xem chi tiết người dùng', apiPath: '/api/nguoi-dung/:id', httpMethod: 'GET', moTa: 'Xem chi tiết người dùng' },
    { maQuyen: 'NGUOI_DUNG_TAO', tenQuyen: 'Tạo người dùng', apiPath: '/api/nguoi-dung', httpMethod: 'POST', moTa: 'Tạo người dùng mới' },
    { maQuyen: 'NGUOI_DUNG_SUA', tenQuyen: 'Sửa người dùng', apiPath: '/api/nguoi-dung/:id', httpMethod: 'PUT', moTa: 'Cập nhật thông tin người dùng' },
    { maQuyen: 'NGUOI_DUNG_XOA', tenQuyen: 'Xóa người dùng', apiPath: '/api/nguoi-dung/:id', httpMethod: 'DELETE', moTa: 'Xóa người dùng' },

    // Vai trò
    { maQuyen: 'VAI_TRO_XEM', tenQuyen: 'Xem danh sách vai trò', apiPath: '/api/vai-tro', httpMethod: 'GET', moTa: 'Xem danh sách vai trò' },
    { maQuyen: 'VAI_TRO_XEM_CHI_TIET', tenQuyen: 'Xem chi tiết vai trò', apiPath: '/api/vai-tro/:id', httpMethod: 'GET', moTa: 'Xem chi tiết vai trò' },
    { maQuyen: 'VAI_TRO_TAO', tenQuyen: 'Tạo vai trò', apiPath: '/api/vai-tro', httpMethod: 'POST', moTa: 'Tạo vai trò mới' },
    { maQuyen: 'VAI_TRO_SUA', tenQuyen: 'Sửa vai trò', apiPath: '/api/vai-tro/:id', httpMethod: 'PUT', moTa: 'Cập nhật vai trò' },
    { maQuyen: 'VAI_TRO_XOA', tenQuyen: 'Xóa vai trò', apiPath: '/api/vai-tro/:id', httpMethod: 'DELETE', moTa: 'Xóa vai trò' },

    // Quyền
    { maQuyen: 'QUYEN_XEM', tenQuyen: 'Xem danh sách quyền', apiPath: '/api/quyen', httpMethod: 'GET', moTa: 'Xem danh sách quyền' },
    { maQuyen: 'QUYEN_TAO', tenQuyen: 'Tạo quyền', apiPath: '/api/quyen', httpMethod: 'POST', moTa: 'Tạo quyền mới' },
    { maQuyen: 'QUYEN_SUA', tenQuyen: 'Sửa quyền', apiPath: '/api/quyen/:id', httpMethod: 'PUT', moTa: 'Cập nhật quyền' },
    { maQuyen: 'QUYEN_XOA', tenQuyen: 'Xóa quyền', apiPath: '/api/quyen/:id', httpMethod: 'DELETE', moTa: 'Xóa quyền' },

    // Ca làm việc
    { maQuyen: 'CA_LAM_VIEC_XEM', tenQuyen: 'Xem ca làm việc', apiPath: '/api/ca-lam-viec', httpMethod: 'GET', moTa: 'Xem danh sách ca làm việc' },
    { maQuyen: 'CA_LAM_VIEC_TAO', tenQuyen: 'Tạo ca làm việc', apiPath: '/api/ca-lam-viec', httpMethod: 'POST', moTa: 'Tạo ca làm việc mới' },
    { maQuyen: 'CA_LAM_VIEC_SUA', tenQuyen: 'Sửa ca làm việc', apiPath: '/api/ca-lam-viec/:id', httpMethod: 'PUT', moTa: 'Cập nhật ca làm việc' },
    { maQuyen: 'CA_LAM_VIEC_XOA', tenQuyen: 'Xóa ca làm việc', apiPath: '/api/ca-lam-viec/:id', httpMethod: 'DELETE', moTa: 'Xóa ca làm việc' },

    // Kỳ đăng ký
    { maQuyen: 'KY_DANG_KY_XEM', tenQuyen: 'Xem kỳ đăng ký', apiPath: '/api/ky-dang-ky', httpMethod: 'GET', moTa: 'Xem danh sách kỳ đăng ký' },
    { maQuyen: 'KY_DANG_KY_TAO', tenQuyen: 'Tạo kỳ đăng ký', apiPath: '/api/ky-dang-ky', httpMethod: 'POST', moTa: 'Tạo kỳ đăng ký mới' },
    { maQuyen: 'KY_DANG_KY_SUA', tenQuyen: 'Sửa kỳ đăng ký', apiPath: '/api/ky-dang-ky/:id', httpMethod: 'PUT', moTa: 'Cập nhật kỳ đăng ký' },
    { maQuyen: 'KY_DANG_KY_XOA', tenQuyen: 'Xóa kỳ đăng ký', apiPath: '/api/ky-dang-ky/:id', httpMethod: 'DELETE', moTa: 'Xóa kỳ đăng ký' },

    // Lịch (ca theo ngày)
    { maQuyen: 'LICH_XEM', tenQuyen: 'Xem lịch làm việc', apiPath: '/api/lich', httpMethod: 'GET', moTa: 'Xem lịch làm việc' },
    { maQuyen: 'LICH_TAO', tenQuyen: 'Tạo lịch (ca theo ngày)', apiPath: '/api/lich', httpMethod: 'POST', moTa: 'Tạo ca theo ngày' },
    { maQuyen: 'LICH_SUA', tenQuyen: 'Sửa lịch', apiPath: '/api/lich/:id', httpMethod: 'PUT', moTa: 'Cập nhật ca theo ngày' },
    { maQuyen: 'LICH_XOA', tenQuyen: 'Xóa lịch', apiPath: '/api/lich/:id', httpMethod: 'DELETE', moTa: 'Xóa ca theo ngày' },

    // Đăng ký ca
    { maQuyen: 'DANG_KY_CA_XEM', tenQuyen: 'Xem đăng ký ca', apiPath: '/api/dang-ky-ca', httpMethod: 'GET', moTa: 'Xem danh sách đăng ký ca' },
    { maQuyen: 'DANG_KY_CA_TAO', tenQuyen: 'Đăng ký ca', apiPath: '/api/dang-ky-ca', httpMethod: 'POST', moTa: 'Đăng ký ca làm việc' },
    { maQuyen: 'DANG_KY_CA_DUYET', tenQuyen: 'Duyệt đăng ký ca', apiPath: '/api/dang-ky-ca/:id/duyet', httpMethod: 'PATCH', moTa: 'Duyệt đăng ký ca' },
    { maQuyen: 'DANG_KY_CA_TU_CHOI', tenQuyen: 'Từ chối đăng ký ca', apiPath: '/api/dang-ky-ca/:id/tu-choi', httpMethod: 'PATCH', moTa: 'Từ chối đăng ký ca' },
    { maQuyen: 'DANG_KY_CA_HUY', tenQuyen: 'Hủy đăng ký ca', apiPath: '/api/dang-ky-ca/:id/huy', httpMethod: 'PATCH', moTa: 'Hủy đăng ký ca' },

    // Yêu cầu thay đổi lịch
    { maQuyen: 'YEU_CAU_XEM', tenQuyen: 'Xem yêu cầu thay đổi', apiPath: '/api/yeu-cau-thay-doi', httpMethod: 'GET', moTa: 'Xem danh sách yêu cầu' },
    { maQuyen: 'YEU_CAU_TAO', tenQuyen: 'Tạo yêu cầu thay đổi', apiPath: '/api/yeu-cau-thay-doi', httpMethod: 'POST', moTa: 'Tạo yêu cầu thay đổi lịch' },
    { maQuyen: 'YEU_CAU_DUYET', tenQuyen: 'Duyệt yêu cầu', apiPath: '/api/yeu-cau-thay-doi/:id/duyet', httpMethod: 'PATCH', moTa: 'Duyệt yêu cầu thay đổi' },
    { maQuyen: 'YEU_CAU_TU_CHOI', tenQuyen: 'Từ chối yêu cầu', apiPath: '/api/yeu-cau-thay-doi/:id/tu-choi', httpMethod: 'PATCH', moTa: 'Từ chối yêu cầu thay đổi' },

    // Thông báo
    { maQuyen: 'THONG_BAO_XEM', tenQuyen: 'Xem thông báo', apiPath: '/api/thong-bao', httpMethod: 'GET', moTa: 'Xem danh sách thông báo' },
    { maQuyen: 'THONG_BAO_DOC', tenQuyen: 'Đánh dấu đã đọc', apiPath: '/api/thong-bao/:id/doc', httpMethod: 'PATCH', moTa: 'Đánh dấu thông báo đã đọc' },

    // Ngày lễ
    { maQuyen: 'NGAY_LE_XEM', tenQuyen: 'Xem ngày lễ', apiPath: '/api/ngay-le', httpMethod: 'GET', moTa: 'Xem danh sách ngày lễ' },
    { maQuyen: 'NGAY_LE_TAO', tenQuyen: 'Tạo ngày lễ', apiPath: '/api/ngay-le', httpMethod: 'POST', moTa: 'Tạo ngày lễ' },
    { maQuyen: 'NGAY_LE_SUA', tenQuyen: 'Sửa ngày lễ', apiPath: '/api/ngay-le/:id', httpMethod: 'PUT', moTa: 'Cập nhật ngày lễ' },
    { maQuyen: 'NGAY_LE_XOA', tenQuyen: 'Xóa ngày lễ', apiPath: '/api/ngay-le/:id', httpMethod: 'DELETE', moTa: 'Xóa ngày lễ' },

    // Quy tắc lịch
    { maQuyen: 'QUY_TAC_XEM', tenQuyen: 'Xem quy tắc', apiPath: '/api/quy-tac-lich', httpMethod: 'GET', moTa: 'Xem danh sách quy tắc' },
    { maQuyen: 'QUY_TAC_TAO', tenQuyen: 'Tạo quy tắc', apiPath: '/api/quy-tac-lich', httpMethod: 'POST', moTa: 'Tạo quy tắc' },
    { maQuyen: 'QUY_TAC_SUA', tenQuyen: 'Sửa quy tắc', apiPath: '/api/quy-tac-lich/:id', httpMethod: 'PUT', moTa: 'Cập nhật quy tắc' },
    { maQuyen: 'QUY_TAC_XOA', tenQuyen: 'Xóa quy tắc', apiPath: '/api/quy-tac-lich/:id', httpMethod: 'DELETE', moTa: 'Xóa quy tắc' },

    // Nội quy
    { maQuyen: 'NOI_QUY_XEM', tenQuyen: 'Xem nội quy', apiPath: '/api/noi-quy', httpMethod: 'GET', moTa: 'Xem nội quy' },
    { maQuyen: 'NOI_QUY_TAO', tenQuyen: 'Tạo nội quy', apiPath: '/api/noi-quy', httpMethod: 'POST', moTa: 'Tạo nội quy' },
    { maQuyen: 'NOI_QUY_SUA', tenQuyen: 'Sửa nội quy', apiPath: '/api/noi-quy/:id', httpMethod: 'PUT', moTa: 'Cập nhật nội quy' },
    { maQuyen: 'NOI_QUY_XOA', tenQuyen: 'Xóa nội quy', apiPath: '/api/noi-quy/:id', httpMethod: 'DELETE', moTa: 'Xóa nội quy' },

    // Cấu hình thông báo
    { maQuyen: 'CAU_HINH_TB_XEM', tenQuyen: 'Xem cấu hình thông báo', apiPath: '/api/cau-hinh-thong-bao', httpMethod: 'GET', moTa: 'Xem cấu hình thông báo' },
    { maQuyen: 'CAU_HINH_TB_SUA', tenQuyen: 'Sửa cấu hình thông báo', apiPath: '/api/cau-hinh-thong-bao/:id', httpMethod: 'PUT', moTa: 'Cập nhật cấu hình thông báo' },

    // Mẫu thông báo
    { maQuyen: 'MAU_TB_XEM', tenQuyen: 'Xem mẫu thông báo', apiPath: '/api/mau-thong-bao', httpMethod: 'GET', moTa: 'Xem mẫu thông báo' },
    { maQuyen: 'MAU_TB_TAO', tenQuyen: 'Tạo mẫu thông báo', apiPath: '/api/mau-thong-bao', httpMethod: 'POST', moTa: 'Tạo mẫu thông báo' },
    { maQuyen: 'MAU_TB_SUA', tenQuyen: 'Sửa mẫu thông báo', apiPath: '/api/mau-thong-bao/:id', httpMethod: 'PUT', moTa: 'Cập nhật mẫu thông báo' },

    // Nhật ký
    { maQuyen: 'NHAT_KY_XEM', tenQuyen: 'Xem nhật ký hệ thống', apiPath: '/api/nhat-ky', httpMethod: 'GET', moTa: 'Xem nhật ký hệ thống' },

    // Cấu hình hệ thống
    { maQuyen: 'CAU_HINH_XEM', tenQuyen: 'Xem cấu hình hệ thống', apiPath: '/api/cau-hinh', httpMethod: 'GET', moTa: 'Xem cấu hình hệ thống' },
    { maQuyen: 'CAU_HINH_SUA', tenQuyen: 'Sửa cấu hình hệ thống', apiPath: '/api/cau-hinh/:id', httpMethod: 'PUT', moTa: 'Cập nhật cấu hình' },
  ];

  const createdQuyens = [];
  for (const q of quyenData) {
    const quyen = await prisma.quyen.upsert({
      where: { maQuyen: q.maQuyen },
      update: {},
      create: {
        ...q,
        dangHoatDong: true,
      },
    });
    createdQuyens.push(quyen);
  }

  console.log(`  ✅ Đã tạo ${createdQuyens.length} quyền`);

  // =========================================================
  // 3. Gán quyền cho vai trò
  // =========================================================
  console.log('🔗 Gán quyền cho vai trò...');

  // Admin: tất cả quyền
  for (const quyen of createdQuyens) {
    await prisma.vaiTroQuyen.upsert({
      where: {
        uk_vai_tro_quyen: {
          vaiTroId: vaiTroAdmin.id,
          quyenId: quyen.id,
        },
      },
      update: {},
      create: {
        vaiTroId: vaiTroAdmin.id,
        quyenId: quyen.id,
      },
    });
  }

  // Quản lý: hầu hết quyền (trừ quản lý vai trò, quyền, cấu hình hệ thống)
  const quyenQuanLyExclude = [
    'VAI_TRO_TAO', 'VAI_TRO_SUA', 'VAI_TRO_XOA',
    'QUYEN_TAO', 'QUYEN_SUA', 'QUYEN_XOA',
    'CAU_HINH_SUA',
    'NGUOI_DUNG_XOA',
  ];
  const quyenQuanLy = createdQuyens.filter(
    (q) => !quyenQuanLyExclude.includes(q.maQuyen)
  );
  for (const quyen of quyenQuanLy) {
    await prisma.vaiTroQuyen.upsert({
      where: {
        uk_vai_tro_quyen: {
          vaiTroId: vaiTroQuanLy.id,
          quyenId: quyen.id,
        },
      },
      update: {},
      create: {
        vaiTroId: vaiTroQuanLy.id,
        quyenId: quyen.id,
      },
    });
  }

  // Nhân viên: quyền cơ bản
  const quyenNhanVienInclude = [
    'AUTH_LOGIN',
    'CA_LAM_VIEC_XEM',
    'KY_DANG_KY_XEM',
    'LICH_XEM',
    'DANG_KY_CA_XEM', 'DANG_KY_CA_TAO', 'DANG_KY_CA_HUY',
    'YEU_CAU_XEM', 'YEU_CAU_TAO',
    'THONG_BAO_XEM', 'THONG_BAO_DOC',
    'NGAY_LE_XEM',
    'QUY_TAC_XEM',
    'NOI_QUY_XEM',
  ];
  const quyenNhanVien = createdQuyens.filter(
    (q) => quyenNhanVienInclude.includes(q.maQuyen)
  );
  for (const quyen of quyenNhanVien) {
    await prisma.vaiTroQuyen.upsert({
      where: {
        uk_vai_tro_quyen: {
          vaiTroId: vaiTroNhanVien.id,
          quyenId: quyen.id,
        },
      },
      update: {},
      create: {
        vaiTroId: vaiTroNhanVien.id,
        quyenId: quyen.id,
      },
    });
  }

  console.log('  ✅ Đã gán quyền cho vai trò');

  // =========================================================
  // 4. Tạo tài khoản admin mặc định
  // =========================================================
  console.log('👤 Tạo tài khoản admin...');

  const hashedPassword = await bcryptjs.hash('Admin@123', 12);

  await prisma.nguoiDung.upsert({
    where: { email: 'admin@schedule.com' },
    update: {},
    create: {
      maNguoiDung: 'ADMIN001',
      hoTen: 'Administrator',
      email: 'admin@schedule.com',
      soDienThoai: '0900000001',
      matKhau: hashedPassword,
      vaiTroId: vaiTroAdmin.id,
      trangThai: 'HOAT_DONG',
    },
  });

  // Tạo thêm tài khoản quản lý
  const hashedPasswordQL = await bcryptjs.hash('QuanLy@123', 12);
  await prisma.nguoiDung.upsert({
    where: { email: 'quanly@schedule.com' },
    update: {},
    create: {
      maNguoiDung: 'QL001',
      hoTen: 'Quản Lý',
      email: 'quanly@schedule.com',
      soDienThoai: '0900000002',
      matKhau: hashedPasswordQL,
      vaiTroId: vaiTroQuanLy.id,
      trangThai: 'HOAT_DONG',
    },
  });

  // Tạo thêm tài khoản nhân viên mẫu
  const hashedPasswordNV = await bcryptjs.hash('NhanVien@123', 12);
  await prisma.nguoiDung.upsert({
    where: { email: 'nhanvien@schedule.com' },
    update: {},
    create: {
      maNguoiDung: 'NV001',
      hoTen: 'Nguyễn Văn A',
      email: 'nhanvien@schedule.com',
      soDienThoai: '0900000003',
      matKhau: hashedPasswordNV,
      vaiTroId: vaiTroNhanVien.id,
      trangThai: 'HOAT_DONG',
    },
  });

  console.log('  ✅ Đã tạo tài khoản mẫu');

  // =========================================================
  // 5. Tạo cấu hình hệ thống mặc định
  // =========================================================
  console.log('⚙️  Tạo cấu hình hệ thống...');

  const cauHinhData = [
    { maCauHinh: 'SO_CA_TOI_THIEU_MOI_TUAN', giaTri: '2', moTa: 'Số ca tối thiểu mỗi tuần cho nhân viên' },
    { maCauHinh: 'SO_CA_TOI_DA_MOI_TUAN', giaTri: '6', moTa: 'Số ca tối đa mỗi tuần cho nhân viên' },
    { maCauHinh: 'SO_CA_TOI_DA_MOI_NGAY', giaTri: '2', moTa: 'Số ca tối đa mỗi ngày cho nhân viên' },
    { maCauHinh: 'THOI_GIAN_HUY_TRUOC_GIO', giaTri: '24', moTa: 'Số giờ trước ca mà nhân viên được phép hủy đăng ký' },
    { maCauHinh: 'TU_DONG_DUYET_DANG_KY', giaTri: 'false', moTa: 'Tự động duyệt đăng ký ca (true/false)' },
    { maCauHinh: 'EMAIL_ADMIN', giaTri: 'admin@schedule.com', moTa: 'Email quản trị viên hệ thống' },
  ];

  for (const ch of cauHinhData) {
    await prisma.cauHinhHeThong.upsert({
      where: { maCauHinh: ch.maCauHinh },
      update: {},
      create: { ...ch, dangHoatDong: true },
    });
  }

  console.log('  ✅ Đã tạo cấu hình hệ thống');

  // =========================================================
  // 6. Tạo cấu hình thông báo mặc định
  // =========================================================
  console.log('🔔 Tạo cấu hình thông báo...');

  const suKienThongBao = [
    'DANG_KY_THANH_CONG',
    'DANG_KY_DUOC_DUYET',
    'DANG_KY_BI_TU_CHOI',
    'YEU_CAU_DOI_CA_DUOC_DUYET',
    'YEU_CAU_DOI_CA_BI_TU_CHOI',
    'KY_DANG_KY_MO',
    'KY_DANG_KY_SAP_DONG',
  ];

  for (const suKien of suKienThongBao) {
    await prisma.cauHinhThongBao.upsert({
      where: {
        uk_cau_hinh_thong_bao: { kenh: 'WEB', loaiSuKien: suKien },
      },
      update: {},
      create: { kenh: 'WEB', loaiSuKien: suKien, bat: true },
    });
  }

  console.log('  ✅ Đã tạo cấu hình thông báo');

  // =========================================================
  // 7. Tạo mẫu thông báo mặc định
  // =========================================================
  console.log('📝 Tạo mẫu thông báo...');

  const mauThongBaoData = [
    { kenh: 'WEB', loaiSuKien: 'DANG_KY_THANH_CONG', tieuDe: 'Đăng ký ca thành công', noiDung: 'Bạn đã đăng ký ca {{tenCa}} ngày {{ngayLamViec}} thành công. Vui lòng chờ duyệt.' },
    { kenh: 'WEB', loaiSuKien: 'DANG_KY_DUOC_DUYET', tieuDe: 'Đăng ký ca được duyệt', noiDung: 'Đăng ký ca {{tenCa}} ngày {{ngayLamViec}} của bạn đã được duyệt.' },
    { kenh: 'WEB', loaiSuKien: 'DANG_KY_BI_TU_CHOI', tieuDe: 'Đăng ký ca bị từ chối', noiDung: 'Đăng ký ca {{tenCa}} ngày {{ngayLamViec}} của bạn bị từ chối. Lý do: {{lyDo}}' },
    { kenh: 'WEB', loaiSuKien: 'YEU_CAU_DOI_CA_DUOC_DUYET', tieuDe: 'Yêu cầu đổi ca được duyệt', noiDung: 'Yêu cầu đổi ca của bạn đã được duyệt.' },
    { kenh: 'WEB', loaiSuKien: 'YEU_CAU_DOI_CA_BI_TU_CHOI', tieuDe: 'Yêu cầu đổi ca bị từ chối', noiDung: 'Yêu cầu đổi ca của bạn bị từ chối. Lý do: {{lyDo}}' },
    { kenh: 'WEB', loaiSuKien: 'KY_DANG_KY_MO', tieuDe: 'Kỳ đăng ký mới đã mở', noiDung: 'Kỳ đăng ký {{tenKy}} đã được mở. Hạn đăng ký đến {{thoiGianDong}}.' },
    { kenh: 'WEB', loaiSuKien: 'KY_DANG_KY_SAP_DONG', tieuDe: 'Kỳ đăng ký sắp đóng', noiDung: 'Kỳ đăng ký {{tenKy}} sẽ đóng vào {{thoiGianDong}}. Vui lòng hoàn tất đăng ký.' },
  ];

  for (const mau of mauThongBaoData) {
    await prisma.mauThongBao.upsert({
      where: {
        uk_mau_thong_bao: { kenh: mau.kenh, loaiSuKien: mau.loaiSuKien },
      },
      update: {},
      create: { ...mau, dangHoatDong: true },
    });
  }

  console.log('  ✅ Đã tạo mẫu thông báo');

  console.log('\n🎉 Seed hoàn tất!');
  console.log('📧 Admin: admin@schedule.com / Admin@123');
  console.log('📧 Quản lý: quanly@schedule.com / QuanLy@123');
  console.log('📧 Nhân viên: nhanvien@schedule.com / NhanVien@123');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
