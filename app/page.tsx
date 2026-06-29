"use client";

import { useState, useEffect } from "react";
import {
  getDestinations,
  createDestination,
  deleteDestination,
  Destination,
  CreateDestinationRequest,
} from "./api/destinations";

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CreateDestinationRequest>({
    name: "",
    description: "",
    rating: 5,
  });

  // Fetch destinations on component mount
  useEffect(() => {
    fetchDestinationsData();
  }, []);

  const fetchDestinationsData = async () => {
    setLoading(true);
    const data = await getDestinations();
    setDestinations(data);
    setLoading(false);
  };

  const handleCreateDestination = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log("Form submitted with:", formData);

  if (!formData.name.trim() || !formData.description.trim()) {
    alert("Please fill in all fields");
    return;
  }

  console.log("Creating destination...");
  const newDestination = await createDestination(formData);
  console.log("Response:", newDestination);

  if (newDestination) {
    setDestinations([...destinations, newDestination]);
    setFormData({ name: "", description: "", rating: 5 });
    alert("Destination created successfully!");
    await fetchDestinationsData();
  } else {
    alert("Failed to create destination");
  }
};

  const handleDeleteDestination = async (id: number) => {
    if (confirm("Are you sure you want to delete this destination?")) {
      const success = await deleteDestination(id);
      if (success) {
        setDestinations(destinations.filter((d) => d.id !== id));
        alert("Destination deleted successfully!");
      } else {
        alert("Failed to delete destination");
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ✈️ Travel Planner
          </h1>
          <p className="text-gray-600">Plan your next adventure</p>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Add New Destination
          </h2>
          <form onSubmit={handleCreateDestination} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Destination Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Paris"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the destination..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Rating (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rating: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Add Destination
            </button>
          </form>
        </div>
        
        {/* Destinations List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Destinations ({destinations.length})
          </h2>

          {loading ? (
            <p className="text-gray-600 text-center py-8">Loading destinations...</p>
          ) : destinations.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No destinations yet. Add one above!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {destinations.map((destination) => (
                <div
                  key={destination.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {destination.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{destination.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-2 text-gray-700 font-semibold">
                        {destination.rating}/5
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteDestination(destination.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}