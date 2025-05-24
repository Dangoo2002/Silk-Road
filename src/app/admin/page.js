'use client';
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../components/AuthContext/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, CheckCircleIcon, XCircleIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { isAdminLoggedIn, adminToken, adminLogout, setError, setSuccess } = useContext(AuthContext);
  const [stats, setStats] = useState({ users: 0, blogs: 0 });
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  // Protect route
  useEffect(() => {
    if (!isAdminLoggedIn) {
      router.push('/admin/login');
    }
  }, [isAdminLoggedIn, router]);

  // Fetch data
  useEffect(() => {
    if (isAdminLoggedIn && adminToken) {
      setLoading(true);
      Promise.all([
        axios.get(`${baseUrl}/admin/stats`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        axios.get(`${baseUrl}/admin/users`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        axios.get(`${baseUrl}/admin/blogs`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ])
        .then(([statsRes, usersRes, blogsRes]) => {
          setStats(statsRes.data.stats);
          setUsers(usersRes.data.users);
          setBlogs(blogsRes.data.blogs);
          setLoading(false);
        })
        .catch((error) => {
          setError('Failed to load dashboard data');
          setLoading(false);
        });
    }
  }, [isAdminLoggedIn, adminToken, baseUrl, setError]);

  const handleDelete = async () => {
    try {
      if (deleteItem.type === 'user') {
        await axios.delete(`${baseUrl}/admin/users/${deleteItem.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setUsers(users.filter((user) => user.id !== deleteItem.id));
        setStats((prev) => ({ ...prev, users: prev.users - 1 }));
        setSuccess('User deleted successfully');
      } else if (deleteItem.type === 'blog') {
        await axios.delete(`${baseUrl}/admin/blogs/${deleteItem.blogType}/${deleteItem.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setBlogs(blogs.filter((blog) => blog.id !== deleteItem.id || blog.type !== deleteItem.blogType));
        setStats((prev) => ({ ...prev, blogs: prev.blogs - 1 }));
        setSuccess('Blog deleted successfully');
      }
    } catch (error) {
      setError('Failed to delete item');
    }
    setShowDeleteModal(false);
    setDeleteItem(null);
  };

  const handleVerify = async (userId, verified) => {
    try {
      const response = await axios.put(
        `${baseUrl}/admin/users/${userId}/verify`,
        { verified: !verified },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setUsers(users.map((user) => (user.id === userId ? response.data.user : user)));
      setSuccess(`User ${verified ? 'unverified' : 'verified'} successfully`);
    } catch (error) {
      setError('Failed to update verification status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={adminLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-center gap-4">
            <ChartBarIcon className="w-10 h-10 text-indigo-600" />
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats.users}</p>
              <p className="text-gray-500">Total Users</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-center gap-4">
            <DocumentTextIcon className="w-10 h-10 text-indigo-600" />
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats.blogs}</p>
              <p className="text-gray-500">Total Blogs</p>
            </div>
          </div>
        </motion.div>

        {/* Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Manage Users</h2>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Handle</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Posts</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Followers</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Verified</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">@{user.handle}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.posts_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.followers_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => handleVerify(user.id, user.verified)}
                        className="flex items-center gap-2"
                      >
                        {user.verified ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-500" />
                        )}
                        {user.verified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => {
                          setDeleteItem({ type: 'user', id: user.id });
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Blogs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Manage Blogs</h2>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Author</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blogs.map((blog) => (
                  <motion.tr
                    key={`${blog.type}-${blog.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{blog.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{blog.author}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">{blog.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(blog.created_at)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => {
                          setDeleteItem({ type: 'blog', id: blog.id, blogType: blog.type });
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Delete Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delete {deleteItem.type === 'user' ? 'User' : 'Blog'}
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Are you sure you want to delete this {deleteItem.type === 'user' ? 'user' : 'blog'}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}