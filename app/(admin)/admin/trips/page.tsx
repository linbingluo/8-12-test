"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = "http://localhost:8000";

type Trip = {
  id: number;
  user_id: number;
  username: string;
  title: string;
  date_range: string;
  destinations_count: number;
  budget: number;
  status: string;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  ongoing: "bg-blue-100 text-blue-700",
  draft: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: number } | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  const fetchTrips = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/trips?requester_id=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed");
      setTrips(await res.json());
    } catch {
      setError("Failed to load trips.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) fetchTrips();
  }, [currentUser, fetchTrips]);

  const handleDelete = async (tripId: number) => {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/trips/${tripId}?requester_id=${currentUser.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed");
      fetchTrips();
    } catch {
      alert("Failed to delete trip.");
    }
  };

  const filtered = trips.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.username.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statuses = ["all", ...Array.from(new Set(trips.map((t) => t.status)))];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Management</h1>
      <p className="text-gray-500 mb-6">View and manage all user trips.</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Trips</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{trips.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{trips.filter((t) => t.status === "completed").length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ongoing</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{trips.filter((t) => t.status === "ongoing").length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Draft</p>
          <p className="text-3xl font-bold text-gray-500 mt-1">{trips.filter((t) => t.status === "draft").length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-4 flex-wrap">
          <div className="flex gap-3 items-center flex-wrap">
            <input
              type="text"
              placeholder="Search title or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-52"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s === "all" ? "All Statuses" : s}</option>
              ))}
            </select>
          </div>
          <button onClick={fetchTrips} className="text-sm text-blue-500 hover:text-blue-600">🔄 Refresh</button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{trip.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{trip.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{trip.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{trip.date_range}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-center">{trip.destinations_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">${trip.budget}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[trip.status] || "bg-gray-100 text-gray-600"}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(trip.id)} className="text-sm text-red-500 hover:text-red-600 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">No trips found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
