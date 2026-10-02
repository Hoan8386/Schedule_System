// =========================================================
// NextAuth Configuration - Xác thực người dùng
// =========================================================

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import prisma from '@/lib/prisma';
import { TrangThaiNguoiDung } from '@/types/enums';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email và mật khẩu là bắt buộc');
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Tìm người dùng theo email
        const nguoiDung = await prisma.nguoiDung.findUnique({
          where: { email },
          include: {
            vaiTro: true,
          },
        });

        if (!nguoiDung) {
          throw new Error('Email hoặc mật khẩu không chính xác');
        }

        // Kiểm tra trạng thái tài khoản
        if (nguoiDung.trangThai === TrangThaiNguoiDung.BI_KHOA) {
          throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên');
        }

        if (nguoiDung.trangThai === TrangThaiNguoiDung.KHONG_HOAT_DONG) {
          throw new Error('Tài khoản không hoạt động');
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcryptjs.compare(password, nguoiDung.matKhau);
        if (!isPasswordValid) {
          throw new Error('Email hoặc mật khẩu không chính xác');
        }

        // Cập nhật thời gian đăng nhập cuối
        await prisma.nguoiDung.update({
          where: { id: nguoiDung.id },
          data: { lanDangNhapCuoi: new Date() },
        });

        // Trả về user object cho session
        return {
          id: nguoiDung.id.toString(),
          maNguoiDung: nguoiDung.maNguoiDung,
          hoTen: nguoiDung.hoTen,
          email: nguoiDung.email,
          vaiTroId: nguoiDung.vaiTroId.toString(),
          maVaiTro: nguoiDung.vaiTro.maVaiTro,
          tenVaiTro: nguoiDung.vaiTro.tenVaiTro,
          image: nguoiDung.anhDaiDien,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.id = user.id;
        token.maNguoiDung = u.maNguoiDung;
        token.hoTen = u.hoTen;
        token.vaiTroId = u.vaiTroId;
        token.maVaiTro = u.maVaiTro;
        token.tenVaiTro = u.tenVaiTro;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        const su = session.user as unknown as Record<string, unknown>;
        su.maNguoiDung = token.maNguoiDung;
        su.hoTen = token.hoTen;
        su.vaiTroId = token.vaiTroId;
        su.maVaiTro = token.maVaiTro;
        su.tenVaiTro = token.tenVaiTro;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 giờ
  },
  secret: process.env.AUTH_SECRET,
});
