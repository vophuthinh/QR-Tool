import React from "react";
import backgroundImage from "../assets/HPT toa nha.jpg";

const IconDiversity = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const IconBrand = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const IconQuality = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L17 21l-6-4.428L5 21l3.286-6.857L2 12l6.857-3.214L9 3z" />
  </svg>
);

const IconSecurity = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default function Home({
  onStart,
  onLogin,
  onLogout,
  isAuthenticated,
  user,
}) {
  const displayName =
    user?.name || user?.username || user?.email || user?.id || "";

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans text-slate-800">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        {/* Lighter overlay to show background clearly as requested */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent opacity-80" />
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        {/* GLASS CARD WRAPPER */}
        <div className="w-full bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-10 lg:p-14 text-center animate-fade-in-up">
          {/* HEADER */}
          <div className="mb-10">
            <div className="flex justify-center mb-6">
              <img
                src="/logo-hpt.png"
                alt="HPT Logo"
                className="h-12 sm:h-16 object-contain drop-shadow-sm"
              />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                QR Generator
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto font-medium">
              Giải pháp quản lý mã QR chuyên nghiệp cho HPT Vietnam Corporation
            </p>
          </div>

          {/* USER STATUS (If logged in) */}
          {isAuthenticated && displayName && (
            <div className="mb-8 inline-flex items-center gap-3 bg-white/80 backdrop-blur px-5 py-2.5 rounded-full shadow-sm border border-indigo-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">
                Xin chào, <span className="text-indigo-700">{displayName}</span>
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="ml-2 text-xs text-slate-500 hover:text-red-500 underline decoration-dotted underline-offset-2 transition-colors"
                >
                  Đăng xuất
                </button>
              )}
            </div>
          )}

          {/* FEATURES GRID - Light Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12 text-left bg-transparent">
            {[
              {
                title: "Đa Năng & Linh Hoạt",
                desc: "Tạo QR cho Website, Wi Fi, danh thiếp, Email trong vài giây.",
                color: "bg-blue-500",
                Icon: IconDiversity,
              },
              {
                title: "Chuẩn Hóa Thương Hiệu",
                desc: "Tự động gắn logo và màu nhận diện HPT, đồng bộ chuyên nghiệp.",
                color: "bg-purple-500",
                Icon: IconBrand,
              },
              {
                title: "Chất Lượng Cao",
                desc: "Xuất SVG, PNG, JPG sắc nét, sẵn sàng cho in ấn.",
                color: "bg-indigo-500",
                Icon: IconQuality,
              },
              {
                title: "An Toàn & Bảo Mật",
                desc: "Đăng nhập SSO Microsoft 365, bảo vệ dữ liệu nội bộ.",
                color: "bg-emerald-500",
                Icon: IconSecurity,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div
                  className={`absolute top-5 left-5 w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <item.Icon />
                </div>
                <div className="pl-16">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA BUTTONS */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={onStart}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base sm:text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 active:scale-95"
            >
              <span>
                {isAuthenticated ? "Bắt đầu tạo mã QR" : "Đăng nhập với Microsoft"}
              </span>
              <svg
                className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>

            {!isAuthenticated && (
              <p className="text-xs sm:text-sm text-slate-500 font-medium bg-white/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                * Vui lòng sử dụng tài khoản Microsoft HPT để truy cập
              </p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <p className="mt-8 text-xs sm:text-sm font-medium text-slate-600/80 drop-shadow-sm bg-white/20 px-4 py-1 rounded-full backdrop-blur-sm">
          © {new Date().getFullYear()} HPT Vietnam Corporation
        </p>
      </div>
    </div>
  );
}
