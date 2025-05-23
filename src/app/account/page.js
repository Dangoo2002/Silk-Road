'use client';
import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Bars3Icon, XMarkIcon, UserCheck, UserX, ThumbsUp, MessageCircle, Share, PencilIcon, TrashIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountDetails() {
  const { userData, isLoggedIn, token } = useContext(AuthContext);
  const { userId: profileId } = useParams();
  const router = useRouter();
  const currentUserId = userData?.id || null;
  const isOwnProfile = profileId === currentUserId;

  const [activeTab, setActiveTab] = useState('profile');
  const [userDetails, setUserDetails] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend-production.up.railway.app';
  const DEFAULT_IMAGE = '/user-symbol.jpg';

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${baseUrl}/user/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setUserDetails(response.data.user);
        setBio(response.data.user.bio || '');
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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
      const response = await axios.post(
        `${baseUrl}/follow`,
        { userId: currentUserId, followId: profileId },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
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
        headers: { Authorization: `Bearer ${token}` },
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

  // Handle profile picture upload
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showNotification('Only image files are allowed', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size must be less than 5MB', 'error');
      return;
    }
    setProfilePicture(file);
    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
      const response = await axios.post(`${baseUrl}/api/upload-profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      if (response.data.success) {
        setUserDetails((prev) => ({ ...prev, image: response.data.imageUrl }));
        showNotification('Profile picture updated successfully');
      } else {
        showNotification('Failed to upload profile picture', 'error');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showNotification('Failed to upload profile picture', 'error');
    }
    setProfilePicture(null);
  };

  // Handle bio update
  const handleBioUpdate = async () => {
    if (!isOwnProfile) return;
    try {
      const response = await axios.put(
        `${baseUrl}/user/${currentUserId}`,
        { bio },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      if (response.data.success) {
        setUserDetails(response.data.user);
        showNotification('Bio updated successfully');
      } else {
        showNotification('Failed to update bio', 'error');
      }
    } catch (error) {
      console.error('Error updating bio:', error);
      showNotification('Failed to update bio', 'error');
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!isOwnProfile) return;
    try {
      const response = await axios.delete(`${baseUrl}/user/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        showNotification('Account deleted successfully');
        setTimeout(() => {
          router.push('/');
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
        headers: { Authorization: `Bearer ${token}` },
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openDeleteModal = (postId = null) => {
    setDeletePostId(postId);
    setShowDeleteModal(true);
  };

  // Initial fetch
  useEffect(() => {
    if (profileId && token) {
      setLoading(true);
      Promise.all([
        fetchUserDetails(),
        fetchUserPosts(),
        fetchFollowers(),
        fetchFollowing(),
      ]).finally(() => setLoading(false));
    }
  }, [profileId, token]);

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
            className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg"
          >
            {loading ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userDetails ? (
              <>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                  <div className="relative">
                    <Image
                      src={userDetails.image || DEFAULT_IMAGE}
                      alt={userDetails.name}
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-blue-100 object-cover"
                      onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                    />
                    {isOwnProfile && (
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfilePictureChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{userDetails.name}</h2>
                    <p className="text-gray-600 text-sm">@{userDetails.handle}</p>
                    {isOwnProfile ? (
                      <div className="mt-4">
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-gray-900"
                          rows="4"
                          maxLength={200}
                        />
                        <button
                          onClick={handleBioUpdate}
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300"
                        >
                          Save Bio
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-700 mt-4">{userDetails.bio || 'No bio provided'}</p>
                    )}
                    <div className="flex gap-6 mt-6">
                      <p className="text-gray-700">
                        <span className="font-semibold text-gray-900">{userDetails.followers_count}</span> Followers
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold text-gray-900">{userDetails.following_count}</span> Following
                      </p>
                    </div>
                    {!isOwnProfile && (
                      <button
                        onClick={userDetails.is_followed ? handleUnfollow : handleFollow}
                        className={`mt-6 px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
                          userDetails.is_followed
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {userDetails.is_followed ? (
                          <>
                            <UserX className="w-5 h-5" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-5 h-5" />
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
                    className="px-6 py-2 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition-all duration-300 w-full sm:w-auto"
                  >
                    Delete Account
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-600 text-center">No user details found.</p>
            )}
          </motion.div>
        );
      case 'posts':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Posts</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    {post.imageUrls && post.imageUrls[0] && (
                      <Link href={`/post/${post.id}`}>
                        <Image
                          src={post.imageUrls[0] || DEFAULT_IMAGE}
                          alt={post.title}
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover"
                          onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                        />
                      </Link>
                    )}
                    <div className="p-4">
                      <Link href={`/post/${post.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-500 transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-3">{post.description.replace(/<[^>]+>/g, '')}</p>
                      <p className="text-gray-500 text-xs mt-2">{formatDateTime(post.created_at)}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <ThumbsUp className={`w-4 h-4 ${post.is_liked ? 'fill-blue-500 text-blue-500' : ''}`} />
                          <span className="text-sm">{post.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{post.comments_count}</span>
                        </div>
                      </div>
                      {isOwnProfile && (
                        <div className="mt-4 flex gap-2">
                          <Link href={`/edit/${post.id}`}>
                            <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-all duration-300">
                              Edit
                            </button>
                          </Link>
                          <button
                            onClick={() => openDeleteModal(post.id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-all duration-300"
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
              <p className="text-gray-600 text-center">No posts found.</p>
            )}
          </motion.div>
        );
      case 'followers':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Followers</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : followers.length > 0 ? (
              <div className="space-y-4">
                {followers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300"
                  >
                    <Image
                      src={user.image || DEFAULT_IMAGE}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                    />
                    <div className="flex-1">
                      <Link href={`/profile/${user.id}`} className="text-gray-900 font-semibold hover:text-blue-500 transition-colors">
                        {user.name}
                      </Link>
                      <p className="text-gray-600 text-sm">@{user.handle}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center">No followers found.</p>
            )}
          </motion.div>
        );
      case 'following':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Following</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : following.length > 0 ? (
              <div className="space-y-4">
                {following.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300"
                  >
                    <Image
                      src={user.image || DEFAULT_IMAGE}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                    />
                    <div className="flex-1">
                      <Link href={`/profile/${user.id}`} className="text-gray-900 font-semibold hover:text-blue-500 transition-colors">
                        {user.name}
                      </Link>
                      <p className="text-gray-600 text-sm">@{user.handle}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center">Not following anyone.</p>
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
            className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg"
          >
            {loading ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userDetails ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Personal Details</h2>
                <div className="space-y-4">
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold text-gray-900">Name:</span> {userDetails.name}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold text-gray-900">Email:</span> {userDetails.email}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold text-gray-900">Bio:</span> {userDetails.bio || 'No bio provided'}
                  </p>
                </div>
                <button
                  onClick={() => openDeleteModal()}
                  className="mt-6 px-6 py-2 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition-all duration-300 w-full sm:w-auto"
                >
                  Delete Account
                </button>
              </>
            ) : (
              <p className="text-gray-600 text-center">No user details found.</p>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <style jsx>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 shadow-lg ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {deletePostId ? 'Delete Post' : 'Delete Account'}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {deletePostId ? 'this post' : 'your account'}? This action is irreversible.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => (deletePostId ? handleDeletePost(deletePostId) : handleDeleteAccount())}
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mobile Header with Toggle Button */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 sm:hidden">
        <h2 className="text-lg font-bold text-gray-900">{isOwnProfile ? 'Account Settings' : 'User Profile'}</h2>
        <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900 focus:outline-none">
          {isSidebarOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </header>

      <div className="flex flex-1 flex-col sm:flex-row max-w-7xl mx-auto">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -250 }}
          animate={{ x: isSidebarOpen ? 0 : -250 }}
          transition={{ duration: 0.3 }}
          className={`${
            isSidebarOpen ? 'block' : 'hidden'
          } sm:block w-full sm:w-64 bg-gray-50 border-r border-gray-200 absolute sm:static z-20 sm:z-auto h-full sm:h-auto shadow-sm`}
        >
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 hidden sm:block">
              {isOwnProfile ? 'Account Settings' : 'User Profile'}
            </h2>
          </div>
          <ul className="mt-2 sm:mt-4">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'posts', label: 'Posts' },
              { id: 'followers', label: 'Followers' },
              { id: 'following', label: 'Following' },
              ...(isOwnProfile ? [{ id: 'personalDetails', label: 'Personal Details' }] : []),
            ].map((tab) => (
              <motion.li
                key={tab.id}
                whileHover={{ x: 5 }}
                className={`px-4 sm:px-6 py-3 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-500 transition-all duration-300 text-sm sm:text-base ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-500 font-semibold' : ''
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