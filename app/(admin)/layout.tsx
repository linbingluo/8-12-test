"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/users", label: "User Management", icon: "👥" },
    { href: "/admin/destinations", label: "Destinations", icon: "🌍" },
  ];

  return (
    <div className="fixed left-0 top-0 w-[280px] h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">
          A
        </div>
        <span className="text-lg font-bold">Admin Panel</span>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 mb-4">ADMIN MENU</p>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-red-600 text-white font-semibold"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <Link
          href="/home"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition"
        >
          <span>🔙</span>
          <span>Back to App</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.replace("/");
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== "admin") {
      router.replace("/home");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="ml-[280px] flex-1 p-8">{children}</main>
    </div>
  );
}
