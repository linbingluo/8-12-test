'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CreateTripModal from '../../components/CreateTripModel';
import { CloseIcon, EditIcon } from '../../components/ActionIcons';
import StatCard from '../../components/StatCard';
import TripCard from '../../components/TripCard';
import EditTripModal from '@/app/components/EditTripModal';
import { getStats, getRecentTrips, deleteTrip, getUser, updateUser } from '../../lib/api';

type User = {
  id: number;
  username: string;
  email: string;
};

type TripStatus = 'draft' | 'ongoing' | 'completed';

type Trip = {
  id: number;
  title: string;
  date_range: string;
  destinations_count: number;
  budget: number;
  rating: number;
  status: TripStatus;
};

function normalizeTripStatus(status: string): TripStatus {
  if (status === 'completed') return 'completed';
  if (status === 'ongoing' || status === 'active') return 'ongoing';
  return 'draft';
}

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  try {
    return JSON.parse(userData) as User;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

export default function MainHomePage() {
  const router = useRouter();

  const [user] = useState<User | null>(getStoredUser);
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

  const [homeImageUrl, setHomeImageUrl] = useState('');
  const [isImageSaving, setIsImageSaving] = useState(false);

  const fetchData = async (userId: number) => {
    try {
      const [statsResult, tripsResult, userResult] = await Promise.all([
        getStats(userId),
        getRecentTrips(userId),
        getUser(userId),
      ]);

      setStats(statsResult);
      setRecentTrips(
        Array.isArray(tripsResult)
          ? tripsResult.map((trip) => ({
              ...trip,
              status: normalizeTripStatus(trip.status),
            }))
          : []
      );
      setHomeImageUrl(userResult.home_image_url || '');
      

    } catch (error) {
      console.error('Error fetching data:', error);
      setRecentTrips([]);
      setHomeImageUrl('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData(user.id);
  }, [router, user]);

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
      await fetchData(user!.id);
      alert('Batch delete successful');
    } catch (error) {
      console.error('Error batch deleting trips:', error);
      alert('Delete failed, please try again');
    }
  };
  const saveHomeImage = async (imageUrl: string) => {
    if (!user) return;
    const previousImage = homeImageUrl;
    setHomeImageUrl(imageUrl);
    setIsImageSaving(true);
    try {
      await updateUser(user.id, { home_image_url: imageUrl });
    } catch (error) {
      console.error('Error saving home image:', error);
      setHomeImageUrl(previousImage);
      alert('Failed to save image, please try again.');
    } finally {
      setIsImageSaving(false);
    }
  };

  const handleHomeImageUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new window.Image();
      img.onload = () => {
        const MAX_DIM = 1200;
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w >= h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        let imageUrl = dataUrl;
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        }

        void saveHomeImage(imageUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleHomeImageDelete = async () => {
    await saveHomeImage('');
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
          <div className="relative w-80 h-64 overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-100">
            {homeImageUrl ? (
              <img
                src={homeImageUrl}
                alt="Your home preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-sm px-6 text-center gap-4">
                <p>No home image yet. Upload one to personalize this section.</p>
                <label
                  htmlFor="home-image-upload"
                  className="inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 cursor-pointer"
                >
                  Upload Image
                </label>
              </div>
            )}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2 rounded-full bg-white/85 px-2 py-1 shadow-sm">

              <label
                htmlFor="home-image-upload"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                title={homeImageUrl ? 'Replace image' : 'Upload image'}
                aria-label={homeImageUrl ? 'Replace image' : 'Upload image'}
              >
                <EditIcon />
              </label>
              <input
                id="home-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleHomeImageUpload(e.target.files?.[0]);
                  e.currentTarget.value = '';
                }}
              />
              {homeImageUrl && (
                <button
                  onClick={() => void handleHomeImageDelete()}
                  className="text-gray-500 hover:text-red-600 transition"
                  title="Remove image"
                  aria-label="Remove image"
                  disabled={isImageSaving}
                >
                  <CloseIcon />
                </button>
              )}
            </div>
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
                    await fetchData(user!.id);
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
            await fetchData(user!.id);
          }}
        />

        <EditTripModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          trip={editingTrip ?? undefined}
          onTripUpdated={async () => {
            setIsEditModalOpen(false);
            setLoading(true);
            await fetchData(user!.id);
          }}
        />
      </main>
    </div>
  );
}