'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateTripModal from '../../components/CreateTripModel';
import StatCard from '../../components/StatCard';
import TripCard from '../../components/TripCard';
import EditTripModal from '@/app/components/EditTripModal';
import { getStats, getRecentTrips, deleteTrip } from '../../lib/api';

type User = {
  id: number;
  username: string;
  email: string;
};

type Trip = {
  id: number;
  title: string;
  date_range: string;
  destinations_count: number;
  budget: number;
  rating: number;
  status: string;
};

export default function MainHomePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total_trips: 0,
    total_destinations: 0,
    completed_trips: 0,
  });

  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.replace('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
      fetchData();
    } catch {
      localStorage.removeItem('user');
      router.replace('/login');
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const [statsData, tripsData] = await Promise.all([getStats(), getRecentTrips()]);
      setStats(statsData);
      setRecentTrips(tripsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = useMemo(
    () =>
      recentTrips.filter((trip) =>
        trip.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [recentTrips, searchQuery]
  );

  const handleTripSelection = (tripId: number, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, tripId] : prev.filter((id) => id !== tripId)
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTrips.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTrips.map((trip) => trip.id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return alert('Please select a trip to delete.');

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} trips?`)) return;

    try {
      await Promise.all(selectedIds.map((id) => deleteTrip(id)));
      setSelectedIds([]);
      setIsSelectMode(false);
      setLoading(true);
      await fetchData();
      alert('Batch delete successful');
    } catch (error) {
      console.error('Error batch deleting trips:', error);
      alert('Delete failed, please try again');
    }
  };

  if (!user) {
    return <div className="text-gray-600">loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Home</h1>
            <p className="text-gray-600">Quickly start planning, view recent trips and overall progress.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            + Start Planning
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-10 mb-8 flex gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Next Adventure</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Create itineraries, schedule dates, manage budgets, and add your favorite destinations to your trips.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Start Planning
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                Browse Destinations
              </button>
            </div>
          </div>
          <div className="w-80 h-64 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-400">Image / Map preview</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard label="Total Trips" value={stats.total_trips} color="blue" />
            <StatCard label="Destinations" value={stats.total_destinations} color="green" />
            <StatCard label="Completed" value={stats.completed_trips} color="purple" />
          </div>
        )}

        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Trips</h2>
            <input
              type="text"
              placeholder="Search by trip title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              {filteredTrips.length > 0 && (
                <p className="text-sm text-gray-600">Found {filteredTrips.length} trips</p>
              )}
            </div>

            {isSelectMode ? (
              <div className="flex gap-2 items-center">
                <button
                  onClick={handleSelectAll}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  {selectedIds.length === filteredTrips.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleBatchDelete}
                  disabled={selectedIds.length === 0}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  Delete ({selectedIds.length})
                </button>
                <button
                  onClick={() => {
                    setIsSelectMode(false);
                    setSelectedIds([]);
                  }}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSelectMode(true)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Batch Actions
              </button>
            )}
          </div>

          {filteredTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  id={trip.id}
                  title={trip.title}
                  dateRange={trip.date_range}
                  destinations={trip.destinations_count}
                  budget={trip.budget}
                  rating={trip.rating}
                  status={trip.status}
                  onDeleted={async () => {
                    setLoading(true);
                    await fetchData();
                  }}
                  onEdit={() => {
                    setEditingTrip(trip);
                    setIsEditModalOpen(true);
                  }}
                  isSelectMode={isSelectMode}
                  isSelected={selectedIds.includes(trip.id)}
                  onSelectionChange={(selected) => handleTripSelection(trip.id, selected)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchQuery
                ? `No trips found containing "${searchQuery}"`
                : 'No trips yet, click "Start Planning" to create one'}
            </div>
          )}
        </div>

        <CreateTripModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTripCreated={async () => {
            setLoading(true);
            await fetchData();
          }}
        />

        <EditTripModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          trip={editingTrip}
          onTripUpdated={async () => {
            setIsEditModalOpen(false);
            setLoading(true);
            await fetchData();
          }}
        />
      </main>
    </div>
  );
}