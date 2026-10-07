"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Code,
  Activity,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Play,
  ShieldCheck,
  Zap,
  Clock,
  Terminal,
  ExternalLink,
} from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  keyMasked: string;
  rawKey: string;
  scope: string;
  rateLimit: string;
  lastUsed: string;
  status: "ACTIVE" | "REVOKED";
}

const mockApiKeys: ApiKeyItem[] = [
  {
    id: "key_1",
    name: "Hệ thống POS Thu Ngân (Cửa Hàng)",
    keyMasked: "bloan_live_pos_****9f2a",
    rawKey: "bloan_live_pos_8386a9f2a8c17b5e",
    scope: "READ_WRITE (Shifts, Attendance)",
    rateLimit: "120 req/phút",
    lastUsed: "2 giây trước",
    status: "ACTIVE",
  },
  {
    id: "key_2",
    name: "Máy chấm công ZKTeco FaceID / Vân tay",
    keyMasked: "bloan_live_zkteco_****31cd",
    rawKey: "bloan_live_zkteco_77a231cd44901f",
    scope: "WRITE (Check-in/Check-out Event)",
    rateLimit: "300 req/phút",
    lastUsed: "1 phút trước",
    status: "ACTIVE",
  },
  {
    id: "key_3",
    name: "Ứng dụng Di động Nhân viên (Mobile App)",
    keyMasked: "bloan_live_app_****88ee",
    rawKey: "bloan_live_app_88ee11bb22cc33dd",
    scope: "FULL_ACCESS (Client Auth)",
    rateLimit: "1,000 req/phút",
    lastUsed: "Vừa xong",
    status: "ACTIVE",
  },
  {
    id: "key_4",
    name: "Tích hợp Zalo ZNS / SMS Brandname",
    keyMasked: "bloan_live_zns_****001a",
    rawKey: "bloan_live_zns_001afb882200199",
    scope: "WRITE (Notification Queue)",
    rateLimit: "60 req/phút",
    lastUsed: "3 giờ trước",
    status: "ACTIVE",
  },
];

const apiEndpoints = [
  {
    method: "POST",
    path: "/api/v1/auth/login",
    desc: "Đăng nhập và cấp access_token, refresh_token kèm roleCode",
    group: "AuthController",
    status: "200 OK",
    latency: "42ms",
  },
  {
    method: "POST",
    path: "/api/v1/auth/register",
    desc: "Đăng ký tài khoản nhân viên mới trong chuỗi",
    group: "AuthController",
    status: "200 OK",
    latency: "68ms",
  },
  {
    method: "POST",
    path: "/api/v1/auth/refresh",
    desc: "Làm mới JWT token khi phiên làm việc hết hạn",
    group: "AuthController",
    status: "200 OK",
    latency: "28ms",
  },
  {
    method: "GET",
    path: "/api/v1/users",
    desc: "Lấy danh sách người dùng phân trang và lọc theo roleCode",
    group: "UserController",
    status: "200 OK",
    latency: "35ms",
  },
  {
    method: "GET",
    path: "/api/v1/shifts/my-shifts",
    desc: "Lấy lịch làm việc cá nhân của nhân sự đang đăng nhập",
    group: "ShiftController",
    status: "200 OK",
    latency: "45ms",
  },
  {
    method: "POST",
    path: "/api/v1/attendance/check-in",
    desc: "Nhận payload điểm danh từ camera FaceID hoặc QR code",
    group: "AttendanceController",
    status: "200 OK",
    latency: "52ms",
  },
  {
    method: "POST",
    path: "/api/v1/shifts/requests/swap",
    desc: "Gửi yêu cầu đổi ca làm việc giữa hai nhân sự",
    group: "ShiftRequestController",
    status: "200 OK",
    latency: "60ms",
  },
];

const mockLogs = [
  { time: "16:48:12", method: "POST", route: "/api/v1/auth/login", status: 200, ip: "118.69.182.20", ms: "38ms" },
  { time: "16:47:55", method: "POST", route: "/api/v1/attendance/check-in", status: 200, ip: "192.168.1.105", ms: "45ms" },
  { time: "16:46:30", method: "GET", route: "/api/v1/users?role=STORE_MANAGER", status: 200, ip: "14.161.22.8", ms: "52ms" },
  { time: "16:45:10", method: "POST", route: "/api/v1/auth/login", status: 401, ip: "113.190.44.12", ms: "22ms" },
  { time: "16:44:02", method: "GET", route: "/api/v1/shifts/my-shifts", status: 200, ip: "171.244.33.15", ms: "31ms" },
];

