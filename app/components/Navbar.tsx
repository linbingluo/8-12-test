"use client";

export default function Navbar() {
  return (
    <div className="fixed top-0 left-280px right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-50">
      {/* 搜索框 */}
      <div className="flex-1 max-w-md">
        <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2">
          <span>🔍</span>
          <input
            type="text"
            placeholder="搜索计划、目的地、收藏"
            className="flex-1 bg-gray-100 outline-none text-sm"
          />
        </div>
      </div>

      {/* 右侧按钮 */}
      <div className="flex items-center gap-4">
        <button className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center">
          🔔
        </button>
        <button className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center">
          👤
        </button>
        <button className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center">
          ☰
        </button>
      </div>
    </div>
  );
}