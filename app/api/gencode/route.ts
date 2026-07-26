export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return Response.json({ error: "Missing query parameter: q" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      {
        headers: {
          "User-Agent": "travel-planner-map/1.0 (+https://github.com/linbingluo/7-22-travel)",
        },
        next: { revalidate: 60 * 60 * 24 },
      }
    );

    if (!response.ok) {
      return Response.json({ error: "Failed to geocode location" }, { status: response.status });
    }

    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(data) || data.length === 0) {
      return Response.json({ location: null });
    }

    const lat = Number(data[0].lat);
    const lon = Number(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return Response.json({ location: null });
    }

    return Response.json({ location: { lat, lon } });
  } catch (error) {
    return Response.json(
      {
        error: "Unexpected geocoding error",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return Response.json({ error: "Missing query parameter: q" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      {
        headers: {
          "User-Agent": "travel-planner-map/1.0 (+https://github.com/linbingluo/7-22-travel)",
        },
        next: { revalidate: 60 * 60 * 24 },
      }
    );

    if (!response.ok) {
      return Response.json({ error: "Failed to geocode location" }, { status: response.status });
    }

    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(data) || data.length === 0) {
      return Response.json({ location: null });
    }

    const lat = Number(data[0].lat);
    const lon = Number(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return Response.json({ location: null });
    }

    return Response.json({ location: { lat, lon } });
  } catch (error) {
    return Response.json(
      {
        error: "Unexpected geocoding error",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}