export default function QuanLyApiPage() {
  const [activeTab, setActiveTab] = useState<"keys" | "endpoints" | "logs">("keys");
  const [keys, setKeys] = useState<ApiKeyItem[]>(mockApiKeys);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Ping test
  const [testEndpoint, setTestEndpoint] = useState("/api/v1/auth/login");
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestPing = () => {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setIsPinging(false);
      setPingResult(
        JSON.stringify(
          {
            statusCode: 200,
            error: null,
            message: "Kết nối API Backend Spring Boot thành công",
            data: {
              serverTime: new Date().toISOString(),
              endpoint: testEndpoint,
              status: "UP",
              latency: "34ms",
              version: "v1.0.0-PROD",
            },
          },
          null,
          2
        )
      );
    }, 600);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
              ADMIN CENTER
            </span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-500 text-xs font-semibold">Tích hợp & Lập trình</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            Quản lý API & Cổng kết nối tích hợp
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý API Keys, kiểm tra tình trạng kết nối backend Spring Boot, máy quét vân tay FaceID và các ứng dụng vệ tinh.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Mở tài liệu Swagger / OpenAPI: http://localhost:8080/swagger-ui.html")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Tài liệu Swagger UI</span>
          </button>
          <button
            onClick={() => {
              const name = prompt("Nhập tên ứng dụng / thiết bị cần cấp API Key mới:", "Máy quét cửa hàng mới");
              if (name) {
                const newK: ApiKeyItem = {
                  id: "key_" + Date.now(),
                  name,
                  keyMasked: "bloan_live_new_****" + Math.floor(1000 + Math.random() * 9000),
                  rawKey: "bloan_live_" + Math.random().toString(36).substring(2, 18),
                  scope: "READ_WRITE",
                  rateLimit: "120 req/phút",
                  lastUsed: "Chưa dùng",
                  status: "ACTIVE",
                };
                setKeys([newK, ...keys]);
                alert("Đã sinh API Key mới thành công!");
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo API Key mới</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">API Keys hoạt động</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {keys.filter((k) => k.status === "ACTIVE").length}
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Tất cả đều bảo mật</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tổng Endpoints</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              38
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Spring Boot REST API</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Code className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tỷ lệ thành công (24h)</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              99.8%
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Độ sẵn sàng cao (High SLA)</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Thời gian phản hồi</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              38ms
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Trung bình toàn cụm</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("keys")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "keys"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>API Keys & Token xác thực ({keys.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("endpoints")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "endpoints"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Danh mục Endpoints & Thử nghiệm</span>
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "logs"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Nhật ký gọi API gần đây</span>
        </button>
      </div>

      {activeTab === "keys" ? (
        /* TAB 1: API KEYS */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Danh sách khóa bí mật (Secret Keys)</h3>
              <p className="text-[11px] text-slate-400">
                Sử dụng trong Header `X-API-KEY` để xác thực các hệ thống máy quét POS, ZKTeco và App
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              Mã hóa SHA-256
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Tên thiết bị / Ứng dụng</th>
                  <th className="px-5 py-3">API Key (Token)</th>
                  <th className="px-5 py-3">Quyền hạn truy cập</th>
                  <th className="px-5 py-3">Giới hạn gọi (Rate Limit)</th>
                  <th className="px-5 py-3">Lần gọi gần nhất</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-sm">{k.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {k.id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {k.keyMasked}
                        </span>
                        <button
                          onClick={() => copyToClipboard(k.rawKey, k.id)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
                          title="Sao chép toàn bộ Key"
                        >
                          {copiedId === k.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                        {k.scope}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">{k.rateLimit}</td>
                    <td className="px-5 py-4 text-slate-500 font-medium">{k.lastUsed}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn thu hồi API Key của "${k.name}"?`)) {
                            setKeys(keys.filter((item) => item.id !== k.id));
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
                      >
                        Thu hồi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "endpoints" ? (
        /* TAB 2: ENDPOINTS & PING TEST */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Danh sách API Endpoints chính</h3>
              <p className="text-[11px] text-slate-400">Các API phục vụ hệ thống phân quyền và chấm công chuỗi</p>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {apiEndpoints.map((ep, i) => (
                <div
                  key={i}
                  onClick={() => setTestEndpoint(ep.path)}
                  className={`p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                    testEndpoint === ep.path ? "bg-amber-50/30" : ""
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          ep.method === "POST"
                            ? "bg-blue-100 text-blue-800"
                            : ep.method === "GET"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono font-bold text-slate-800">{ep.path}</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{ep.desc}</p>
                    <span className="text-[10px] text-slate-400 font-semibold">{ep.group}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {ep.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{ep.latency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Ping Terminal */}
          <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-5 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs text-slate-200">API Health Test Console</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">BACKEND ONLINE</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Endpoint URL để thử nghiệm:
                  </label>
                  <input
                    type="text"
                    value={testEndpoint}
                    onChange={(e) => setTestEndpoint(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-xs text-amber-300 outline-hidden"
                  />
                </div>

                <button
                  onClick={handleTestPing}
                  disabled={isPinging}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs transition-all shadow-xs disabled:opacity-50"
                >
                  {isPinging ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang ping máy chủ...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-900" />
                      <span>Thực thi kiểm tra kết nối</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Phản hồi từ Spring Boot Server:
                </p>
                <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-400 border border-slate-800 overflow-x-auto min-h-[140px]">
                  {pingResult || `// Nhấn "Thực thi kiểm tra kết nối" để xem JSON response chuẩn...`}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
              Server Host: http://localhost:8080 · JWT HS512 Security Active
            </div>
          </div>
        </div>
      ) : (
        /* TAB 3: LOGS */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Nhật ký truy vấn thời gian thực (API Logs)</h3>
              <p className="text-[11px] text-slate-400">50 lượt gọi gần nhất qua API Gateway</p>
            </div>
            <button
              onClick={() => alert("Đang làm mới log...")}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Thời gian</th>
                  <th className="px-5 py-3">Phương thức & Tuyến đường</th>
                  <th className="px-5 py-3">Client IP</th>
                  <th className="px-5 py-3">HTTP Status</th>
                  <th className="px-5 py-3 text-right">Độ trễ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {mockLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500">{log.time}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md mr-2 ${
                          log.method === "POST" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="font-bold text-slate-800">{log.route}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{log.ip}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === 200
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-700">{log.ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
