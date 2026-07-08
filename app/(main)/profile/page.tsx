'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 从本地存储获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setUsername(parsedUser.username);
      setEmail(parsedUser.email);
    } else {
      // 如果没有登录，跳转到登录页面
      router.replace('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          username: username,
          email: email,
          password: password || undefined,
        }),
      });

      const data = await response.json();

      if (data.message === '更新成功') {
        setSuccess('资料已更新！');
        // 更新本地存储
        localStorage.setItem('user', JSON.stringify({
          ...user,
          username,
          email,
        }));
        // 清空密码字段
        setPassword('');
      } else {
        setError(data.error || '更新失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // 清空本地存储
    localStorage.removeItem('user');
    // 跳转到登录页面
    router.replace('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">个人资料</h1>
          <Link href="/home" className="text-blue-500 hover:text-blue-600">
            返回首页
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 用户名输入框 */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="输入用户名"
              required
            />
          </div>

          {/* 邮箱输入框 */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="输入邮箱"
              required
            />
          </div>

          {/* 密码输入框（可选，只有要修改密码时才填） */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              新密码（可选，留空则不修改）
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="输入新密码"
            />
          </div>

          {/* 保存按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 mb-4"
          >
            {loading ? '保存中...' : '保存修改'}
          </button>
        </form>

        {/* 退出登录按钮 */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
