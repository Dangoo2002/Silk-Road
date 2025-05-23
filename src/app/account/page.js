'use client';
import { useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { PencilIcon, CameraIcon, HeartIcon, ChatBubbleLeftIcon, EyeIcon, TrashIcon, Bars3Icon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { UserIcon, BookmarkIcon, UsersIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountDetails() {
  const {
    userData,
    token,
    loading: authLoading,
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
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend-production.up.railway.app';

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && (!userData?.id || !token)) {
      router.push('/login');
    }
  }, [authLoading, userData, token, router]);

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
        setBioText(response.data.user.bio || '');
      } else {
        showNotification('Failed to fetch user details', 'error');
      }
    } catch (error) {
      console.error('Fetch user details error:', error);
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
      showNotification('Error fetching following', 'error');
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(`${baseUrl}/user/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { id: profileId },
        withCredentials: true,
      });
      if (response.data.success) {
        showNotification('Account deleted successfully');
        setTimeout(() => router.push('/'), 1000);
      } else {
        showNotification('Failed to delete account', 'error');
      }
    } catch (error) {
      showNotification('Failed to delete account', 'error');
    }
    setShowDeleteModal(false);
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
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
      showNotification('Failed to delete post', 'error');
    }
    setShowDeleteModal(false);
    setDeletePostId(null);
  };

  // Handle bio update
  const handleBioUpdate = async () => {
    try {
      const success = await updateUserProfile({ bio: bioText });
      if (success) {
        setUserDetails((prev) => ({ ...prev, bio: bioText }));
        setIsEditingBio(false);
        showNotification('Bio updated successfully');
      }
    } catch (error) {
      showNotification('Failed to update bio', 'error');
    }
  };

  // Handle profile picture selection
  const handleProfilePictureChange = (e) => {
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

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // Handle profile picture save
  const handleSaveProfilePicture = async () => {
    if (!selectedFile) return;

    try {
      const success = await uploadProfilePicture(selectedFile);
      if (success) {
        await fetchUserDetails(); // Refresh user details to get updated image
        setPreviewImage(null);
        setSelectedFile(null);
        showNotification('Profile picture updated successfully');
      } else {
        showNotification('Failed to update profile picture', 'error');
      }
    } catch (error) {
      console.error('Save profile picture error:', error);
      showNotification('Failed to update profile picture', 'error');
    }
  };

  // Handle profile picture cancel
  const handleCancelProfilePicture = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (authLoading) return;
    if (profileId && token) {
      setLoading(true);
      Promise.all([
        fetchUserDetails(),
        fetchUserPosts(),
        fetchFollowers(),
        fetchFollowing(),
      ])
        .then(() => setLoading(false))
        .catch(() => {
          setLoading(false);
          showNotification('Failed to load profile data', 'error');
        });
    }
  }, [profileId, token, authLoading]);

  // Update bio text
  useEffect(() => {
    if (userDetails) {
      setBioText(userDetails.bio || '');
    }
  }, [userDetails]);

  // Handle notifications
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
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
            className="max-w-4xl mx-auto"
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : userDetails ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <div className="relative -mb-20 mx-auto w-32 h-32 sm:w-40 sm:h-40">
                      <Image
                        src={previewImage || userDetails.image || '/def.jpg'}
                        alt={userDetails.name}
                        fill
                        className="rounded-full border-4 border-white object-cover shadow-lg"
                        onError={() => setUserDetails((prev) => ({ ...prev, image: '/def.jpg' }))}
                      />
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
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
                  </div>
                </div>
                {previewImage && (
                  <div className="flex justify-center gap-3 pt-4 bg-gray-50">
                    <button
                      onClick={handleSaveProfilePicture}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <CheckIcon className="w-5 h-5" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelProfilePicture}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                )}
                <div className="pt-24 pb-8 px-4 sm:px-8 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{userDetails.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">@{userDetails.handle || 'unknown'}</p>
                  {isEditingBio ? (
                    <div className="mt-4 max-w-md mx-auto">
                      <textarea
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                        rows={4}
                        maxLength={200}
                        placeholder="Tell us about yourself..."
                      />
                      <div className="flex gap-2 mt-2 justified-center">
                        <button
                          onClick={handleBioUpdate}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingBio(false);
                            setBioText(userDetails.bio || '');
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex justify-center items-center gap-2">
                      <p className="text-gray-700 max-w-md text-sm">{userDetails.bio || 'Add a bio to tell people about yourself'}</p>
                      <button
                        onClick={() => setIsEditingBio(true)}
                        className="text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  <div className="flex justify-center gap-6 sm:gap-8 mt-6">
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
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Posts</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {userPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
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
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/posts/${post.id}`}>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors">{post.title}</h3>
                          </Link>
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{post.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/edit/${post.id}`}>
                            <button className="p-2 text-indigo-600 hover:text-indigo-800 transition-colors">
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => openDeleteModal(post.id)}
                            className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 text-gray-500 text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <HeartIcon className={`w-5 h-5 ${post.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                            <span>{post.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ChatBubbleLeftIcon className="w-5 h-5" />
                            <span>{post.comments_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <EyeIcon className="w-5 h-5" />
                            <span>{post.views}</span>
                          </div>
                          </div>
                        <p>{formatDateTime(post.created_at)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl shadow-lg border border-gray-100">
                <p className="text-gray-500">No posts found.</p>
                <Link
                  href="/write"
                  className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Followers</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : followers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {followers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative h-12 w-12">
                      <Image
                        src={user.image || '/def.jpg'}
                        alt={user.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/profile/${user.id}`}
                        className="text-gray-900 font-medium hover:text-indigo-600 transition-colors"
                      >
                        {user.name}\
                      </Link>
                      <p className="text-gray-500 text-sm">@{user.handle || 'unknown'}</p>
                    </div>
                  </motion.div>
                ))}
                {followers.length >= 5 && (
                  <Link
                    href={`/profile/${profileId}/followers`}
                    className="block text-center text-indigo-600 hover:text-indigo-800 mt-4"
                  >
                    View all followers
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl shadow-lg border border-gray-100">
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
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Following</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : following.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {following.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative h-12 w-12">
                      <Image
                        src={user.image || '/def.jpg'}
                        alt={user.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/profile/${user.id}`}
                        className="text-gray-900 font-medium hover:text-indigo-600 transition-colors"
                      >
                        {user.name}
                      </Link>
                      <p className="text-gray-500 text-sm">@{user.handle || 'unknown'}</p>
                    </div>
                  </motion.div>
                ))}
                {following.length >= 5 && (
                  <Link
                    href={`/profile/${profileId}/following`}
                    className="block text-center text-indigo-600 hover:text-indigo-800 mt-4"
                  >
                    View all following
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl shadow-lg border border-gray-100">
                <p className="text-gray-500">Not following anyone yet.</p>
                <Link
                  href="/explore"
                  className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : userDetails ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-indigo-600" />
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
                        <span className="font-medium text-gray-900">Username:</span> @{userDetails.handle || 'unknown'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Cog6ToothIcon className="w-5 h-5 text-indigo-600" />
                      Security
                    </h3>
                    <div className="pl-7">
                      <Link href="/account/change-password" className="text-indigo-600 hover:text-indigo-800">
                        Change Password
                      </Link>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TrashIcon className="w-5 h-5 text-red-600" />
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
              </div>
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

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -250 }}
          animate={{ x: isSidebarOpen ? 0 : -250 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:flex lg:flex-col border-r border-gray-100 ${
            isSidebarOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Account</h2>
            <button onClick={toggleSidebar} className="lg:hidden text-gray-600 hover:text-indigo-600">
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
          <ul className="flex-1 mt-4">
            {[
              { id: 'profile', label: 'Profile', icon: <UserIcon className="w-5 h-5" /> },
              { id: 'posts', label: 'Posts', icon: <BookmarkIcon className="w-5 h-5" /> },
              { id: 'followers', label: 'Followers', icon: <UsersIcon className="w-5 h-5" /> },
              { id: 'following', label: 'Following', icon: <UsersIcon className="w-5 h-5" /> },
              { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon className="w-5 h-5" /> },
            ].map((tab) => (
              <motion.li
                key={tab.id}
                whileHover={{ x: 5 }}
                className={`px-6 py-3 cursor-pointer text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 flex items-center gap-3 ${
                  activeTab === tab.id ? 'bg-indigo-50 text-indigo-600 font-semibold' : ''
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

        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">{renderContent()}</main>
      </div>
    </div>
  );
}