"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = "http://localhost:8000";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: number } | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ username: "", email: "", role: "user" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users?requester_id=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed");
      setUsers(await res.json());
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) fetchUsers();
  }, [currentUser, fetchUsers]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({ username: user.username, email: user.email, role: user.role });
  };

  const handleSave = async () => {
    if (!editingUser || !currentUser) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/users/${editingUser.id}?requester_id=${currentUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );
      if (!res.ok) throw new Error("Failed");
      setEditingUser(null);
      fetchUsers();
    } catch {
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/users/${userId}?requester_id=${currentUser.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed");
      fetchUsers();
    } catch {
      alert("Failed to delete user.");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
      <p className="text-gray-500 mb-6">View, edit roles, and delete users.</p>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <button onClick={fetchUsers} className="text-sm text-blue-500 hover:text-blue-600">
            🔄 Refresh
          </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{user.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.created_at ? user.created_at.slice(0, 10) : "—"}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => handleEdit(user)} className="text-sm text-blue-500 hover:text-blue-600 font-medium">Edit</button>
                    {user.id !== currentUser?.id && (
                      <button onClick={() => handleDelete(user.id)} className="text-sm text-red-500 hover:text-red-600 font-medium">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No users found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
