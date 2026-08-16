"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

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

function getDestinationKey(destination: DestinationMapItem) {
  return [destination.name, destination.country].filter(Boolean).join(", ").trim().toLowerCase();
}

function buildPopupContent(marker: MarkerItem) {
  const wrapper = document.createElement("div");
  wrapper.style.fontSize = "0.875rem";

  const name = document.createElement("div");
  name.style.fontWeight = "600";
  name.textContent = marker.name;
  wrapper.appendChild(name);

  if (marker.country) {
    const country = document.createElement("div");
    country.style.color = "#4b5563";
    country.textContent = marker.country;
    wrapper.appendChild(country);
  }

  return wrapper;
}

function syncMapMarkers(map: L.Map, markerLayer: L.LayerGroup, markers: MarkerItem[]) {
  markerLayer.clearLayers();

  markers.forEach((marker) => {
    L.circleMarker([marker.lat, marker.lon], {
      radius: 7,
      color: "#1d4ed8",
    })
      .bindPopup(buildPopupContent(marker))
      .addTo(markerLayer);
  });

  if (markers.length === 0) {
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    return;
  }

  if (markers.length === 1) {
    map.setView([markers[0].lat, markers[0].lon], 5);
    return;
  }

  const bounds = L.latLngBounds(markers.map((marker) => [marker.lat, marker.lon] as L.LatLngTuple));
  map.fitBounds(bounds, { padding: [24, 24] });
}

export default function MapView({ destinations }: MapViewProps) {
  const [markers, setMarkers] = useState<MarkerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const geocodeCache = useRef<Map<string, { lat: number; lon: number } | null>>(new Map());
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<MarkerItem[]>([]);

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const container = mapContainerRef.current;

    const map = L.map(container, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markerLayerRef.current = markerLayer;
    syncMapMarkers(map, markerLayer, markersRef.current);

    return () => {
      markerLayer.clearLayers();
      map.remove();
      markerLayerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current) {
      return;
    }

    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    syncMapMarkers(map, markerLayer, markers);
  }, [markers]);

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
        const pending = destinations.filter((destination) => !geocodeCache.current.has(getDestinationKey(destination)));
        setProgress({ done: 0, total: pending.length });

        for (let index = 0; index < pending.length; index += 1) {
          const destination = pending[index];
          const key = getDestinationKey(destination);
          const query = [destination.name, destination.country].filter(Boolean).join(", ");
          const response = await fetch(`/api/gencode?q=${encodeURIComponent(query)}`);

          if (response.ok) {
            const data = await response.json();
            const location =
              data?.location ??
              (Array.isArray(data) && data[0]
                ? { lat: Number(data[0].lat), lon: Number(data[0].lon) }
                : null);

            if (location && Number.isFinite(location.lat) && Number.isFinite(location.lon)) {
              geocodeCache.current.set(key, location);
            } else {
              geocodeCache.current.set(key, null);
            }
          } else {
            geocodeCache.current.set(key, null);
          }

          if (!canceled) {
            setProgress({ done: index + 1, total: pending.length });
          }

          if (index < pending.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, GEOCODE_DELAY_MS));
          }
        }

        if (!canceled) {
          const results: MarkerItem[] = destinations
            .map((destination) => {
              const location = geocodeCache.current.get(getDestinationKey(destination));
              if (!location) {
                return null;
              }

              return { ...destination, lat: location.lat, lon: location.lon };
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
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    fetchCoordinates();

    return () => {
      canceled = true;
    };
  }, [destinations]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Destination Map</h3>
      <div className="w-full rounded-lg overflow-hidden border border-gray-200" style={{ height: "520px" }}>
        <div ref={mapContainerRef} className="h-full w-full bg-gray-50" />
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
