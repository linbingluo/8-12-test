'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      // 已登录用户直接进入登录后页面
      router.replace('/home'); // 如果你有 /dashboard，也可以改成 /dashboard
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航（仅登录前） */}
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
        {/* Hero 区 */}
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
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-4xl mb-4">📍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">浏览目的地</h2>
            <p className="text-gray-600">
              探索世界各地的精彩目的地，发现隐藏的宝石和热门景点。
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">制定计划</h2>
            <p className="text-gray-600">
              轻松创建和组织你的旅游计划，安排每一天的活动和日程。
            </p>
          </div>

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
              <p className="text-gray-600">直观的界面让你在几分钟内就能开始规划你的旅程。</p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">🔐 安全可靠</h3>
              <p className="text-gray-600">你的数据被安全地存储，随时随地访问你的计划。</p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">🌐 全球目的地</h3>
              <p className="text-gray-600">访问全世界数千个目的地的信息和推荐。</p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">👥 社区支持</h3>
              <p className="text-gray-600">与其他旅行者分享经验和获取建议。</p>
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