'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getRecentTrips, deleteTrip, createTrip, updateTrip } from '../../lib/api';
import CreateTripModal from '../../components/CreateTripModel';
import EditTripModal from '../../components/EditTripModal';
import { CloseIcon, EditIcon } from '../../components/ActionIcons';
import { normalizeImageUrl } from '@/app/lib/image';

type Trip = {
  id: number;
  title: string;
  date_range: string;
  destinations_count: number;
  budget: number;
  rating: number;
  status: string;
  image_url?: string;
};

const STATUS_OPTIONS = ['All', 'draft', 'active', 'completed'];
const SORT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Budget ↑', value: 'budget_asc' },
  { label: 'Budget ↓', value: 'budget_desc' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < rating ? '★' : '☆'}</span>
      ))}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || colors.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function MyTripsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.replace('/login');
      return;
    }
    try {
      const user = JSON.parse(userData);
      setUserId(user.id);
      loadTrips(user.id);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  const loadTrips = async (uid: number) => {
    setLoading(true);
    try {
      const data = await getRecentTrips(uid);
      setTrips(
        Array.isArray(data)
          ? data.map((trip) => ({
              ...trip,
              image_url: normalizeImageUrl(trip.image_url || ''),
            }))
          : []
      );
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = trips.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'All') {
      list = list.filter((t) => t.status === statusFilter);
    }
    if (sortBy === 'budget_asc') list = [...list].sort((a, b) => a.budget - b.budget);
    if (sortBy === 'budget_desc') list = [...list].sort((a, b) => b.budget - a.budget);
    return list;
  }, [trips, search, statusFilter, sortBy]);

  const handleDelete = async (tripId: number) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      await deleteTrip(tripId);
      if (userId) loadTrips(userId);
    } catch {
      alert('Delete failed, please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return alert('Please select at least one trip.');
    if (!confirm(`Delete ${selectedIds.length} trips?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteTrip(id)));
      setSelectedIds([]);
      setIsBulkMode(false);
      if (userId) loadTrips(userId);
    } catch {
      alert('Bulk delete failed.');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  
  
  
  const handleImageUpload = async (tripId: number, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      // Resize large images via canvas before saving
      const img = new Image();
      img.onload = async () => {



        const MAX_DIM = 1200;
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w >= h) { h = Math.round((h * MAX_DIM) / w); w = MAX_DIM; }
          else { w = Math.round((w * MAX_DIM) / h); h = MAX_DIM; }
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        
        let imageUrl = dataUrl;
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          imageUrl = canvas.toDataURL("image/jpeg", 0.8);
        }



      // Update local state immediately so the image shows right away
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, image_url: imageUrl } : t))
        );
        try {
          await updateTrip(tripId, { image_url: imageUrl });
          if (userId) loadTrips(userId);
        } catch {
          alert("Failed to save image. Please try again.");
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleImageDelete = async (tripId: number) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, image_url: undefined } : t))
    );
    try {
      await updateTrip(tripId, { image_url: null });
      if (userId) loadTrips(userId);
    } catch {
      alert("Failed to delete image. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Travel Plans</h1>
            <p className="text-gray-500 mt-1">Manage draft, active, and completed travel plans.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsBulkMode((v) => {
                  if (v) setSelectedIds([]);
                  return !v;
                });
              }}
              className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              {isBulkMode ? 'Cancel' : 'Bulk Edit'}
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              + New Trip
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search trip name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'Status: All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>

            {/* Bulk Edit controls */}
            {isBulkMode && (
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() =>
                    setSelectedIds(
                      selectedIds.length === filtered.length
                        ? []
                        : filtered.map((t) => t.id)
                    )
                  }
                  className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  {selectedIds.length === filtered.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  Delete ({selectedIds.length})
                </button>
                
              </div>
            
            )}
          </div>
        </div>

        {/* Trip Cards */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {search || statusFilter !== 'All'
              ? 'No trips match your filters.'
              : 'No trips yet. Click "+ New Trip" to create one.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((trip) => (
              <div
                key={trip.id}
                className={`bg-white rounded-xl border-2 transition ${
                  isBulkMode && selectedIds.includes(trip.id)
                    ? 'border-blue-500'
                    : 'border-gray-200'
                } flex flex-col`}
              >
                {/* Card image placeholder */}
                <div
                  className="relative h-40 bg-gray-100 rounded-t-xl flex items-center justify-center border-b border-dashed border-gray-300 cursor-pointer overflow-hidden"
                  onClick={() => isBulkMode && toggleSelect(trip.id)}
                >
                  {isBulkMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(trip.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelect(trip.id)}
                      className="w-5 h-5"
                    />
                  )}
                  {!isBulkMode && trip.image_url && (
                    <img
                      src={trip.image_url}
                      alt={`${trip.title} cover`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!isBulkMode && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full bg-white/85 px-2 py-1 shadow-sm">
                      <label
                        htmlFor={`trip-image-${trip.id}`}
                        className="text-gray-500 hover:text-blue-600 transition cursor-pointer"
                        title={trip.image_url ? "Change image" : "Add image"}
                      >
                        ✏️
                      </label>
                      <input
                        id={`trip-image-${trip.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          void handleImageUpload(trip.id, e.target.files?.[0]);
                          e.currentTarget.value = "";
                        }}
                      />
                      {trip.image_url && (
                        <button
                          onClick={() => void handleImageDelete(trip.id)}
                          className="text-gray-500 hover:text-red-600 transition"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}

                  {/* {!isBulkMode && !trip.image_url && (


                    // <span className="text-gray-300 text-sm">Image placeholder</span>
                  )} */}
                  

                </div>

                {/* Card body */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                      {trip.title}
                    </h3>

                    <div className="flex flex-col items-end gap-2">
                      
                      <StatusBadge status={trip.status} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{trip.date_range}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    {trip.destinations_count} destinations
                  </p>
                  <p className="text-sm text-gray-600 mb-2">Budget £{trip.budget}</p>
                  <StarRating rating={trip.rating} />

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-auto pt-4">
                    <button
                      onClick={() => router.push(`/my-trips/${trip.id}`)}
                      className="flex-1 border border-gray-300 text-gray-700 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition"
                    >
                      Details
                    </button>

                    
                    <button
                      onClick={() => {
                        setEditingTrip(trip);
                        setIsEditOpen(true);
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="flex-1 border border-red-200 text-red-500 py-1.5 rounded-lg text-sm hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        <CreateTripModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onTripCreated={async () => {
            setIsCreateOpen(false);
            if (userId) loadTrips(userId);
          }}
        />
        <EditTripModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          trip={editingTrip ?? undefined}
          onTripUpdated={async () => {
            setIsEditOpen(false);
            if (userId) loadTrips(userId);
          }}
        />
      </div>
    </div>
  );
}