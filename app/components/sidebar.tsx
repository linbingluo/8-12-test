"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

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
    </div>
  );
}