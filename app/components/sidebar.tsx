"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setIsAdmin(user.role === "admin");
    }
  }, []);

  const menuItems = [
    { href: "/home", label: "Home", icon: "🏠" },
    { href: "/my-trips", label: "My Trips", icon: "✈️" },
    { href: "/destinations", label: "Destinations", icon: "🌍" },
    { href: "/favorites", label: "Favorites", icon: "❤️" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="fixed left-0 top-0 w-[280px] h-screen bg-white border-r border-gray-200 p-6">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
          TP
        </div>
        <span className="text-lg font-bold text-gray-900">Trip Planner</span>
      </div>

      {/* Menu */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-4">MAIN MENU</p>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-50 border-l-4 border-blue-500 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Entry */}
      {isAdmin && (
        <div className="mt-8">
          <p className="text-xs font-semibold text-gray-500 mb-4">ADMIN</p>
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-semibold"
          >
            <span>🛡️</span>
            <span>Admin Panel</span>
          </Link>
        </div>
      )}
    </div>
  );
}
