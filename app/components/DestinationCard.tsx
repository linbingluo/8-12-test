"use client";

interface DestinationCardProps {
  id: number;
  name: string;
  description: string;
  rating: number;
  country: string;
  tags: string;
  status: string;
  image_url: string;
  onEdit: () => void;
  onDeleted: () => void;
  onFavorite?: () => void;
  favoriteDisabled?: boolean;
}

export default function DestinationCard({
  image_url,
  name,
  description,
  rating,
  country,
  tags,
  onEdit,
  onDeleted,
  onFavorite,
  favoriteDisabled = false,
}: DestinationCardProps) {
  const tagList = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative w-full h-44 bg-gray-100 border-b border-gray-200 overflow-hidden">
        {image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty("display", "flex");
            }}
          />
        ) : null}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ display: image_url ? "none" : "flex" }}
        >
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <line x1="0" y1="0" x2="100" y2="100" stroke="#d1d5db" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="#d1d5db" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>

        </div>

      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name + Country */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          {country && (
            <span className="border border-gray-300 text-gray-600 text-xs px-2 py-1 rounded">
              {country}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-2">{description}</p>

        {/* Stars */}
        <div className="text-yellow-400 text-base mb-1">
          {"★".repeat(rating)}{"☆".repeat(Math.max(0, 5 - rating))}
        </div>

        {/* Country text */}
        {country && <p className="text-sm text-gray-500 mb-1">{country}</p>}

        {/* Tags */}
        {tagList.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">{tagList.join(", ")}</p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <button className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded hover:bg-gray-50 transition">
            Details
          </button>
          {onFavorite && (
            <button
              onClick={onFavorite}
              disabled={favoriteDisabled}
              className={`flex-1 border text-sm py-2 rounded transition ${
                favoriteDisabled
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600"
              }`}
            >
              Favorite
            </button>
          )}
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