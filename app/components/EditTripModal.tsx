"use client";

import { useState, useEffect } from "react";
import { updateTrip } from "@/app/lib/api";

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripUpdated: () => void;
  trip?: {
    id: number;
    title: string;
    date_range: string;
    destinations_count: number;
    budget: number;
    rating: number;
    status: string;
  };
}

export default function EditTripModal({
  isOpen,
  onClose,
  onTripUpdated,
  trip,
}: EditTripModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    date_range: "",
    destinations_count: 0,
    budget: 0,
    rating: 5,
    status: "draft",
  });
  const [loading, setLoading] = useState(false);

  // 当 trip 改变时，更新表单数据
  useEffect(() => {
    if (trip) {
      setFormData({
        title: trip.title,
        date_range: trip.date_range,
        destinations_count: trip.destinations_count,
        budget: trip.budget,
        rating: trip.rating,
        status: trip.status,
      });
    }
  }, [trip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;

    setLoading(true);
    try {
      await updateTrip(trip.id, formData);
      onTripUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating trip:", error);
      alert("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto p-4 z-50 sm:items-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full my-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Edit Trip</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trip Name *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Paris Trip"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range *
            </label>
            <input
              type="text"
              required
              value={formData.date_range}
              onChange={(e) =>
                setFormData({ ...formData, date_range: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2026-06-01 ~ 2026-06-10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Destinations
            </label>
            <input
              type="number"
              value={formData.destinations_count}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  destinations_count: parseInt(e.target.value) || 0,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (GBP)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <select
              value={formData.rating}
              onChange={(e) =>
                setFormData({ ...formData, rating: parseInt(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">★</option>
              <option value="2">★★</option>
              <option value="3">★★★</option>
              <option value="4">★★★★</option>
              <option value="5">★★★★★</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
