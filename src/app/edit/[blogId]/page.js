'use client';
import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '@/app/components/AuthContext/AuthContext';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function EditPost() {
  const { token, userData } = useContext(AuthContext);
  const { id: postId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrls: [],
    imageIds: [],
    link: '',
    tags: [],
    category: 'General',
    reading_time: '5 min',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend-production.up.railway.app';

  const fetchPost = useCallback(async () => {
    console.log('Fetching post with ID:', postId, 'User ID:', userData?.id);
    if (!postId) {
      setError('Post ID is missing');
      setLoading(false);
      return;
    }
    if (!apiUrl) {
      setError('Backend URL is not configured');
      setLoading(false);
      return;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      const response = await fetch(`${apiUrl}/posts/${postId}?userId=${userData?.id || ''}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const post = data.post;
        console.log('Fetched post:', post);
        setFormData({
          title: post.title || '',
          description: post.description || '',
          imageUrls: Array.isArray(post.imageUrls) ? post.imageUrls : [],
          imageIds: post.images ? JSON.parse(post.images) : [],
          link: post.link || '',
          tags: Array.isArray(post.tags) ? post.tags : [],
          category: post.category || 'General',
          reading_time: post.reading_time || '5 min',
        });
        setPreviewImages(post.imageUrls || []);
      } else {
        throw new Error('Failed to fetch post details');
      }
    } catch (error) {
      console.error('Error fetching post:', error.name, error.message);
      setError(`Failed to fetch post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [postId, userData, token, apiUrl]);

  useEffect(() => {
    console.log('useEffect triggered. postId:', postId, 'token:', !!token, 'userData:', userData);
    if (!postId) {
      setError('Invalid post ID');
      setLoading(false);
      return;
    }
    if (!token || !userData?.id) {
      setError('You must be logged in to edit a post');
      setLoading(false);
      return;
    }
    fetchPost();

    // Cleanup preview images
    return () => {
      previewImages.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [postId, token, userData, fetchPost]); // Removed previewImages from dependencies

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Loading timed out');
        setLoading(false);
        setError('Request timed out. Please try again.');
      }
    }, 15000); // 15s timeout
    return () => clearTimeout(timeout);
  }, [loading]);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    if (!e || !e.target) {
      console.error('Invalid event object in handleChange:', e);
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  const handleFileChange = async (files) => {
    if (!token) {
      setError('You must be logged in to upload images.');
      router.push('/login');
      return;
    }
    if (formData.imageUrls.length + files.length > 5) {
      setError('Maximum 5 images allowed.');
      return;
    }
    const newPreviews = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);

    const formDataToSend = new FormData();
    Array.from(files).forEach((file) => formDataToSend.append('images', file));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`${apiUrl}/api/upload-images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        if (data.message === 'Invalid token') {
          setError('Your session has expired. Please log in again.');
          router.push('/login');
          return;
        }
        throw new Error(data.message || 'Failed to upload images');
      }
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...data.imageUrls],
          imageIds: [...prev.imageIds, ...data.imageIds],
        }));
      } else {
        throw new Error('Image upload response not successful');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload images: ' + err.message);
      setPreviewImages((prev) => {
        prev.slice(-files.length).forEach((url) => URL.revokeObjectURL(url));
        return prev.slice(0, -files.length);
      });
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileChange(files);
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
      imageIds: prev.imageIds.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      if (prev[index] && prev[index].startsWith('blob:')) {
        URL.revokeObjectURL(prev[index]);
      }
      return newPreviews;
    });
  };

  const handleTagsChange = (e) => {
    if (!e || !e.target) {
      console.error('Invalid event object in handleTagsChange:', e);
      return;
    }
    const tags = e.target.value.split(',').map((tag) => tag.trim()).filter((tag) => tag);
    if (tags.length > 10) {
      setError('Maximum 10 tags allowed.');
      return;
    }
    setFormData({ ...formData, tags });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!token || !userData?.id) {
      setError('You must be logged in to edit a post.');
      router.push('/login');
      setSubmitting(false);
      return;
    }

    if (!formData.title || formData.title.length < 3) {
      setError('Title is required and must be at least 3 characters.');
      setSubmitting(false);
      return;
    }
    if (!formData.description || formData.description.replace(/<[^>]+>/g, '').length < 50) {
      setError('Description is required and must be at least 50 characters for posts.');
      setSubmitting(false);
      return;
    }
    if (!formData.imageIds.length) {
      setError('At least one image is required for posts.');
      setSubmitting(false);
      return;
    }
    if (formData.link && !validateUrl(formData.link)) {
      setError('Please provide a valid URL for the link.');
      setSubmitting(false);
      return;
    }
    const categories = ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'News', 'Entertainment'];
    if (!categories.includes(formData.category)) {
      setError('Invalid category selected.');
      setSubmitting(false);
      return;
    }

    const requestBody = {
      userId: userData.id,
      contentType: 'post',
      title: formData.title,
      description: formData.description,
      imageIds: formData.imageIds,
      link: formData.link || null,
      category: formData.category || 'General',
      tags: formData.tags || [],
      reading_time: formData.reading_time || '5 min',
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`${apiUrl}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const responseData = await response.json();
      if (!response.ok) {
        if (responseData.message === 'Invalid token') {
          setError('Your session has expired. Please log in again.');
          router.push('/login');
          setSubmitting(false);
          return;
        }
        throw new Error(responseData.message || 'Failed to update post');
      }

      setShowBanner(true);
      setTimeout(() => {
        setShowBanner(false);
        router.push(`/post/${postId}`);
        setFormData({
          title: '',
          description: '',
          imageUrls: [],
          imageIds: [],
          link: '',
          tags: [],
          category: 'General',
          reading_time: '5 min',
        });
        setPreviewImages((prev) => {
          prev.forEach((url) => {
            if (url.startsWith('blob:')) {
              URL.revokeObjectURL(url);
            }
          });
          return [];
        });
      }, 2000);
    } catch (err) {
      console.error('Submit error:', err);
      setError(`An unexpected error occurred while updating the post: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 pt-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-indigo-500 dark:border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error && !userData?.id || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 pt-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center font-heading">Login Required</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            {error || 'You must be logged in to edit a post.'}
          </p>
          <div className="flex justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 pt-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center font-heading">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center">{error}</p>
          <div className="flex justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const categories = ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'News', 'Entertainment'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 pt-16 px-4 sm:px-6 lg:px-8">
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium">Post updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 space-y-8 border border-gray-200 dark:border-gray-700"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white text-center font-heading bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          Edit Post
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all duration-300 text-sm shadow-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="reading_time" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Reading Time
              </label>
              <input
                id="reading_time"
                type="text"
                name="reading_time"
                value={formData.reading_time}
                onChange={handleChange}
                placeholder="e.g., 5 min"
                className="mt-1 w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all duration-300 text-sm placeholder-gray-400 shadow-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter your post title"
              className="mt-1 w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all duration-300 text-sm placeholder-gray-400 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Content
            </label>
            <div className="mt-1">
              <ReactQuill
                id="description"
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Write your post (minimum 50 characters)"
                theme="snow"
                className="bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'image'],
                    ['clean'],
                  ],
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Images (Required, up to 5)
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-1 p-6 border-2 border-dashed rounded-xl transition-all duration-300 ${
                isDragging
                  ? 'border-indigo-500 dark:border-purple-500 bg-indigo-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files)}
                className="hidden"
              />
              <div className="text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Drag and drop images here, or
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleFileInputClick}
                  className="mt-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg"
                >
                  <PlusIcon className="h-5 w-5" />
                  Select Images
                </motion.button>
              </div>
            </div>
            {previewImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {previewImages.map((url, index) => (
                  <motion.div
                    key={url}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-white/50 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-lg"
                  >
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-32 object-cover"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 rounded-full hover:bg-red-700 transition-all duration-300 shadow-sm"
                    >
                      <XMarkIcon className="h-4 w-4 text-white" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Link (Optional)
              </label>
              <input
                id="link"
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="Enter a related link"
                className="mt-1 w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all duration-300 text-sm placeholder-gray-400 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Tags (Optional, comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                name="tags"
                value={formData.tags.join(', ')}
                onChange={handleTagsChange}
                placeholder="e.g., travel, food, tech"
                className="mt-1 w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all duration-300 text-sm placeholder-gray-400 shadow-sm"
              />
            </div>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl"
            >
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </motion.div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={submitting}
            className={`w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Updating...' : 'Update Post'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}