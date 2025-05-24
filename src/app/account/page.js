'use client';
import { useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  PencilIcon,
  CameraIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  DocumentTextIcon,
  UsersIcon,
  CogIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';

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
  const [activeSection, setActiveSection] = useState('profile');
  const fileInputRef = useRef(null);
  const profileRef = useRef(null);
  const postsRef = useRef(null);
  const followersRef = useRef(null);
  const followingRef = useRef(null);
  const settingsRef = useRef(null);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend-production.up.railway.app';
  const DEFAULT_IMAGE = '/def.jpg';

  // Validate image URLs
  useEffect(() => {
    if (userDetails?.image) {
      if (typeof userDetails.image !== 'string') {
        console.error('Invalid userDetails.image:', userDetails.image);
        setUserDetails((prev) => ({ ...prev, image: null }));
        setError('Invalid profile image data');
      } else if (!userDetails.image.startsWith('http')) {
        console.warn('Non-URL image value:', userDetails.image);
      }
    }
    userPosts.forEach((post, index) => {
      if (post.imageUrls && (!Array.isArray(post.imageUrls) || post.imageUrls.some((url) => typeof url !== 'string'))) {
        console.error(`Invalid imageUrls for post ${index}:`, post.imageUrls);
        setError('Invalid post image data');
      }
    });
  }, [userDetails, userPosts, setError]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch user details with retry logic
  const fetchUserDetails = async (retryCount = 3) => {
    try {
      const response = await axios.get(`${baseUrl}/user/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        const user = response.data.user;
        user.image = typeof user.image === 'string' && user.image.startsWith('http') ? user.image : null;
        setUserDetails(user);
        setBioText(user.bio || '');
      } else {
        showNotification('Failed to fetch user details', 'error');
      }
    } catch (error) {
      console.error('Fetch user details error:', error);
      if (retryCount > 0) {
        console.log(`Retrying fetchUserDetails (${retryCount} attempts left)`);
        setTimeout(() => fetchUserDetails(retryCount - 1), 1000);
      } else {
        showNotification('Failed to fetch user details', 'error');
      }
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
      console.error('Fetch user posts error:', error);
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
      console.error('Fetch followers error:', error);
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
      console.error('Fetch following error:', error);
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
      console.error('Delete account error:', error);
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
      console.error('Delete post error:', error);
      showNotification('Failed to delete post', 'error');
    }
    setShowDeleteModal(false);
    setDeletePostId(null);
  };

  // Handle bio update
  const handleBioUpdate = async () => {
    if (!bioText || bioText.length > 200) {
      showNotification('Bio must be between 1 and 200 characters', 'error');
      return;
    }
    try {
      const success = await updateUserProfile({ bio: bioText });
      if (success) {
        setUserDetails((prev) => ({ ...prev, bio: bioText }));
        setIsEditingBio(false);
        showNotification('Bio updated successfully');
      } else {
        showNotification('Failed to update bio', 'error');
      }
    } catch (error) {
      console.error('Bio update error:', error);
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
    if (!selectedFile) {
      showNotification('No image selected', 'error');
      return;
    }

    try {
      const success = await uploadProfilePicture(selectedFile);
      if (success) {
        setPreviewImage(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await fetchUserDetails();
        showNotification('Profile picture updated successfully');
      } else {
        showNotification('Failed to update profile picture', 'error');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
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

  // Scroll to section
  const scrollToSection = (section) => {
    setActiveSection(section);
    const refMap = {
      profile: profileRef,
      posts: postsRef,
      followers: followersRef,
      following: followingRef,
      settings: settingsRef,
    };
    const ref = refMap[section];
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Initial fetch
  useEffect(() => {
    if (profileId && token) {
      setLoading(true);
      Promise.all([fetchUserDetails(), fetchUserPosts(), fetchFollowers(), fetchFollowing()])
        .then(() => setLoading(false))
        .catch((error) => {
          console.error('Initial fetch error:', error);
          setLoading(false);
          showNotification('Failed to load profile data', 'error');
        });
    } else {
      setLoading(false);
      showNotification('User not authenticated', 'error');
      router.push('/login');
    }
  }, [profileId, token, router]);

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
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-pink-500 border-l-indigo-500 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Floating Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl px-6 py-3 shadow-lg shadow-gray-200/20 md:flex hidden"
      >
        <div className="flex items-center space-x-6">
          {[
            { key: 'profile', icon: UserIcon, label: 'Profile' },
            { key: 'posts', icon: DocumentTextIcon, label: 'Posts' },
            { key: 'followers', icon: UsersIcon, label: 'Followers' },
            { key: 'following', icon: UsersIcon, label: 'Following' },
            { key: 'settings', icon: CogIcon, label: 'Settings' },
          ].map(({ key, icon: Icon, label }) => (
            <motion.button
              key={key}
              onClick={() => scrollToSection(key)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-2 rounded-xl transition-all duration-300 ${
                activeSection === key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="sr-only">{label}</span>
              {activeSection === key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl -z-10"
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Mobile Sidebar */}
      <div className="fixed inset-y-0 left-0 w-16 bg-gray-50 shadow-md z-50 flex flex-col items-center py-4 md:hidden">
        {[
          { key: 'profile', icon: UserIcon, label: 'Profile' },
          { key: 'posts', icon: DocumentTextIcon, label: 'Posts' },
          { key: 'followers', icon: UsersIcon, label: 'Followers' },
          { key: 'following', icon: UsersIcon, label: 'Following' },
          { key: 'settings', icon: CogIcon, label: 'Settings' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => scrollToSection(key)}
            className={`p-2 mb-4 rounded-full ${
              activeSection === key ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.9 }}
            className={`fixed top-24 right-6 px-6 py-4 rounded-2xl text-white z-50 shadow-2xl backdrop-blur-sm ${
              notification.type === 'success'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-red-500 to-pink-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              {notification.type === 'success' ? (
                <CheckIcon className="w-5 h-5" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {deletePostId ? 'Delete Post' : 'Delete Account'}
                </h3>
                <p className="text-gray-600 mb-8">
                  Are you sure you want to delete {deletePostId ? 'this post' : 'your account'}? This action cannot be undone.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => (deletePostId ? handleDeletePost(deletePostId) : handleDeleteAccount())}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-20 md:ml-16">
        {/* Profile Section */}
        <motion.div
          ref={profileRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl shadow-gray-200/20 mb-16 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="relative w-32 h-32 lg:w-40 lg:h-40">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                  <Image
                    src={
                      previewImage ||
                      (userDetails?.image && typeof userDetails.image === 'string'
                        ? `${userDetails.image.split('?')[0]}?t=${Date.now()}`
                        : DEFAULT_IMAGE)
                    }
                    alt={userDetails?.name || 'User'}
                    width={160}
                    height={160}
                    priority
                    className="relative z-10 w-full h-full rounded-full border-4 border-white object-cover shadow-2xl"
                    onError={(e) => {
                      console.error('Profile image load error:', e);
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current.click()}
                    className="absolute inset-0 z-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <CameraIcon className="w-8 h-8 text-white" />
                  </motion.button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePictureChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {previewImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center space-x-3 mt-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveProfilePicture}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg flex items-center space-x-2"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>Save</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancelProfilePicture}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Cancel</span>
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  {userDetails?.name || 'User'}
                </h1>
                <p className="text-gray-500 mb-4 text-lg">@{userDetails?.handle || 'unknown'}</p>

                {/* Bio Section */}
                {isEditingBio ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                  >
                    <textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white/80 backdrop-blur-sm"
                      rows={4}
                      maxLength={200}
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex justify-center lg:justify-start space-x-3 mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBioUpdate}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg"
                      >
                        Save Bio
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsEditingBio(false);
                          setBioText(userDetails?.bio || '');
                        }}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mb-6 flex items-center justify-center lg:justify-start space-x-3">
                    <p className="text-gray-600 max-w-md">
                      {userDetails?.bio || 'Add a bio to tell people about yourself'}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsEditingBio(true)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}

                {/* Stats */}
                <div className="flex justify-center lg:justify-start space-x-8">
                  {[
                    { label: 'Posts', value: userDetails?.posts_count || 0 },
                    { label: 'Followers', value: userDetails?.followers_count || 0 },
                    { label: 'Following', value: userDetails?.following_count || 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {value}
                      </div>
                      <div className="text-gray-500 text-sm">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts Section */}
        <motion.div
          ref={postsRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Your Posts
            </h2>
            <Link href="/write">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium shadow-lg flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>New Post</span>
              </motion.button>
            </Link>
          </div>

          {userPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/50"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-6">No posts found. Share your thoughts with the world!</p>
              <Link href="/write">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium shadow-lg"
                >
                  Create your first post
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {userPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  >
                    {post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 0 && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={
                            post.imageUrls[0] && typeof post.imageUrls[0] === 'string'
                              ? `${post.imageUrls[0]}?t=${Date.now()}`
                              : DEFAULT_IMAGE
                          }
                          alt={post.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            console.error('Post image load error:', e);
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <Link href={`/posts/${post.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>
                        <div className="flex gap-2">
                          <Link href={`/edit/${post.id}`}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </motion.button>
                          </Link>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openDeleteModal(post.id)}
                            className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                      <div
                        className="mt-2 text-sm text-gray-600 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.description) }}
                      />
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
          ref={followersRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
            Followers
          </h2>
          {followers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/50"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-6">No followers yet.</p>
            </motion.div>
          ) : (
            <div className="flex overflow-x-auto gap-6 pb-4">
              {followers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-none w-48 bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-4 shadow-lg"
                >
                  <div className="relative h-12 w-12 mx-auto">
                    <Image
                      src={
                        user.image && typeof user.image === 'string'
                          ? `${user.image}?t=${Date.now()}`
                          : DEFAULT_IMAGE
                      }
                      alt={user.name}
                      fill
                      className="rounded-full object-cover"
                      onError={(e) => {
                        console.error('Follower image load error:', e);
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                  </div>
                  <Link
                    href={`/profile/${user.id}`}
                    className="block text-center mt-2 text-gray-900 font-medium hover:text-blue-600 transition-colors truncate"
                  >
                    {user.name}
                  </Link>
                  <p className="text-gray-500 text-sm text-center truncate">@{user.handle || 'unknown'}</p>
                </motion.div>
              ))}
              {followers.length >= 5 && (
                <Link
                  href={`/profile/${profileId}/followers`}
                  className="flex-none w-48 bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-4 flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  View all
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Following Section */}
        <motion.div
          ref={followingRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
            Following
          </h2>
          {following.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/50"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-6">Not following anyone yet.</p>
              <Link
                href="/explore"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium shadow-lg"
              >
                Find people to follow
              </Link>
            </motion.div>
          ) : (
            <div className="flex overflow-x-auto gap-6 pb-4">
              {following.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-none w-48 bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-4 shadow-lg"
                >
                  <div className="relative h-12 w-12 mx-auto">
                    <Image
                      src={
                        user.image && typeof user.image === 'string'
                          ? `${user.image}?t=${Date.now()}`
                          : DEFAULT_IMAGE
                      }
                      alt={user.name}
                      fill
                      className="rounded-full object-cover"
                      onError={(e) => {
                        console.error('Following image load error:', e);
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                  </div>
                  <Link
                    href={`/profile/${user.id}`}
                    className="block text-center mt-2 text-gray-900 font-medium hover:text-blue-600 transition-colors truncate"
                  >
                    {user.name}
                  </Link>
                  <p className="text-gray-500 text-sm text-center truncate">@{user.handle || 'unknown'}</p>
                </motion.div>
              ))}
              {following.length >= 5 && (
                <Link
                  href={`/profile/${profileId}/following`}
                  className="flex-none w-48 bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-4 flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  View all
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Settings Section */}
        <motion.div
          ref={settingsRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-4 flex justify-between items-center hover:bg-white/70 transition-colors shadow-lg"
          >
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Account Settings
            </h2>
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
                className="bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6 mt-2 overflow-hidden shadow-lg"
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
                      className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                    >
                      Change Password
                    </Link>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openDeleteModal()}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg"
                    >
                      Delete Account
                    </motion.button>
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