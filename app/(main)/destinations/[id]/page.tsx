"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDestination, type DestinationLibraryItem } from "@/app/lib/api";
import { normalizeImageUrl } from "@/app/lib/image";

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const destinationId = Number(params.id);
  const invalidDestinationId = !Number.isInteger(destinationId) || destinationId <= 0;
  const [destination, setDestination] = useState<DestinationLibraryItem | null>(null);
  const [loading, setLoading] = useState(!invalidDestinationId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (invalidDestinationId) {
      return;
    }

    const loadDestination = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getDestination(destinationId);
        setDestination(data);
      } catch (loadError) {
        setDestination(null);
        setError(loadError instanceof Error ? loadError.message : "Failed to load destination.");
      } finally {
        setLoading(false);
      }
    };

    loadDestination();
  }, [destinationId, invalidDestinationId]);

  const resolvedImageUrl = normalizeImageUrl(destination?.image_url || "");
  const tagList = destination?.tags
    ? destination.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];
  const countryLabel = destination?.country || "Not provided";
  const ratingValue = destination ? Math.max(0, Math.min(5, Math.round(destination.rating))) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/destinations")}
          className="mb-6 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition"
        >
          Back to Destinations
        </button>

        {invalidDestinationId ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">Destination unavailable</p>
            <p className="text-sm text-gray-500">Invalid destination.</p>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            Loading destination...
          </div>
        ) : error || !destination ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">Destination unavailable</p>
            <p className="text-sm text-gray-500">{error || "The destination could not be found."}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="relative w-full h-72 bg-gray-100 border-b border-gray-200 overflow-hidden">
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

            <div className="p-8 space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">{destination.name}</h1>
                  <p className="text-gray-500 mt-2">{destination.description}</p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <span className="border border-gray-300 text-gray-600 text-sm px-3 py-1 rounded-full">
                    {countryLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 capitalize">
                    {destination.status}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500 mb-2">Rating</p>
                  <p className="text-2xl text-yellow-400">
                    {"★".repeat(ratingValue)}
                    {"☆".repeat(Math.max(0, 5 - ratingValue))}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500 mb-2">Country</p>
                  <p className="text-lg font-semibold text-gray-900">{countryLabel}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500 mb-2">Status</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{destination.status}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-3">Tags</p>
                {tagList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tagList.map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No tags added.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
