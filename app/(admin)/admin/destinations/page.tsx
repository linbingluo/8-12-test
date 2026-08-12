"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = "http://localhost:8000";

type Destination = {
  id: number;
  name: string;
  description: string;
  rating: number;
  country: string;
  tags: string;
  status: string;
  image_url: string;
};

const EMPTY_FORM = { name: "", description: "", rating: 5, country: "", tags: "", status: "wishlist", image_url: "" };

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/destinations`);
      if (!res.ok) throw new Error("Failed");
      setDestinations(await res.json());
    } catch {
      setError("Failed to load destinations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDestinations(); }, [fetchDestinations]);

  const handleEdit = (dest: Destination) => {
    setEditingDest(dest);
    setForm({ name: dest.name, description: dest.description, rating: dest.rating, country: dest.country, tags: dest.tags, status: dest.status, image_url: dest.image_url });
    setShowCreate(false);
  };

  const handleCreate = () => {
    setEditingDest(null);
    setForm(EMPTY_FORM);
    setShowCreate(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let res;
      if (editingDest) {
        res = await fetch(`${API_BASE_URL}/destinations/${editingDest.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/destinations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) throw new Error("Failed");
      setEditingDest(null);
      setShowCreate(false);
      fetchDestinations();
    } catch {
      alert("Failed to save destination.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this destination?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/destinations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      fetchDestinations();
    } catch {
      alert("Failed to delete destination.");
    }
  };

  const filtered = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase())
  );

  const showModal = editingDest !== null || showCreate;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Destination Management</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 font-medium"
        >
          + Add Destination
        </button>
      </div>
      <p className="text-gray-500 mb-6">Create, edit, and delete travel destinations.</p>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-4">
          <input
            type="text"
            placeholder="Search by name or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <button onClick={fetchDestinations} className="text-sm text-blue-500 hover:text-blue-600">🔄 Refresh</button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((dest) => (
                <tr key={dest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{dest.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{dest.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{dest.country || "—"}</td>
                  <td className="px-6 py-4 text-sm text-yellow-500">{"⭐".repeat(Math.min(dest.rating, 5))}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dest.status === "visited" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                      {dest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{dest.tags || "—"}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => handleEdit(dest)} className="text-sm text-blue-500 hover:text-blue-600 font-medium">Edit</button>
                    <button onClick={() => handleDelete(dest.id)} className="text-sm text-red-500 hover:text-red-600 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No destinations found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingDest ? "Edit Destination" : "Add Destination"}</h3>
            <div className="space-y-4">
              {[
                { label: "Name", key: "name", type: "text" },
                { label: "Country", key: "country", type: "text" },
                { label: "Image URL", key: "image_url", type: "text" },
                { label: "Tags (comma separated)", key: "tags", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={(form as Record<string, string | number>)[key] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="wishlist">wishlist</option>
                    <option value="visited">visited</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setEditingDest(null); setShowCreate(false); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
