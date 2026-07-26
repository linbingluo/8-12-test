"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type DestinationMapItem = {
  id: number;
  name: string;

  country: string;
};

type MarkerItem = DestinationMapItem & {
  lat: number;
  lon: number;
};

const DEFAULT_CENTER: L.LatLngTuple = [20, 0];
const DEFAULT_ZOOM = 2;
// Nominatim usage policy requires no more than 1 request/second, with small safety margin.
const GEOCODE_DELAY_MS = 1100;

interface MapViewProps {
  destinations: DestinationMapItem[];
}

function AutoFit({ markers }: { markers: MarkerItem[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lon], 5);
      return;
    }

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lon] as L.LatLngTuple));
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [map, markers]);

  return null;
}

export default function MapView({ destinations }: MapViewProps) {
  const [markers, setMarkers] = useState<MarkerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const geocodeCache = useRef<Map<string, { lat: number; lon: number } | null>>(new Map());
  const destinationList = useMemo(() => destinations, [destinations]);

  useEffect(() => {
    let canceled = false;

    const fetchCoordinates = async () => {
      if (destinationList.length === 0) {
        setMarkers([]);
        setErrorMessage("");
        setProgress({ done: 0, total: 0 });
        return;
      }

      setLoading(true);
      setErrorMessage("");
      try {
        const pending = destinationList.filter((d) => {
          const key = [d.name, d.country].filter(Boolean).join(", ").trim().toLowerCase();
          return !geocodeCache.current.has(key);
        });
        setProgress({ done: 0, total: pending.length });

        for (let i = 0; i < pending.length; i += 1) {
          const d = pending[i];
          const key = [d.name, d.country].filter(Boolean).join(", ").trim().toLowerCase();
          const query = [d.name, d.country].filter(Boolean).join(", ");
          const response = await fetch(
            `/api/geocode?q=${encodeURIComponent(query)}`
          );

          if (response.ok) {
            const data = await response.json();

            const location =
              data?.location ??
              (Array.isArray(data) && data[0]
                ? { lat: Number(data[0].lat), lon: Number(data[0].lon) }
                : null);

            if (
              location &&
              Number.isFinite(location.lat) &&
              Number.isFinite(location.lon)
            ) {
              geocodeCache.current.set(key, location);
            } else {
              geocodeCache.current.set(key, null);
            }
          } else {
            geocodeCache.current.set(key, null);
          }

          
          if (!canceled) setProgress({ done: i + 1, total: pending.length });

          if (i < pending.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, GEOCODE_DELAY_MS));
          }
        }

        if (!canceled) {
          const results: MarkerItem[] = destinationList
            .map((d) => {
              const key = [d.name, d.country].filter(Boolean).join(", ").trim().toLowerCase();
              const location = geocodeCache.current.get(key);
              if (!location) return null;
              return { ...d, lat: location.lat, lon: location.lon };
            })
            .filter((item): item is MarkerItem => item !== null);

          setMarkers(results);
        }
      } catch (error) {
        if (!canceled) {
          console.error("Failed to geocode destinations:", error);
          setMarkers([]);
          setErrorMessage("Failed to load map locations. Please try again.");
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchCoordinates();

    return () => {
      canceled = true;
    };
  }, [destinationList]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Destination Map</h3>
      <div className="h-[520px] w-full rounded-lg overflow-hidden border border-gray-200">
        <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AutoFit markers={markers} />
          {markers.map((m) => (
            <CircleMarker key={m.id} center={[m.lat, m.lon]} radius={7} pathOptions={{ color: "#1d4ed8" }}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{m.name}</div>
                  {m.country && <div className="text-gray-600">{m.country}</div>}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      
      </div>
      <p className="text-xs text-gray-500 mt-3">
        {loading
          ? progress.total > 0
            ? `Locating destinations on map... (${progress.done}/${progress.total})`
            : "Locating destinations on map..."
          : `Showing ${markers.length} location${markers.length === 1 ? "" : "s"}`}
      </p>
      {errorMessage && <p className="text-xs text-red-600 mt-2">{errorMessage}</p>}

    </div>
  );
}