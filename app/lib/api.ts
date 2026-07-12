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