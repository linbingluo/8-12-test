"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const API_BASE_URL = "http://localhost:8000";

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, admins: 0, trips: 0, destinations: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  const fetchStats = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [usersRes, tripsRes, destsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users?requester_id=${currentUser.id}`),
        fetch(`${API_BASE_URL}/admin/trips?requester_id=${currentUser.id}`),
        fetch(`${API_BASE_URL}/destinations`),
      ]);
      const users = usersRes.ok ? await usersRes.json() : [];
      const trips = tripsRes.ok ? await tripsRes.json() : [];
      const dests = destsRes.ok ? await destsRes.json() : [];
      setStats({
        users: users.length,
        admins: users.filter((u: { role: string }) => u.role === "admin").length,
        trips: trips.length,
        destinations: dests.length,
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) fetchStats();
  }, [currentUser, fetchStats]);

  const cards = [
    { label: "Total Users", value: stats.users, icon: "👥", href: "/admin/users", color: "text-blue-600" },
    { label: "Admins", value: stats.admins, icon: "🛡️", href: "/admin/users", color: "text-red-600" },
    { label: "Total Trips", value: stats.trips, icon: "✈️", href: "/admin/trips", color: "text-green-600" },
    { label: "Destinations", value: stats.destinations, icon: "🌍", href: "/admin/destinations", color: "text-purple-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome, {currentUser?.username || "Admin"} 👋
      </h1>
      <p className="text-gray-500 mb-8">Here's an overview of the platform.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-center gap-4"
          >
            <span className="text-4xl">{card.icon}</span>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.color}`}>
                {loading ? "—" : card.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
      <div className="grid grid-cols-3 gap-4">
        {[
          { href: "/admin/users", icon: "👥", label: "Manage Users", desc: "Edit roles, delete accounts" },
          { href: "/admin/trips", icon: "✈️", label: "Manage Trips", desc: "View and remove user trips" },
          { href: "/admin/destinations", icon: "🌍", label: "Manage Destinations", desc: "Add, edit, delete destinations" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-gray-100"
          >
            <span className="text-3xl">{item.icon}</span>
            <p className="font-semibold text-gray-900 mt-3">{item.label}</p>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
