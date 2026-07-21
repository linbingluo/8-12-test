"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDestinations, deleteDestination, createFavorite, getFavorites } from "@/app/lib/api";
import DestinationCard from "@/app/components/DestinationCard";
import CreateDestinationModal from "@/app/components/CreateDestinationModal";
import EditDestinationModal from "@/app/components/EditDestinationModal";
import MapView from "@/app/components/MapView";

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

export default function DestinationsPage() {
  const router = useRouter();
  const [userId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return null;
      const parsed = JSON.parse(userData);
      return parsed.id ?? null;
    } catch {
      return null;
    }
  });
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);

  // useEffect(() => {
  //   const userData = localStorage.getItem("user");
  //   if (!userData) {
  //     router.replace("/login");
  //     return;
  //   }
  //   fetchDestinations();
  // }, [router]);

  // const fetchDestinations = async () => {
  const fetchDestinations = useCallback(async (uid?: number) => {
    const resolvedUserId = uid ?? userId;
    setLoading(true);
    try {
      // const data = await getDestinations();
      const [data, favoritesData] = await Promise.all([
        getDestinations(),
        resolvedUserId ? getFavorites(resolvedUserId) : Promise.resolve([]),
      ]);
      setDestinations(Array.isArray(data) ? data : []);
      setFavoriteIds(
        Array.isArray(favoritesData)
          ? favoritesData.map((item) => item.destination_id)
          : []
      );
      
    } catch {
      console.error("Failed to fetch destinations");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      router.replace("/login");
      return;
    }
    const timer = setTimeout(() => {
      fetchDestinations(userId);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDestinations, router, userId]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteDestination(id);
      await fetchDestinations();
    } catch {
      alert("Failed to delete, please try again.");
    }
  };

  const handleFavorite = async (destinationId: number, destinationName: string) => {
    if (!userId) {
      alert("Please login first.");
      router.replace("/login");
      return;
    }
    try {
      await createFavorite(userId, destinationId);
      setFavoriteIds((prev) => [...prev, destinationId]);
      alert(`Added "${destinationName}" to favorites.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add favorite");
    }
  };

  const filtered = useMemo(() => {
    let result = destinations;
    if (search.trim()) {
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.country.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }
    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [destinations, search, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Destination Library</h1>
            <p className="text-gray-500 mt-1">Browse, filter, and manage destinations for trip planning.</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gray-900 text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            + New Destination
          </button>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6 mt-6">
          {/* Left: list */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
            {/* Search + filters */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Search destinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Status ▾</option>
                <option value="wishlist">Wishlist</option>
                <option value="planned">Planned</option>
                <option value="visited">Visited</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort ▾</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            {/* Cards grid */}
            {loading ? (
              <div className="text-center py-16 text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                {search || statusFilter !== "all"
                  ? "No destinations match your filters."
                  : 'No destinations yet. Click "+ New Destination" to add one.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filtered.map((dest) => (
                  <DestinationCard
                    key={dest.id}
                    {...dest}
                    onEdit={() => {
                      setEditingDest(dest);
                      setIsEditOpen(true);
                    }}
                    onDeleted={() => handleDelete(dest.id, dest.name)}
                    onFavorite={() => handleFavorite(dest.id, dest.name)}
                    favoriteDisabled={favoriteIds.includes(dest.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: map */}
          <div className="w-80 flex-shrink-0">
            <MapView count={filtered.length} />
          </div>
        </div>
      </main>

      <CreateDestinationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchDestinations}
      />

      <EditDestinationModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        destination={editingDest}
        onUpdated={fetchDestinations}
      />
    </div>
  );
}