'use client';
import { useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { PencilIcon, CameraIcon, HeartIcon, ChatBubbleLeftIcon, EyeIcon, TrashIcon, CheckIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountDetails() {
  const {
    userData,
    token,
    updateUserProfile,
    uploadProfilePicture,
    error,
    success,
    setError,
    setSuccess,
  } = useContext(AuthContext);
  const router = useRouter();
  const profileId = userData?.id;
  const [userDetails, setUserDetails] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend-production.up.railway.app';
  const DEFAULT_IMAGE = '/def.jpg';

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
        await fetchUserDetails();
        setPreviewImage(null);
        setSelectedFile(null);
        showNotification('Profile picture updated successfully');
      } else {
        showNotification('Failed to update profile picture', 'error');
      }
    } catch (error) {
      showNotification('Failed to update profile picture', 'error');
    }
  };

  // Handle profile picture cancel
  const handleCancelProfilePicture = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      ])
        .then(() => setLoading(false))
        .catch(() => {
          setLoading(false);
          showNotification('Failed to load profile data', 'error');
        });
    }
  }, [profileId, token]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 px-6 py-3 rounded-xl text-white z-50 shadow-lg ${
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
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {deletePostId ? 'Delete Post' : 'Delete Account'}
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete {deletePostId ? 'this post' : 'your account'}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => (deletePostId ? handleDeletePost(deletePostId) : handleDeleteAccount())}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 mb-8 overflow-hidden"
        >
          <div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="relative -mb-16 mx-auto w-24 md:w-32 h-24 md:h-32">
                <Image
                  src={previewImage || userDetails?.image || DEFAULT_IMAGE}
                  alt={userDetails?.name || 'User'}
                  fill
                  className="rounded-full border-4 border-white object-cover shadow-md"
                  onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                >
                  <CameraIcon className="w-6 h-6 text-white" />
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <CheckIcon className="w-5 h-5" />
                Save
              </button>
              <button
                onClick={handleCancelProfilePicture}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <XMarkIcon className="w-5 h-5" />
                Cancel
              </button>
            </div>
          )}
          <div className="pt-16 pb-6 px-4 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{userDetails?.name || 'User'}</h1>
            <p className="text-sm text-gray-500">@{userDetails?.handle || 'unknown'}</p>
            {isEditingBio ? (
              <div className="mt-4 max-w-md mx-auto">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm text-gray-900 placeholder-gray-400"
                  rows={4}
                  maxLength={200}
                  placeholder="Tell us about yourself..."
                />
                <div className="flex gap-2 mt-3 justify-center">
                  <button
                    onClick={handleBioUpdate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingBio(false);
                      setBioText(userDetails?.bio || '');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex justify-center items-center gap-2">
                <p className="text-gray-600 max-w-md text-sm">{userDetails?.bio || 'Add a bio to tell people about yourself'}</p>
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="flex justify-center gap-6 mt-6 text-sm">
              <div className="text-center">
                <span className="font-semibold text-gray-900">{userDetails?.posts_count || 0}</span>
                <span className="text-gray-500"> Posts</span>
              </div>
              <div className="text-center">
                <span className="font-semibold text-gray-900">{userDetails?.followers_count || 0}</span>
                <span className="text-gray-500"> Followers</span>
              </div>
              <div className="text-center">
                <span className="font-semibold text-gray-900">{userDetails?.following_count || 0}</span>
                <span className="text-gray-500"> Following</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Your Posts</h2>
          {userPosts.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-500">No posts found.</p>
              <Link
                href="/write"
                className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Create your first post
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {userPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    {post.imageUrls && post.imageUrls.length > 0 && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={post.imageUrls[0]}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <Link href={`/posts/${post.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">{post.title}</h3>
                        </Link>
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
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">{post.description}</p>
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
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
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Followers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Followers</h2>
          {followers.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-500">No followers yet.</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-4">
              {followers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-none w-48 bg-white rounded-xl shadow-md border border-gray-100 p-4"
                >
                  <div className="relative h-12 w-12 mx-auto">
                    <Image
                      src={user.image || DEFAULT_IMAGE}
                      alt={user.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <Link
                    href={`/profile/${user.id}`}
                    className="block text-center mt-2 text-gray-900 font-medium hover:text-indigo-600 transition-colors truncate"
                  >
                    {user.name}
                  </Link>
                  <p className="text-gray-500 text-sm text-center truncate">@{user.handle || 'unknown'}</p>
                </motion.div>
              ))}
              {followers.length >= 5 && (
                <Link
                  href={`/profile/${profileId}/followers`}
                  className="flex-none w-48 bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center justify-center text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
                >
                  View all
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Following Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Following</h2>
          {following.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-500">Not following anyone yet.</p>
              <Link
                href="/explore"
                className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Find people to follow
              </Link>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-4">
              {following.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-none w-48 bg-white rounded-xl shadow-md border border-gray-100 p-4"
                >
                  <div className="relative h-12 w-12 mx-auto">
                    <Image
                      src={user.image || DEFAULT_IMAGE}
                      alt={user.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <Link
                    href={`/profile/${user.id}`}
                    className="block text-center mt-2 text-gray-900 font-medium hover:text-indigo-600 transition-colors truncate"
                  >
                    {user.name}
                  </Link>
                  <p className="text-gray-500 text-sm text-center truncate">@{user.handle || 'unknown'}</p>
                </motion.div>
              ))}
              {following.length >= 5 && (
                <Link
                  href={`/profile/${profileId}/following`}
                  className="flex-none w-48 bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center justify-center text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
                >
                  View all
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full bg-white rounded-xl shadow-md border border-gray-100 p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Account Settings</h2>
            {isSettingsOpen ? (
              <ChevronUpIcon className="w-6 h-6 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-6 h-6 text-gray-500" />
            )}
          </button>
          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mt-2 overflow-hidden"
              >
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-900">Name:</span> {userDetails?.name || 'N/A'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-900">Email:</span> {userDetails?.email || 'N/A'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-900">Username:</span> @{userDetails?.handle || 'unknown'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                    <Link
                      href="/account/change-password"
                      className="text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
                    >
                      Change Password
                    </Link>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
                    <button
                      onClick={() => openDeleteModal()}
                      className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Delete Account
                    </button>
                    <p className="text-gray-500 text-sm mt-2">
                      This will permanently delete your account and all associated data.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}