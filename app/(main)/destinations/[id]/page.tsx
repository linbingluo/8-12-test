"use client";

import { deleteDestination, getDestinationById } from "@/app/lib/api";
import { normalizeImageUrl } from "@/app/lib/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type DestinationDetail = {
  id: number;
  name: string;
  description: string;
  rating: number;
  country: string;
  tags: string;
  status: string;
  image_url: string;
};

const statusClass: Record<string, string> = {
  wishlist: "bg-blue-50 text-blue-700 border-blue-200",
  planned: "bg-purple-50 text-purple-700 border-purple-200",
  visited: "bg-green-50 text-green-700 border-green-200",
};

export default function DestinationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const destinationId = Number(params.id);

  const [destination, setDestination] = useState<DestinationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!destinationId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getDestinationById(destinationId);
        setDestination(data);
      } catch {
        setDestination(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [destinationId]);

  const tagList = useMemo(
    () => destination?.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
    [destination?.tags]
  );
  const imageUrl = normalizeImageUrl(destination?.image_url ?? "");

  const handleDelete = async () => {
    if (!destination) return;
    if (!confirm(`Delete "${destination.name}"?`)) return;
    setDeleting(true);
    try {
      await deleteDestination(destination.id);
      router.push("/destinations");
    } catch {
      alert("Failed to delete destination.");
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-gray-500">Loading destination...</div>;
  }

  if (!destination) {
    return (
      <div className="py-16 text-center text-gray-500">
        Destination not found.{" "}
        <button onClick={() => router.push("/destinations")} className="text-blue-600 underline">
          Back to destinations
        </button>
      </div>
    );
  }

  const statusLabel = destination.status
    ? destination.status.charAt(0).toUpperCase() + destination.status.slice(1)
    : "Unknown";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.push("/destinations")}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            Back to Destinations
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              aria-label="Open actions menu"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-10">
                <button
                  onClick={async () => {
                    const url = window.location.href;
                    await navigator.clipboard.writeText(url);
                    alert("Link copied.");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-50"
                >
                  Copy link
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 min-h-[260px] sm:min-h-[340px]">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={destination.name} className="w-full h-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">No image</div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 min-h-36">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={`${destination.name} visual`} className="w-full h-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">Story image</div>
              )}
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col justify-center">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Overview</p>
              <p className="text-sm text-gray-700">
                {destination.description || `${destination.name} is ready to be part of your next journey.`}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{destination.name}</h1>
              <p className="text-lg text-gray-500 mt-1">
                {destination.country ? `${destination.country} destination` : "Destination story"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm border border-gray-300 text-gray-700 bg-white">
                {destination.country || "Unknown country"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm border ${statusClass[destination.status] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="mt-5 border-t border-gray-100 pt-4 flex gap-2 overflow-x-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700 text-sm whitespace-nowrap">
              {"★".repeat(destination.rating)}
              {"☆".repeat(Math.max(0, 5 - destination.rating))}
            </span>
            {tagList.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full border border-gray-200 text-sm text-gray-700 whitespace-nowrap"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <article className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Story Block A</p>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">First impression</h2>
              <p className="text-sm text-gray-700 leading-6">
                {destination.description || "Add a short narrative here to describe the atmosphere and highlights."}
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 min-h-52">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={`${destination.name} story A`} className="w-full h-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">Image module</div>
              )}
            </div>
          </article>

          <article className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
            <div className="order-2 md:order-1 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 min-h-52">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={`${destination.name} story B`} className="w-full h-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">Image module</div>
              )}
            </div>
            <div className="order-1 md:order-2">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Story Block B</p>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Travel notes</h2>
              <p className="text-sm text-gray-700 leading-6">
                {tagList.length > 0
                  ? `Focus themes: ${tagList.join(", ")}. Use this area for short notes, local tips, and planning highlights.`
                  : "Use this area for short notes, local tips, and planning highlights."}
              </p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
