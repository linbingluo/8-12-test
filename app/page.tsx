'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreateTripModal from './components/CreateTripModel';
import StatCard from './components/StatCard';
import TripCard from './components/TripCard';
import { getStats, getRecentTrips, deleteTrip } from './lib/api';
import EditTripModal from '@/app/components/EditTripModal';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 旅游计划页面的状态
  const [stats, setStats] = useState({
    total_trips: 0,
    total_destinations: 0,
    completed_trips: 0,
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 检查用户是否已登录
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      // 如果用户已登录，获取旅游计划数据
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      const statsData = await getStats();
      const tripsData = await getRecentTrips();
      setStats(statsData);
      setRecentTrips(tripsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTripSelection = (tripId: number, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, tripId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== tripId));
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTrips.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTrips.map((trip: any) => trip.id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      alert('请选择要删除的计划');
      return;
    }

    if (confirm(`确定要删除 ${selectedIds.length} 个计划吗？`)) {
      try {
        for (const id of selectedIds) {
          await deleteTrip(id);
        }
        setSelectedIds([]);
        setIsSelectMode(false);
        setLoading(true);
        fetchData();
        alert('批量删除成功');
      } catch (error) {
        console.error('Error batch deleting trips:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleCancelSelect = () => {
    setIsSelectMode(false);
    setSelectedIds([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const filteredTrips = recentTrips.filter((trip: any) =>
    trip.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statsCards = [
    {
      label: '总计划数',
      value: stats.total_trips,
      color: 'blue' as const,
    },
    {
      label: '目的地数',
      value: stats.total_destinations,
      color: 'green' as const,
    },
    {
      label: '已完成',
      value: stats.completed_trips,
      color: 'purple' as const,
    },
  ];

  // 未登录状态：显示欢迎首页
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* 导航栏 */}
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
                登录
              </Link>
              <Link
                href="/register"
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
              >
                注册
              </Link>
            </div>
          </div>
        </nav>

        {/* 主要内容 */}
        <main className="max-w-7xl mx-auto px-4 py-16">
          {/* 英雄区 */}
          <section className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              🌍 欢迎来到 Trip Planner
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              计划你的完美旅程，记录每一个美好时刻
            </p>

            <div className="flex justify-center space-x-4">
              <Link
                href="/login"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 text-lg font-semibold"
              >
                立即登录
              </Link>
              <Link
                href="/register"
                className="bg-indigo-500 text-white px-8 py-3 rounded-lg hover:bg-indigo-600 text-lg font-semibold"
              >
                创建账户
              </Link>
            </div>
          </section>

          {/* 功能介绍 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* 功能卡片 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
              <div className="text-4xl mb-4">📍</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">浏览目的地</h2>
              <p className="text-gray-600">
                探索世界各地的精彩目的地，发现隐藏的宝石和热门景点。
              </p>
            </div>

            {/* 功能卡片 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
              <div className="text-4xl mb-4">📅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">制定计划</h2>
              <p className="text-gray-600">
                轻松创建和组织你的旅游计划，安排每一天的活动和日程。
              </p>
            </div>

            {/* 功能卡片 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
              <div className="text-4xl mb-4">❤️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">收藏回忆</h2>
              <p className="text-gray-600">
                保存你最喜欢的地方和计划，随时回顾你的旅途回忆。
              </p>
            </div>
          </section>

          {/* 为什么选择我们 */}
          <section className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">为什么选择 Trip Planner？</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-left">
                <h3 className="text-xl font-semibold text-blue-600 mb-3">✨ 易于使用</h3>
                <p className="text-gray-600">
                  直观的界面让你在几分钟内就能开始规划你的旅程。
                </p>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-blue-600 mb-3">🔐 安全可靠</h3>
                <p className="text-gray-600">
                  你的数据被安全地存储，随时随地访问你的计划。
                </p>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-blue-600 mb-3">🌐 全球目的地</h3>
                <p className="text-gray-600">
                  访问全世界数千个目的地的信息和推荐。
                </p>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-blue-600 mb-3">👥 社区支持</h3>
                <p className="text-gray-600">
                  与其他旅行者分享经验和获取建议。
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* 页脚 */}
        <footer className="bg-gray-800 text-white text-center py-8 mt-16">
          <p>&copy; 2024 Trip Planner. 所有权利保留。</p>
        </footer>
      </div>
    );
  }

  // 已登录状态：显示旅游计划首页
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              TP
            </div>
            <span className="text-xl font-bold text-gray-800">Trip Planner</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-600">欢迎, {user.username}</span>
            <Link
              href="/profile"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              我的资料
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              退出登录
            </button>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 页面头部 */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">首页</h1>
            <p className="text-gray-600">
              快速开始规划，查看最近计划和整体进度。
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition flex-shrink-0"
          >
            + 开始规划
          </button>
        </div>

        {/* Hero 卡片 */}
        <div className="bg-white rounded-xl border border-gray-200 p-10 mb-8 flex gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              开始你的下一次冒险
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              创建路线、安排日期、管理预算，并把心仪的地点加入行程。
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                开始规划
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                浏览目的地
              </button>
            </div>
          </div>
          <div className="w-80 h-64 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-400">Image / Map preview</span>
          </div>
        </div>

        {/* 统计卡片 */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">加载中...</div>
        ) : (
          <div className="grid grid-cols-3 gap-6 mb-8">
            {statsCards.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                color={stat.color}
              />
            ))}
          </div>
        )}

        {/* 最近的计划 */}
        <div className="mb-8">
          {/* 搜索框容器 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">最近的计划</h2>

            {/* 搜索输入框 */}
            <input
              type="text"
              placeholder="搜索计划标题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              {filteredTrips.length > 0 && (
                <p className="text-sm text-gray-600">
                  找到 {filteredTrips.length} 个计划
                </p>
              )}
            </div>

            {/* 批量操作按钮栏 */}
            {isSelectMode ? (
              <div className="flex gap-2 items-center">
                {/* 全选按钮 */}
                <button
                  onClick={handleSelectAll}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  {selectedIds.length === filteredTrips.length ? '取消全选' : '全选'}
                </button>

                {/* 批量删除按钮 */}
                <button
                  onClick={handleBatchDelete}
                  disabled={selectedIds.length === 0}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition disabled:opacity-50"
                >
                  删除 ({selectedIds.length})
                </button>

                {/* 取消按钮 */}
                <button
                  onClick={handleCancelSelect}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSelectMode(true)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                批量操作
              </button>
            )}
          </div>

          {filteredTrips.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              {filteredTrips.map((trip: any) => (
                <TripCard
                  key={trip.id}
                  id={trip.id}
                  title={trip.title}
                  dateRange={trip.date_range}
                  destinations={trip.destinations_count}
                  budget={trip.budget}
                  rating={trip.rating}
                  status={trip.status}
                  onDeleted={() => {
                    setLoading(true);
                    fetchData();
                  }}
                  onEdit={() => {
                    setEditingTrip(trip);
                    setIsEditModalOpen(true);
                  }}
                  isSelectMode={isSelectMode}
                  isSelected={selectedIds.includes(trip.id)}
                  onSelectionChange={(selected) =>
                    handleTripSelection(trip.id, selected)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchQuery
                ? `没有找到包含 "${searchQuery}" 的计划`
                : "还没有计划，点击'开始规划'创建一个"}
            </div>
          )}
        </div>

        {/* Create Trip Modal */}
        <CreateTripModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTripCreated={() => {
            setLoading(true);
            fetchData();
          }}
        />

        {/* Edit Trip Modal */}
        <EditTripModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          trip={editingTrip}
          onTripUpdated={() => {
            setIsEditModalOpen(false);
            setLoading(true);
            fetchData();
          }}
        />
      </main>
    </div>
  );
}
