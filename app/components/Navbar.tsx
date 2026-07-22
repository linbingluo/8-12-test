"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // const userData = localStorage.getItem("user");
    // if (userData) {
    //   setUser(JSON.parse(userData));
    // }

    const loadUser = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    loadUser();
    window.addEventListener("userUpdated", loadUser);
    return () => window.removeEventListener("userUpdated", loadUser);

  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.replace("/");
  };

  return (
    <div className="fixed top-0 left-[280px] right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-50">
      {/* Search Box */}
      <div className="flex-1 max-w-md">
        <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search trips, destinations, and favorites"
            className="flex-1 bg-gray-100 outline-none text-sm"
          />
        </div>
      </div>

      {/* Right-side Buttons */}
      <div className="flex items-center gap-4">
        <button className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center">
          🔔
        </button>

        {/* User Avatar + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            👤
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] p-4">
              {/* User Info */}
              {user ? (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-800">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-3">Not logged in</p>
              )}

              <hr className="border-gray-200 mb-3" />

              <Link
                href="/profile"
                onClick={() => setShowDropdown(false)}
                className="block text-sm text-gray-700 hover:text-blue-500 mb-2"
              >
                👤 Profile
              </Link>

              <button
                onClick={handleLogout}
                className="block w-full text-left text-sm text-red-500 hover:text-red-600"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        <button className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center">
          ☰
        </button>
      </div>
    </div>
  );
}