'use client';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext/AuthContext';
import Link from 'next/link';

export default function AccountDetails() {
  const { userData, isLoggedIn } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [userDetails, setUserDetails] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  useEffect(() => {
    if (isLoggedIn && userData?.id) {
      const fetchUserDetails = async () => {
        try {
          const response = await axios.get(`${baseUrl}/api/user/details`, {
            params: { id: userData.id },
            withCredentials: true,
          });
          if (response.data.success) {
            setUserDetails(response.data.data);
          } else {
            alert('Failed to fetch user details');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          alert('Failed to fetch user details');
        }
      };

      const fetchUserBlogs = async () => {
        try {
          const response = await axios.get(`${baseUrl}/api/user/blogs`, {
            params: { userId: userData.id },
            withCredentials: true,
          });
          if (response.data.success) {
            setUserBlogs(response.data.data);
          } else {
            alert('Failed to fetch user blogs');
          }
        } catch (error) {
          console.error('Error fetching user blogs:', error);
          alert('Error fetching user blogs');
        }
      };

      Promise.all([fetchUserDetails(), fetchUserBlogs()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, userData]);

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action is irreversible.')) return;
    try {
      const response = await axios.delete(`${baseUrl}/api/user/delete`, {
        params: { id: userData.id },
        withCredentials: true,
      });
      if (response.data.success) {
        alert('Account deleted successfully');
        window.location.href = '/';
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      const response = await axios.delete(`${baseUrl}/api/blogs/${blogId}`, {
        params: { userId: userData.id },
        withCredentials: true,
      });
      if (response.data.success) {
        setUserBlogs(userBlogs.filter((blog) => blog.id !== blogId));
        alert('Blog deleted successfully');
      } else {
        alert('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert('All fields are required');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match');
      return;
    }
    // Placeholder: Implement backend endpoint for password change
    alert('Password change is not yet implemented on the backend');
    setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'personalDetails':
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : userDetails ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Personal Details</h2>
                <div className="space-y-4">
                  <p className="text-lg">
                    <span className="font-medium">Name:</span> {userDetails.name}
                  </p>
                  <p className="text-lg">
                    <span className="font-medium">Email:</span> {userDetails.email}
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="mt-6 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </>
            ) : (
              <p className="text-gray-600">No user details found.</p>
            )}
          </div>
        );
      case 'myBlogs':
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Blogs</h2>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : userBlogs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                  >
                    {blog.imageUrl && (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                        {blog.description}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Link href={`/edit/${blog.id}`}>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No blogs found.</p>
            )}
          </div>
        );
      case 'changePassword':
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Account Settings</h2>
        </div>
        <ul className="mt-4">
          <li
            className={`px-6 py-3 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
              activeTab === 'personalDetails' ? 'bg-blue-50 text-blue-600 font-semibold' : ''
            }`}
            onClick={() => setActiveTab('personalDetails')}
          >
            Personal Details
          </li>
          <li
            className={`px-6 py-3 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
              activeTab === 'myBlogs' ? 'bg-blue-50 text-blue-600 font-semibold' : ''
            }`}
            onClick={() => setActiveTab('myBlogs')}
          >
            My Blogs
          </li>
          <li
            className={`px-6 py-3 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
              activeTab === 'changePassword' ? 'bg-blue-50 text-blue-600 font-semibold' : ''
            }`}
            onClick={() => setActiveTab('changePassword')}
          >
            Change Password
          </li>
        </ul>
      </aside>
      <main className="flex-1 p-8">{renderContent()}</main>
    </div>
  );
}