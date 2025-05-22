'use client';
import { useState, useEffect, useContext } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { UserCheck, UserX, ThumbsUp, MessageCircle, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountDetails() {
  const { userData, isLoggedIn } = useContext(AuthContext);
  const { userId: profileId } = useParams();
  const currentUserId = userData?.id || null;
  const isOwnProfile = profileId === currentUserId;

  const [activeTab, setActiveTab] = useState('profile');
  const [userDetails, setUserDetails] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);
  const [notification, setNotification] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${baseUrl}/user/${profileId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setUserDetails(response.data.user);
      } else {
        showNotification('Failed to fetch user details', 'error');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      showNotification('Failed to fetch user details', 'error');
    }
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/user/${profileId}/posts`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setUserPosts(response.data.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } else {
        showNotification('Failed to fetch user posts', 'error');
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      showNotification('Error fetching user posts', 'error');
    }
  };

  // Fetch followers
  const fetchFollowers = async () => {
    try {
      const response = await axios.get(`${baseUrl}/followers/${profileId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setFollowers(response.data.followers.slice(0, 5));
      } else {
        showNotification('Failed to fetch followers', 'error');
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
      showNotification('Error fetching followers', 'error');
    }
  };

  // Fetch following
  const fetchFollowing = async () => {
    try {
      const response = await axios.get(`${baseUrl}/following/${profileId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setFollowing(response.data.following.slice(0, 5));
      } else {
        showNotification('Failed to fetch following', 'error');
      }
    } catch (error) {
      console.error('Error fetching following:', error);
      showNotification('Error fetching following', 'error');
    }
  };

  // Handle follow
  const handleFollow = async () => {
    if (!currentUserId) {
      showNotification('Please log in to follow users', 'error');
      return;
    }
    try {
      const response = await axios.post(`${baseUrl}/follow`, {
        userId: currentUserId,
        followId: profileId,
      }, { withCredentials: true });
      if (response.data.success) {
        setUserDetails((prev) => ({
          ...prev,
          is_followed: true,
          followers_count: prev.followers_count + 1,
        }));
        fetchFollowers();
        showNotification('Followed successfully');
      } else {
        showNotification('Failed to follow user', 'error');
      }
    } catch (error) {
      console.error('Error following user:', error);
      showNotification('Failed to follow user', 'error');
    }
  };

  // Handle unfollow
  const handleUnfollow = async () => {
    if (!currentUserId) {
      showNotification('Please log in to unfollow users', 'error');
      return;
    }
    try {
      const response = await axios.delete(`${baseUrl}/unfollow`, {
        data: { userId: currentUserId, followId: profileId },
        withCredentials: true,
      });
      if (response.data.success) {
        setUserDetails((prev) => ({
          ...prev,
          is_followed: false,
          followers_count: prev.followers_count - 1,
        }));
        fetchFollowers();
        showNotification('Unfollowed successfully');
      } else {
        showNotification('Failed to unfollow user', 'error');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      showNotification('Failed to unfollow user', 'error');
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!isOwnProfile) return;
    try {
      const response = await axios.delete(`${baseUrl}/user/delete`, {
        params: { id: currentUserId },
        withCredentials: true,
      });
      if (response.data.success) {
        showNotification('Account deleted successfully');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        showNotification('Failed to delete account', 'error');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      showNotification('Failed to delete account', 'error');
    }
    setShowDeleteModal(false);
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    if (!isOwnProfile) return;
    try {
      const response = await axios.delete(`${baseUrl}/posts/${postId}`, {
        params: { userId: currentUserId },
        withCredentials: true,
      });
      if (response.data.success) {
        setUserPosts(userPosts.filter((post) => post.id !== postId));
        showNotification('Post deleted successfully');
      } else {
        showNotification('Failed to delete post', 'error');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showNotification('Failed to delete post', 'error');
    }
    setShowDeleteModal(false);
    setDeletePostId(null);
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showNotification('All fields are required', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    showNotification('Password change is not yet implemented on the backend', 'error');
    setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openDeleteModal = (postId = null) => {
    setDeletePostId(postId);
    setShowDeleteModal(true);
  };

  // Initial fetch
  useEffect(() => {
    if (profileId) {
      setLoading(true);
      Promise.all([
        fetchUserDetails(),
        fetchUserPosts(),
        fetchFollowers(),
        fetchFollowing(),
      ]).finally(() => setLoading(false));
    }
  }, [profileId]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50"
          >
            {loading ? (
              <p className="text-gray-400 text-center">Loading...</p>
            ) : userDetails ? (
              <>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                  <Image
                    src={userDetails.image || '/api/placeholder/80/80'}
                    alt={userDetails.name}
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-blue-500/50"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{userDetails.name}</h2>
                    <p className="text-gray-400 text-sm">@{userDetails.handle}</p>
                    <p className="text-gray-300 mt-2">{userDetails.bio || 'No bio provided'}</p>
                    <div className="flex gap-4 mt-4">
                      <p className="text-gray-300">
                        <span className="font-semibold text-white">{userDetails.followers_count}</span> Followers
                      </p>
                      <p className="text-gray-300">
                        <span className="font-semibold text-white">{userDetails.following_count}</span> Following
                      </p>
                    </div>
                    {!isOwnProfile && (
                      <button
                        onClick={userDetails.is_followed ? handleUnfollow : handleFollow}
                        className={`mt-4 px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-all duration-300 ${
                          userDetails.is_followed
                            ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                        }`}
                      >
                        {userDetails.is_followed ? (
                          <>
                            <UserX className="w-4 h-4" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            Follow
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => openDeleteModal()}
                    className="mt-6 px-4 py-2 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-all duration-300 w-full sm:w-auto"
                  >
                    Delete Account
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-center">No user details found.</p>
            )}
          </motion.div>
        );
      case 'posts':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Posts</h2>
            {loading ? (
              <p className="text-gray-400 text-center">Loading...</p>
            ) : userPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {userPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-900/50 backdrop-blur-lg rounded-lg overflow-hidden border border-gray-700/50 hover:shadow-xl transition-all duration-300"
                  >
                    {post.imageUrl && (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={400}
                        height={200}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-2">{post.title}</h3>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-3">{post.description}</p>
                      <p className="text-gray-500 text-xs mt-2">{formatDateTime(post.created_at)}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1 text-gray-400">
                          <ThumbsUp className={`w-4 h-4 ${post.is_liked ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          <span className="text-sm">{post.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{post.comments_count}</span>
                        </div>
                      </div>
                      {isOwnProfile && (
                        <div className="mt-4 flex gap-2">
                          <Link href={`/edit/${post.id}`}>
                            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-all duration-300">
                              Edit
                            </button>
                          </Link>
                          <button
                            onClick={() => openDeleteModal(post.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition-all duration-300"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center">No posts found.</p>
            )}
          </motion.div>
        );
      case 'followers':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Followers</h2>
            {loading ? (
              <p className="text-gray-400 text-center">Loading...</p>
            ) : followers.length > 0 ? (
              <div className="space-y-4">
                {followers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/70 transition-all duration-300"
                  >
                    <Image
                      src={user.image || '/api/placeholder/40/40'}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <Link href={`/profile/${user.id}`} className="text-white font-semibold hover:text-blue-400 transition-colors">
                        {user.name}
                      </Link>
                      <p className="text-gray-400 text-sm">@{user.handle}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center">No followers found.</p>
            )}
          </motion.div>
        );
      case 'following':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Following</h2>
            {loading ? (
              <p className="text-gray-400 text-center">Loading...</p>
            ) : following.length > 0 ? (
              <div className="space-y-4">
                {following.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/70 transition-all duration-300"
                  >
                    <Image
                      src={user.image || '/api/placeholder/40/40'}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <Link href={`/profile/${user.id}`} className="text-white font-semibold hover:text-blue-400 transition-colors">
                        {user.name}
                      </Link>
                      <p className="text-gray-400 text-sm">@{user.handle}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center">Not following anyone.</p>
            )}
          </motion.div>
        );
      case 'personalDetails':
        if (!isOwnProfile) return null;
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50"
          >
            {loading ? (
              <p className="text-gray-400 text-center">Loading...</p>
            ) : userDetails ? (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Personal Details</h2>
                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">Name:</span> {userDetails.name}
                  </p>
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">Email:</span> {userDetails.email}
                  </p>
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">Bio:</span> {userDetails.bio || 'No bio provided'}
                  </p>
                </div>
                <button
                  onClick={() => openDeleteModal()}
                  className="mt-6 px-4 py-2 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-all duration-300 w-full sm:w-auto"
                >
                  Delete Account
                </button>
              </>
            ) : (
              <p className="text-gray-400 text-center">No user details found.</p>
            )}
          </motion.div>
        );
      case 'changePassword':
        if (!isOwnProfile) return null;
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Change Password
              </button>
            </form>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700/50 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {deletePostId ? 'Delete Post' : 'Delete Account'}
            </h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete {deletePostId ? 'this post' : 'your account'}? This action is irreversible.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 text-gray-200 rounded-full hover:bg-gray-500 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => (deletePostId ? handleDeletePost(deletePostId) : handleDeleteAccount())}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mobile Header with Toggle Button */}
      <header className="flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 sm:hidden">
        <h2 className="text-lg font-bold text-white">{isOwnProfile ? 'Account Settings' : 'User Profile'}</h2>
        <button onClick={toggleSidebar} className="text-gray-300 hover:text-white focus:outline-none">
          {isSidebarOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </header>

      <div className="flex flex-1 flex-col sm:flex-row">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -250 }}
          animate={{ x: isSidebarOpen ? 0 : -250 }}
          transition={{ duration: 0.3 }}
          className={`${
            isSidebarOpen ? 'block' : 'hidden'
          } sm:block w-full sm:w-64 bg-gray-800/50 backdrop-blur-lg border-r border-gray-700/50 absolute sm:static z-20 sm:z-auto h-full sm:h-auto`}
        >
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white hidden sm:block">
              {isOwnProfile ? 'Account Settings' : 'User Profile'}
            </h2>
          </div>
          <ul className="mt-2 sm:mt-4">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'posts', label: 'Posts' },
              { id: 'followers', label: 'Followers' },
              { id: 'following', label: 'Following' },
              ...(isOwnProfile ? [
                { id: 'personalDetails', label: 'Personal Details' },
                { id: 'changePassword', label: 'Change Password' },
              ] : []),
            ].map((tab) => (
              <motion.li
                key={tab.id}
                whileHover={{ x: 5 }}
                className={`px-4 sm:px-6 py-3 cursor-pointer text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-300 text-sm sm:text-base ${
                  activeTab === tab.id ? 'bg-gradient-to-r from-blue-500/50 to-purple-600/50 text-white font-semibold' : ''
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
              >
                {tab.label}
              </motion.li>
            ))}
          </ul>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8">{renderContent()}</main>
      </div>
    </div>
  );
}