'use client';
import { useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { PencilIcon, CameraIcon } from '@heroicons/react/24/outline';
import { UserCheck, UserX, ThumbsUp, MessageCircle, Settings, User, Bookmark, Lock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountDetails() {
  const {
    userData,
    token,
    loading: authLoading, // Add authLoading from AuthContext
    updateUserProfile,
    uploadProfilePicture,
    error,
    success,
    setError,
    setSuccess,
  } = useContext(AuthContext);
  const router = useRouter();
  const profileId = userData?.id;
  const [activeTab, setActiveTab] = useState('profile');
  const [userDetails, setUserDetails] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && (!userData?.id || !token)) {
      console.log('No userData or token, redirecting to login');
      router.push('/login');
    }
  }, [authLoading, userData, token, router]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch user details
  const fetchUserDetails = async () => {
    console.log('Fetching user details for profileId:', profileId);
    try {
      const response = await axios.get(`${baseUrl}/user/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log('User details response:', response.data);
      if (response.data.success) {
        setUserDetails(response.data.user);
        setBioText(response.data.user.bio || '');
      } else {
        console.error('Failed to fetch user details:', response.data.message);
        showNotification('Failed to fetch user details', 'error');
      }
    } catch (error) {
      console.error('Error fetching user details:', error.message, error.response?.data);
      showNotification('Failed to fetch user details', 'error');
    }
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    console.log('Fetching user posts for profileId:', profileId);
    try {
      const response = await axios.get(`${baseUrl}/user/${profileId}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log('User posts response:', response.data);
      if (response.data.success) {
        setUserPosts(response.data.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } else {
        console.error('Failed to fetch user posts:', response.data.message);
        showNotification('Failed to fetch user posts', 'error');
      }
    } catch (error) {
      console.error('Error fetching user posts:', error.message, error.response?.data);
      showNotification('Error fetching user posts', 'error');
    }
  };

  // Fetch followers
  const fetchFollowers = async () => {
    console.log('Fetching followers for profileId:', profileId);
    try {
      const response = await axios.get(`${baseUrl}/followers/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log('Followers response:', response.data);
      if (response.data.success) {
        setFollowers(response.data.followers.slice(0, 5));
      } else {
        console.error('Failed to fetch followers:', response.data.message);
        showNotification('Failed to fetch followers', 'error');
      }
    } catch (error) {
      console.error('Error fetching followers:', error.message, error.response?.data);
      showNotification('Error fetching followers', 'error');
    }
  };

  // Fetch following
  const fetchFollowing = async () => {
    console.log('Fetching following for profileId:', profileId);
    try {
      const response = await axios.get(`${baseUrl}/following/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log('Following response:', response.data);
      if (response.data.success) {
        setFollowing(response.data.following.slice(0, 5));
      } else {
        console.error('Failed to fetch following:', response.data.message);
        showNotification('Failed to fetch following', 'error');
      }
    } catch (error) {
      console.error('Error fetching following:', error.message, error.response?.data);
      showNotification('Error fetching following', 'error');
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(`${baseUrl}/user/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log('Delete account response:', response.data);
      if (response.data.success) {
        showNotification('Account deleted successfully');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        console.error('Failed to delete account:', response.data.message);
        showNotification('Failed to delete account', 'error');
      }
    } catch (error) {
      console.error('Error deleting account:', error.message, error.response?.data);
      showNotification('Failed to delete account', 'error');
    }
    setShowDeleteModal(false);
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    try {
      const response = await axios.delete(`${baseUrl}/posts/${postId}`, {
        params: { userId: profileId },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log('Delete post response:', response.data);
      if (response.data.success) {
        setUserPosts(userPosts.filter((post) => post.id !== postId));
        showNotification('Post deleted successfully');
      } else {
        console.error('Failed to delete post:', response.data.message);
        showNotification('Failed to delete post', 'error');
      }
    } catch (error) {
      console.error('Error deleting post:', error.message, error.response?.data);
      showNotification('Failed to delete post', 'error');
    }
    setShowDeleteModal(false);
    setDeletePostId(null);
  };

  // Handle bio update
  const handleBioUpdate = async () => {
    try {
      const success = await updateUserProfile({ bio: bioText });
      console.log('Bio update result:', success);
      if (success) {
        setUserDetails((prev) => ({ ...prev, bio: bioText }));
        setIsEditingBio(false);
        showNotification('Bio updated successfully');
      }
    } catch (error) {
      console.error('Error updating bio:', error.message);
      showNotification('Failed to update bio', 'error');
    }
  };

  // Handle profile picture upload
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please upload an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      const success = await uploadProfilePicture(file);
      console.log('Profile picture upload result:', success);
      if (success) {
        await fetchUserDetails();
        showNotification('Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error.message);
      showNotification('Failed to upload profile picture', 'error');
    }
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
    if (authLoading) {
      console.log('Waiting for auth to initialize');
      return;
    }
    if (profileId && token) {
      console.log('Starting data fetch for profileId:', profileId);
      setLoading(true);
      Promise.all([
        fetchUserDetails(),
        fetchUserPosts(),
        fetchFollowers(),
        fetchFollowing(),
      ])
        .then((results) => {
          console.log('Promise.all resolved:', results);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Promise.all failed:', error);
          setLoading(false);
          showNotification('Failed to load profile data', 'error');
        });
    } else {
      console.warn('Missing profileId or token:', { profileId, token });
    }
  }, [profileId, token, authLoading]);

  // Update bio text when user details change
  useEffect(() => {
    if (userDetails) {
      setBioText(userDetails.bio || '');
    }
  }, [userDetails]);

  // Clear notifications when error/success changes
  useEffect(() => {
    if (error) {
      showNotification(error, 'error');
      setError('');
    }
    if (success) {
      showNotification(success, 'success');
      setSuccess('');
    }
  }, [error, success, setError, setSuccess]);

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
    if (authLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : userDetails ? (
              <>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                  <div className="relative group">
                    <Image
                      src={userDetails.image || '/default-avatar.png'}
                      alt={userDetails.name}
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-blue-100 object-cover"
                    />
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="absolute inset-0 rounded-full bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <CameraIcon className="w-8 h-8 text-white" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfilePictureChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{userDetails.name}</h2>
                      <button
                        onClick={() => setIsEditingBio(!isEditingBio)}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm">@{userDetails.handle}</p>

                    {isEditingBio ? (
                      <div className="mt-4">
                        <textarea
                          value={bioText}
                          onChange={(e) => setBioText(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          maxLength={200}
                          placeholder="Tell us about yourself..."
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleBioUpdate}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setIsEditingBio(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 mt-4">
                        {userDetails.bio || 'Add a bio to tell people about yourself'}
                      </p>
                    )}

                    <div className="flex gap-6 mt-6">
                      <div className="text-center">
                        <p className="text-gray-900 font-semibold text-lg">{userDetails.posts_count || 0}</p>
                        <p className="text-gray-500 text-sm">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-900 font-semibold text-lg">{userDetails.followers_count || 0}</p>
                        <p className="text-gray-500 text-sm">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-900 font-semibold text-lg">{userDetails.following_count || 0}</p>
                        <p className="text-gray-500 text-sm">Following</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-10">No user details found.</p>
            )}
          </motion.div>
        );
      case 'posts':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                  >
                    {post.imageUrls && post.imageUrls.length > 0 && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={post.imageUrls[0]}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-3">{post.description}</p>
                      <p className="text-gray-400 text-xs mt-3">{formatDateTime(post.created_at)}</p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-gray-500">
                            <ThumbsUp className={`w-4 h-4 ${post.is_liked ? 'fill-blue-500 text-blue-500' : ''}`} />
                            <span className="text-sm">{post.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">{post.comments_count}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/edit/${post.id}`}>
                            <button className="p-1 text-blue-600 hover:text-blue-800 transition-colors">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => openDeleteModal(post.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No posts found.</p>
                <Link
                  href="/write"
                  className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create your first post
                </Link>
              </div>
            )}
          </motion.div>
        );
      case 'followers':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Followers</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : followers.length > 0 ? (
              <div className="space-y-4">
                {followers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                  >
                    <div className="relative h-12 w-12">
                      <Image
                        src={user.image || '/default-avatar.png'}
                        alt={user.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/profile/${user.id}`}
                        className="text-gray-900 font-medium hover:text-blue-600 transition-colors"
                      >
                        {user.name}
                      </Link>
                      <p className="text-gray-500 text-sm">@{user.handle}</p>
                    </div>
                  </motion.div>
                ))}
                {followers.length >= 5 && (
                  <Link
                    href={`/profile/${profileId}/followers`}
                    className="block text-center text-blue-600 hover:text-blue-800 mt-4"
                  >
                    View all followers
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No followers yet.</p>
              </div>
            )}
          </motion.div>
        );
      case 'following':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Following</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : following.length > 0 ? (
              <div className="space-y-4">
                {following.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                  >
                    <div className="relative h-12 w-12">
                      <Image
                        src={user.image || '/default-avatar.png'}
                        alt={user.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/profile/${user.id}`}
                        className="text-gray-900 font-medium hover:text-blue-600 transition-colors"
                      >
                        {user.name}
                      </Link>
                      <p className="text-gray-500 text-sm">@{user.handle}</p>
                    </div>
                  </motion.div>
                ))}
                {following.length >= 5 && (
                  <Link
                    href={`/profile/${profileId}/following`}
                    className="block text-center text-blue-600 hover:text-blue-800 mt-4"
                  >
                    View all following
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Not following anyone yet.</p>
                <Link
                  href="/explore"
                  className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Find people to follow
                </Link>
              </div>
            )}
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : userDetails ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </h3>
                    <div className="space-y-3 pl-7">
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-900">Name:</span> {userDetails.name}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-900">Email:</span> {userDetails.email}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-900">Username:</span> @{userDetails.handle}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Security
                    </h3>
                    <div className="pl-7">
                      <Link href="/account/change-password" className="text-blue-600 hover:text-blue-800">
                        Change Password
                      </Link>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Danger Zone
                    </h3>
                    <div className="pl-7">
                      <button
                        onClick={() => openDeleteModal()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete Account
                      </button>
                      <p className="text-gray-500 text-sm mt-2">
                        This will permanently delete your account and all associated data.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-10">No user details found.</p>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {deletePostId ? 'Delete Post' : 'Delete Account'}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {deletePostId ? 'this post' : 'your account'}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => (deletePostId ? handleDeletePost(deletePostId) : handleDeleteAccount())}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="flex flex-1 flex-col sm:flex-row">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -250 }}
          animate={{ x: isSidebarOpen ? 0 : -250 }}
          transition={{ duration: 0.3 }}
          className={`${
            isSidebarOpen ? 'block' : 'hidden'
          } sm:block w-full sm:w-64 bg-white shadow-md absolute sm:static z-20 sm:z-auto h-full sm:h-auto`}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 hidden sm:block">Account Settings</h2>
          </div>
          <ul className="mt-4">
            {[
              { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
              { id: 'posts', label: 'Posts', icon: <Bookmark className="w-5 h-5" /> },
              { id: 'followers', label: 'Followers', icon: <UserCheck className="w-5 h-5" /> },
              { id: 'following', label: 'Following', icon: <UserX className="w-5 h-5" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
            ].map((tab) => (
              <motion.li
                key={tab.id}
                whileHover={{ x: 5 }}
                className={`px-6 py-3 cursor-pointer text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 text-sm sm:text-base flex items-center gap-3 ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-600 font-semibold' : ''
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
              >
                {tab.icon}
                {tab.label}
              </motion.li>
            ))}
          </ul>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 bg-gray-50">{renderContent()}</main>
      </div>
    </div>
  );
}