"use client";

import { useRef, useState } from "react";
import { updateDestination } from "@/app/lib/api";
import { normalizeImageUrl, readImageFile } from "@/app/lib/image";

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

interface EditDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination | null;
  onUpdated: () => void;
}
const emptyForm = {
  name: "",
  description: "",
  rating: 5,
  country: "",
  tags: "",
  status: "wishlist",
  image_url: "",
};

export default function EditDestinationModal({
  isOpen,
  onClose,
  destination,
  onUpdated,
}: EditDestinationModalProps) {
  const [form, setForm] = useState(() =>
    destination
      ? {
          name: destination.name,
          description: destination.description,
          rating: destination.rating,
          country: destination.country,
          tags: destination.tags,
          status: destination.status,
          image_url: destination.image_url,
        }
      : emptyForm
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  if (!isOpen || !destination) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await readImageFile(file);
      setForm((prev) => ({ ...prev, image_url: url }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Image upload failed, please try again.");
    } finally {
      setUploading(false);
      e.currentTarget.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Please enter a destination name.");
    setLoading(true);
    try {
      await updateDestination(destination.id, { ...form, image_url: normalizeImageUrl(form.image_url) });
      onUpdated();
      onClose();
    } catch {
      alert("Failed to update destination, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Destination</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1–5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="wishlist">Wishlist</option>
                <option value="planned">Planned</option>
                <option value="visited">Visited</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: normalizeImageUrl(e.target.value) })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50 whitespace-nowrap"
              >
                {uploading ? "Uploading…" : "Upload"}
              </button>
              {form.image_url && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, image_url: "" }))}
                  className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition whitespace-nowrap"
                >
                  Clear
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {form.image_url && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="mt-2 h-24 w-full rounded-md border border-gray-200 object-cover"
                />
                <p className="mt-1 text-xs text-green-600 truncate">✓ {form.image_url}</p>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}