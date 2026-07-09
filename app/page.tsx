'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      // Logged-in users are redirected to the post-login page
      router.replace('/home'); 
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Top Navigation (Only Before Login) */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              TP
            </div>
            <span className="text-xl font-bold text-gray-800">Trip Planner</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🌍 Welcome to Trip Planner
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Plan your perfect trip and capture every wonderful moment
          </p>

          <div className="flex justify-center space-x-4">
            <Link
              href="/login"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 text-lg font-semibold"
            >
              Login Now
            </Link>
            <Link
              href="/register"
              className="bg-indigo-500 text-white px-8 py-3 rounded-lg hover:bg-indigo-600 text-lg font-semibold"
            >
              Create Account
            </Link>
          </div>
        </section>

        {/* Features Introduction */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-4xl mb-4">📍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Explore Destinations</h2>
            <p className="text-gray-600">
              Discover amazing destinations around the world, uncover hidden gems and popular attractions.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Plan Your Trip</h2>
            <p className="text-gray-600">
              Easily create and organize your travel plans, schedule activities and itineraries for each day.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-4xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Cherish Memories</h2>
            <p className="text-gray-600">
              Save your favorite places and plans, and revisit your travel memories anytime.
            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Choose Trip Planner?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-left">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">✨ Easy to Use</h3>
              <p className="text-gray-600">An intuitive interface lets you start planning your trip in minutes.</p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">🔐 Secure and Reliable</h3>
              <p className="text-gray-600">Your data is securely stored, and you can access your plans anytime, anywhere.</p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">🌐 Global Destinations</h3>
              <p className="text-gray-600">Access information and recommendations for thousands of destinations worldwide.</p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">👥 Community Support</h3>
              <p className="text-gray-600">Share experiences and get advice from other travelers.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-8 mt-16">
        <p>&copy; 2026 Trip Planner. All rights reserved.</p>
      </footer>
    </div>
  );
}