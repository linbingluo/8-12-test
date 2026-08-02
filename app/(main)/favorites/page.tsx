"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteFavorite, getFavorites, FavoriteItem } from "@/app/lib/api";
import { normalizeImageUrl } from "@/app/lib/image";

export default function FavoritesPage() {
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
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadFavorites = useCallback(async (uid: number) => {
    setLoading(true);
    try {
      const data = await getFavorites(uid);
      setFavorites(Array.isArray(data) ? data : []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      router.replace("/login");
      return;
    }
    const timer = setTimeout(() => {
      loadFavorites(userId);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadFavorites, router, userId]);

  const handleDelete = async (favoriteId: number, destinationName: string) => {
    if (!userId) return;
    if (!confirm(`Remove "${destinationName}" from favorites?`)) return;

    try {
      await deleteFavorite(favoriteId, userId);
      await loadFavorites(userId);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to remove favorite");
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return favorites;
    return favorites.filter((favorite) => {
      const destination = favorite.destination;
      return (
        destination.name.toLowerCase().includes(query) ||
        destination.country.toLowerCase().includes(query)
      );
    });
  }, [favorites, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Favorites</h1>
            <p className="text-gray-500 mt-1">Your saved destinations for future trips.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search favorites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              {search.trim() ? "No favorites match your search." : "No favorites yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filtered.map((favorite) => {
                const destination = favorite.destination;
                const tagList = destination.tags
                  ? destination.tags.split(",").map((t) => t.trim()).filter(Boolean)
                  : [];
                const resolvedImageUrl = normalizeImageUrl(destination.image_url);

                return (
                  <div
                    key={favorite.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col"
                  >
                    <div className="relative w-full h-40 bg-gray-100 border-b border-gray-200 overflow-hidden">
                      {resolvedImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolvedImageUrl}
                          alt={destination.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                            (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty("display", "flex");
                          }}
                        />
                      ) : null}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ display: resolvedImageUrl ? "none" : "flex" }}
                      >
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                          <line x1="0" y1="0" x2="100" y2="100" stroke="#d1d5db" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                          <line x1="100" y1="0" x2="0" y2="100" stroke="#d1d5db" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{destination.name}</h3>
                        {destination.country && (
                          <span className="border border-gray-300 text-gray-600 text-xs px-2 py-1 rounded">
                            {destination.country}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mb-2">{destination.description}</p>
                      <div className="text-yellow-400 text-base mb-2">
                        {"★".repeat(destination.rating)}
                        {"☆".repeat(Math.max(0, 5 - destination.rating))}
                      </div>
                      {tagList.length > 0 && (
                        <p className="text-sm text-gray-500 mb-4">{tagList.join(", ")}</p>
                      )}

                      <div className="flex-1" />
                      <button
                        onClick={() => handleDelete(favorite.id, destination.name)}
                        className="mt-4 w-full border border-red-200 text-red-500 text-sm py-2 rounded hover:bg-red-50 transition"
                      >
                        Remove Favorite
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}