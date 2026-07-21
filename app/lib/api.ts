const API_BASE_URL = "http://localhost:8000";

export async function getStats(userId: number) {
  const response = await fetch(`${API_BASE_URL}/stats?user_id=${userId}`);
  return response.json();
}

export async function getRecentTrips(userId: number) {
  const response = await fetch(`${API_BASE_URL}/trips/recent?user_id=${userId}`);
  return response.json();
}

// 创建计划
export async function createTrip(trip: any) {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  });
  if (!response.ok) throw new Error("Failed to create trip");
  return response.json();
}

// 删除计划
export async function deleteTrip(tripId: number) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete trip");
  return response.json();
}

// 更新计划
export async function updateTrip(tripId: number, trip: any) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  });
  if (!response.ok) throw new Error("Failed to update trip");
  return response.json();
}

// 获取行程目的地列表
export async function getTripDestinations(tripId: number) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/destinations`);
  return response.json();
}

// 添加目的地到行程
export async function addTripDestination(tripId: number, dest: {
  name: string;
  description?: string;
  day_number?: number;
  budget?: number;
  actual_cost?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/destinations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dest),
  });
  if (!response.ok) throw new Error("Failed to add destination");
  return response.json();
}

// 更新目的地
export async function updateTripDestination(tripId: number, destId: number, dest: {
  name?: string;
  description?: string;
  day_number?: number;
  budget?: number;
  actual_cost?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/destinations/${destId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dest),
  });
  if (!response.ok) throw new Error("Failed to update destination");
  return response.json();
}

// 删除目的地
export async function deleteTripDestination(tripId: number, destId: number) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/destinations/${destId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete destination");
  return response.json();
}

// ===== Destination Library =====
export async function getDestinations() {
  const response = await fetch(`${API_BASE_URL}/destinations`);
  return response.json();
}

export async function createDestination(dest: {
  name: string;
  description: string;
  rating: number;
  country: string;
  tags: string;
  status: string;
  image_url: string;
}) {
  const response = await fetch(`${API_BASE_URL}/destinations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dest),
  });
  if (!response.ok) throw new Error("Failed to create destination");
  return response.json();
}

export async function updateDestination(id: number, dest: {
  name: string;
  description: string;
  rating: number;
  country: string;
  tags: string;
  status: string;
  image_url: string;
}) {
  const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dest),
  });
  if (!response.ok) throw new Error("Failed to update destination");
  return response.json();
}

export async function deleteDestination(id: number) {
  const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete destination");
  return response.json();
}

// ===== Favorites =====
export type FavoriteItem = {
  id: number;
  user_id: number;
  destination_id: number;
  created_at: string;
  destination: {
    id: number;
    name: string;
    description: string;
    rating: number;
    country: string;
    tags: string;
    status: string;
    image_url: string;
  };
};

export async function createFavorite(userId: number, destinationId: number) {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      destination_id: destinationId,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || "Failed to add favorite");
  }
  return data;
}

export async function getFavorites(userId: number): Promise<FavoriteItem[]> {
  const response = await fetch(`${API_BASE_URL}/favorites?user_id=${userId}`);
  if (!response.ok) throw new Error("Failed to fetch favorites");
  return response.json();
}

export async function deleteFavorite(favoriteId: number, userId: number) {
  const response = await fetch(`${API_BASE_URL}/favorites/${favoriteId}?user_id=${userId}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || "Failed to delete favorite");
  }
  return data;
}

