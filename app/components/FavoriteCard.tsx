"use client";

interface FavoriteCardProps {
  id: number;
  name: string;
  city: string;
  category: string;
  rating: number;
  country: string;
  saved_at: string;
  onEdit: () => void;
  onDeleted: () => void;
}

export default function FavoriteCard({
  name,
  city,
  category,
  rating,
  country,
  saved_at,
  onEdit,
  onDeleted,
}: FavoriteCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
      {/* Image placeholder */}
      <div className="relative w-full h-32 bg-gray-100 border-b border-gray-200">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <line x1="0" y1="0" x2="100" y2="100" stroke="#d1d5db" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="#d1d5db" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          {country && (
            <span className="border border-gray-300 text-gray-600 text-xs px-2 py-1 rounded">
              {country}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-2">{city} · {category}</p>

        <div className="text-gray-800 text-base mb-1">
          {"★".repeat(rating)}{"☆".repeat(Math.max(0, 5 - rating))}
        </div>

        <p className="text-sm text-gray-500 mb-4">Saved on {saved_at}</p>

        <div className="flex-1" />

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <button className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded hover:bg-gray-50 transition">
            Details
          </button>
          <button
            onClick={onEdit}
            className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded hover:bg-gray-50 transition"
          >
            Edit
          </button>
          <button
            onClick={onDeleted}
            className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}