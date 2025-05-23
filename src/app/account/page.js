'use client';
import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  XMarkIcon,
  Bars3Icon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountDetails() {
  const { userData, isLoggedIn, token } = useContext(AuthContext);
  const params = useParams();
  const router = useRouter();

  const profileId = params?.userId || null;
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
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
  const DEFAULT_IMAGE = '/user-symbol.jpg';

  console.log('Rendering AccountDetails with state:', {
    mounted,
    profileId,
    token,
    isLoggedIn,
    activeTab,
  });

  useEffect(() => {
    setMounted(true);
    if (!params?.userId) {
      setError('Invalid profile ID. Please check the URL.');
      setLoading(false);
      router.push('/login');
    }
  }, [params, router]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchUserDetails = async () => {
    if (!profileId || !token) {
      setError('Missing authentication details. Please log in.');
      return;
    }
    try {
      const response = await axios.get(`${baseUrl}/user/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setUserDetails(response.data.user);
        setBio(response.data.user.bio || '');
      } else {
        throw new Error(response.data.message || 'Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error in fetchUserDetails:', error.message, error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to fetch user details');
      showNotification('Failed to fetch user details', 'error');
    }
  };

  const fetchUserPosts = async () => {
    if (!profileId || !token) {
      setError('Missing authentication details. Please log in.');
      return;
    }
    try {
      const response = await axios.get(`${baseUrl}/user/${profileId}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setUserPosts(response.data.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } else {
        throw new Error(response.data.message || 'Failed to fetch user posts');
      }
    } catch (error) {
      console.error('Error in fetchUserPosts:', error.message, error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to fetch user posts');
      showNotification('Failed to fetch user posts', 'error');
    }
  };

  const fetchFollowers = async () => {
    if (!profileId || !token) {
      setError('Missing authentication details. Please log in.');
      return;
    }
    try {
      const response = await axios.get(`${baseUrl}/followers/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setFollowers(response.data.followers.slice(0, 5));
      } else {
        throw new Error(response.data.message || 'Failed to fetch followers');
      }
    } catch (error) {
      console.error('Error in fetchFollowers:', error.message, error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to fetch followers');
      showNotification('Failed to fetch followers', 'error');
    }
  };

  const fetchFollowing = async () => {
    if (!profileId || !token) {
      setError('Missing authentication details. Please log in.');
      return;
    }
    try {
      const response = await axios.get(`${baseUrl}/following/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setFollowing(response.data.following.slice(0, 5));
      } else {
        throw new Error(response.data.message || 'Failed to fetch following');
      }
    } catch (error) {
      console.error('Error in fetchFollowing:', error.message, error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to fetch following');
      showNotification('Failed to fetch following', 'error');
    }
  };

  const handleFollow = async () => {
    if (!isLoggedIn || !currentUserId) {
      showNotification('Please log in to follow users', 'error');
      router.push('/login');
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
        showNotification(`Failed to follow user: ${response.data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error in handleFollow:', error.message, error.response?.data);
      showNotification('Failed to follow user', 'error');
    }
  };

  const handleUnfollow = async () => {
    if (!isLoggedIn || !currentUserId) {
      showNotification('Please log in to unfollow users', 'error');
      router.push('/login');
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
        showNotification(`Failed to unfollow user: ${response.data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error in handleUnfollow:', error.message, error.response?.data);
      showNotification('Failed to unfollow user', 'error');
    }
  };

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
        showNotification(`Failed to upload profile picture: ${response.data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error in handleProfilePictureChange:', error.message, error.response?.data);
      showNotification('Failed to upload profile picture', 'error');
    } finally {
      setProfilePicture(null);
    }
  };

  const handleBioUpdate = async () => {
    if (!isOwnProfile || !token) {
      showNotification('Please log in to update your bio', 'error');
      router.push('/login');
      return;
    }
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
        showNotification(`Failed to update bio: ${response.data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error in handleBioUpdate:', error.message, error.response?.data);
      showNotification('Failed to update bio', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!isOwnProfile || !token) {
      showNotification('Please log in to delete your account', 'error');
      router.push('/login');
      return;
    }
    try {
      const response = await axios.delete(`${baseUrl}/user/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        showNotification('Account deleted successfully');
        setTimeout(() => router.push('/'), 1000);
      } else {
        showNotification(`Failed to delete account: ${response.data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error in handleDeleteAccount:', error.message, error.response?.data);
      showNotification('Failed to delete account', 'error');
    }
    setShowDeleteModal(false);
  };

  const handleDeletePost = async (postId) => {
    if (!isOwnProfile || !token) {
      showNotification('Please log in to delete posts', 'error');
      router.push('/login');
      return;
    }
    try {
      const response = await axios.delete(`${baseUrl}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setUserPosts(userPosts.filter((post) => post.id !== postId));
        showNotification('Post deleted successfully');
      } else {
        showNotification(`Failed to delete post: ${response.data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error in handleDeletePost:', error.message, error.response?.data);
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

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    Promise.all([fetchUserDetails(), fetchUserPosts(), fetchFollowers(), fetchFollowing()])
      .catch((err) => {
        console.error('Retry fetch error:', err);
        setError('Failed to fetch data');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isCancelled = false;

    if (mounted && profileId && token && isLoggedIn) {
      setLoading(true);
      setError(null);
      Promise.all([fetchUserDetails(), fetchUserPosts(), fetchFollowers(), fetchFollowing()])
        .then(() => {
          if (!isCancelled) console.log('Initial fetch completed');
        })
        .catch((err) => {
          if (!isCancelled) {
            console.error('Initial fetch error:', err);
            setError('Failed to fetch data. Please try again.');
          }
        })
        .finally(() => {
          if (!isCancelled) setLoading(false);
        });
    } else {
      setLoading(false);
      if (mounted && (!token || !isLoggedIn)) {
        setError('Please log in to view this profile.');
        router.push('/login');
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [mounted, profileId, token, isLoggedIn]);

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

  if (!mounted || !profileId || !isLoggedIn || !token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-lg font-medium">{error || 'Checking authentication...'}</div>
      </div>
    );
  }

  const renderContent = () => {
    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg text-center"
        >
          <p className="text-red-600 text-lg">{error}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300 text-sm sm:text-base"
            >
              Go to Login
            </button>
          </div>
        </motion.div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-lg"
          >
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userDetails ? (
              <>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                  <div className="relative">
                    <Image
                      src={userDetails.image || DEFAULT_IMAGE}
                      alt={userDetails.name || 'User'}
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-blue-100 object-cover w-24 h-24 sm:w-32 sm:h-32"
                      onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                    />
                    {isOwnProfile && (
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300"
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
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{userDetails.name || 'User'}</h2>
                    <p className="text-gray-600 text-sm sm:text-base">@{userDetails.handle || 'user'}</p>
                    {isOwnProfile ? (
                      <div className="mt-4">
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 text-gray-900 text-sm sm:text-base"
                          rows="4"
                          maxLength={200}
                        />
                        <button
                          onClick={handleBioUpdate}
                          className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base"
                          disabled={!isLoggedIn}
                        >
                          Save Bio
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-700 mt-4 text-sm sm:text-base">{userDetails.bio || 'No bio provided'}</p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6">
                      <p className="text-gray-700 text-sm sm:text-base">
                        <span className="font-semibold text-gray-900">{userDetails.followers_count || 0}</span> Followers
                      </p>
                      <p className="text-gray-700 text-sm sm:text-base">
                        <span className="font-semibold text-gray-900">{userDetails.following_count || 0}</span> Following
                      </p>
                    </div>
                    {!isOwnProfile && (
                      <button
                        onClick={userDetails.is_followed ? handleUnfollow : handleFollow}
                        className={`mt-6 px-6 py-2 rounded-full text-sm sm:text-base font-medium flex items-center gap-2 transition-all duration-300 ${
                          userDetails.is_followed
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        disabled={!isLoggedIn}
                      >
                        {userDetails.is_followed ? (
                          <>
                            <UserIcon className="w-5 h-5" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserIcon className="w-5 h-5" />
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
                    className="px-6 py-2 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
                    disabled={!isLoggedIn}
                  >
                    Delete Account
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-600 text-center text-sm sm:text-base">No user details found.</p>
            )}
          </motion.div>
        );
      case 'posts':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-lg"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">Posts</h2>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                          alt={post.title || 'Post'}
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover"
                          onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                        />
                      </Link>
                    )}
                    <div className="p-4">
                      <Link href={`/post/${post.id}`}>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                          {post.title || 'Untitled'}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-3">{post.description?.replace(/<[^>]+>/g, '') || ''}</p>
                      <p className="text-gray-500 text-xs mt-2">{formatDateTime(post.created_at)}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <HandThumbUpIcon className={`w-4 h-4 ${post.is_liked ? 'fill-blue-600 text-blue-600' : ''}`} />
                          <span className="text-sm">{post.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          <span className="text-sm">{post.comments_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <ShareIcon className="w-4 h-4" />
                          <span className="text-sm">{post.shares_count || 0}</span>
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
                            disabled={!isLoggedIn}
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
              <p className="text-gray-600 text-center text-sm sm:text-base">No posts found.</p>
            )}
          </motion.div>
        );
      case 'followers':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-lg"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">Followers</h2>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
                      alt={user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12"
                      onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                    />
                    <div className="flex-1">
                      <Link href={`/profile/${user.id}`} className="text-gray-900 font-semibold hover:text-blue-600 transition-colors text-sm sm:text-base">
                        {user.name || 'User'}
                      </Link>
                      <p className="text-gray-600 text-xs sm:text-sm">@{user.handle || 'user'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center text-sm sm:text-base">No followers found.</p>
            )}
          </motion.div>
        );
      case 'following':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-lg"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">Following</h2>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
                      alt={user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12"
                      onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                    />
                    <div className="flex-1">
                      <Link href={`/profile/${user.id}`} className="text-gray-900 font-semibold hover:text-blue-600 transition-colors text-sm sm:text-base">
                        {user.name || 'User'}
                      </Link>
                      <p className="text-gray-600 text-xs sm:text-sm">@{user.handle || 'user'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center text-sm sm:text-base">Not following anyone.</p>
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
            className="p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-lg"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">Personal Details</h2>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userDetails ? (
              <>
                <div className="space-y-4">
                  <p className="text-sm sm:text-base text-gray-700">
                    <span className="font-semibold text-gray-900">Name:</span> {userDetails.name || 'User'}
                  </p>
                  <p className="text-sm sm:text-base text-gray-700">
                    <span className="font-semibold text-gray-900">Email:</span> {userDetails.email || 'N/A'}
                  </p>
                  <p className="text-sm sm:text-base text-gray-700">
                    <span className="font-semibold text-gray-900">Bio:</span> {userDetails.bio || 'No bio provided'}
                  </p>
                </div>
                <button
                  onClick={() => openDeleteModal()}
                  className="mt-6 px-6 py-2 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
                  disabled={!isLoggedIn}
                >
                  Delete Account
                </button>
              </>
            ) : (
              <p className="text-gray-600 text-center text-sm sm:text-base">No user details found.</p>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
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

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 shadow-lg max-w-xs w-full ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            <p className="text-sm sm:text-base">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              {deletePostId ? 'Delete Post' : 'Delete Account'}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base mb-6">
              Are you sure you want to delete {deletePostId ? 'this post' : 'your account'}? This action is irreversible.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => (deletePostId ? handleDeletePost(deletePostId) : handleDeleteAccount())}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300 text-sm sm:text-base"
                disabled={!isLoggedIn}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 sm:hidden">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{isOwnProfile ? 'Account Settings' : 'User Profile'}</h2>
        <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900 focus:outline-none">
          {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </header>

      <div className="flex flex-1 flex-col sm:flex-row max-w-7xl mx-auto w-full">
        <motion.aside
          initial={{ x: -250 }}
          animate={{ x: isSidebarOpen ? 0 : -250 }}
          transition={{ duration: 0.3 }}
          className={`${
            isSidebarOpen ? 'block' : 'hidden'
          } sm:block w-full sm:w-64 bg-gray-50 border-r border-gray-200 absolute sm:static z-20 h-full sm:h-auto shadow-sm`}
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
                className={`px-4 sm:px-6 py-3 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 text-sm sm:text-base ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-600 font-semibold' : ''
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

        <main className="flex-1 p-4 sm:p-6 md:p-8">{renderContent()}</main>
      </div>
    </div>
  );
}