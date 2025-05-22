'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Picker from 'emoji-picker-react';
import { XMarkIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { AuthContext } from './path-to-AuthContext'; // Adjust the import path to your AuthContext file

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function WritePost() {
  const { token } = useContext(AuthContext); // Access token from AuthContext
  const [formData, setFormData] = useState({
    contentType: 'post',
    title: '',
    description: '',
    imageUrls: [],
    link: '',
    tags: [],
    category: 'General',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  // Check if user is logged in
  const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userData')) : null;
  const userId = userData ? userData.id : null;

  // Cleanup preview images to prevent memory leaks
  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  // Validate URL
  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle description change
  const handleDescriptionChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  // Handle file selection
  const handleFileChange = async (files) => {
    if (!token) {
      setError('You must be logged in to upload images. Please log in again.');
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
    Array.from(files).forEach((file) => {
      formDataToSend.append('images', file);
    });

    try {
      const response = await fetch(`${apiUrl}/api/upload-images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // Add Authorization header
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Invalid token') {
          setError('Your session has expired. Please log in again.');
          router.push('/login');
          return;
        }
        throw new Error(errorData.message || 'Failed to upload images');
      }

      const data = await response.json();
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...data.imageUrls],
        }));
      } else {
        throw new Error(data.message || 'Image upload failed');
      }
    } catch (err) {
      setError('Failed to upload images: ' + err.message);
      setPreviewImages((prev) => {
        const newPreviews = prev.slice(0, prev.length - files.length);
        newPreviews.forEach((url, idx) => {
          if (idx >= newPreviews.length - files.length) {
            URL.revokeObjectURL(url);
          }
        });
        return newPreviews;
      });
    }
  };

  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  // Handle drag and drop
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
    if (files.length > 0) {
      handleFileChange(files);
    }
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]);
      }
      return newPreviews;
    });
  };

  // Handle tags input
  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim()).filter((tag) => tag);
    if (tags.length > 10) {
      setError('Maximum 10 tags allowed.');
      return;
    }
    setFormData({ ...formData, tags });
  };

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    setFormData({
      ...formData,
      description: formData.description + emojiObject.emoji,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validation
    if (!formData.title || formData.title.length < 3) {
      setError('Title is required and must be at least 3 characters.');
      setSubmitting(false);
      return;
    }
    if (formData.contentType === 'post' && (!formData.description || formData.description.replace(/<[^>]+>/g, '').length < 50)) {
      setError('Description is required and must be at least 50 characters for posts.');
      setSubmitting(false);
      return;
    }
    if (!formData.imageUrls.length) {
      setError('At least one image is required.');
      setSubmitting(false);
      return;
    }
    if (formData.link && !validateUrl(formData.link)) {
      setError('Please provide a valid URL for the link.');
      setSubmitting(false);
      return;
    }
    if (!categories.includes(formData.category)) {
      setError('Invalid category selected.');
      setSubmitting(false);
      return;
    }

    const strippedDescription = formData.description; // Keep HTML for posts, strip for stories
    const finalDescription = formData.contentType === 'story' ? strippedDescription.replace(/<[^>]+>/g, '') : strippedDescription;

    try {
      const response = await fetch(`${apiUrl}/write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add Authorization header
        },
        body: JSON.stringify({
          ...formData,
          description: finalDescription,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Invalid token') {
          setError('Your session has expired. Please log in again.');
          router.push('/login');
          return;
        }
        throw new Error(errorData.message || 'Failed to save post');
      }

      alert(`${formData.contentType.charAt(0).toUpperCase() + formData.contentType.slice(1)} saved successfully!`);
      router.push('/');
      setFormData({
        contentType: 'post',
        title: '',
        description: '',
        imageUrls: [],
        link: '',
        tags: [],
        category: 'General',
      });
      setPreviewImages((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
    } catch (err) {
      setError(`An unexpected error occurred while saving the ${formData.contentType}: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!userId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark pt-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-8 space-y-6"
        >
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark text-center font-heading">Login Required</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            You must be logged in to create a post or story.
          </p>
          <div className="flex justify-center">
            <Link
              href="/login"
              className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white font-medium rounded-xl hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-350"
            >
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const categories = ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'News', 'Entertainment'];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full mx-auto bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-6 sm:p-8 space-y-6"
        role="form"
        aria-label="Create a new post or story"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-text-light dark:text-text-dark text-center font-heading">
          Create a New {formData.contentType.charAt(0).toUpperCase() + formData.contentType.slice(1)}
        </h1>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-600/80 text-white p-3 rounded-xl flex items-center gap-2"
              role="alert"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Content Type</label>
            <div className="mt-2 flex gap-4">
              {['post', 'story'].map((type) => (
                <motion.button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, contentType: type })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors duration-350 ${
                    formData.contentType === type
                      ? 'bg-primary-light dark:bg-primary-dark text-white'
                      : 'bg-background-light dark:bg-background-dark text-gray-500 dark:text-gray-400 hover:bg-surface-light dark:hover:bg-surface-dark'
                  }`}
                  aria-pressed={formData.contentType === type}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-350 text-sm"
              aria-label="Select category"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter the title"
              className="mt-1 w-full px-3 py-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-350 text-sm placeholder-gray-400"
              aria-required="true"
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Description
            </label>
            <div className="mt-1 relative">
              {formData.contentType === 'post' ? (
                <ReactQuill
                  id="description"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Write your post (minimum 50 characters)"
                  theme="snow"
                  className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border border-gray-200 dark:border-gray-600 rounded-xl"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link', 'image'],
                      ['clean'],
                    ],
                  }}
                  aria-label="Post description editor"
                />
              ) : (
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Add a short description for your story (optional)"
                  className="w-full px-3 py-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-350 text-sm placeholder-gray-400 resize-y"
                  rows={4}
                  aria-label="Story description"
                />
              )}
              {formData.contentType === 'story' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-2 top-2 p-1 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-350"
                  aria-label="Toggle emoji picker"
                >
                  😊
                </motion.button>
              )}
            </div>
            <AnimatePresence>
              {showEmojiPicker && formData.contentType === 'story' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2"
                >
                  <Picker onEmojiClick={onEmojiClick} theme="dark" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Image Upload Field */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Images (up to 5)</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-1 p-6 border-2 border-dashed rounded-xl transition-colors duration-350 ${
                isDragging
                  ? 'border-primary-light dark:border-primary-dark bg-surface-light dark:bg-surface-dark'
                  : 'border-gray-200 dark:border-gray-600'
              }`}
              role="region"
              aria-label="Drag and drop images"
            >
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files)}
                className="hidden"
                aria-hidden="true"
              />
              <div className="text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Drag and drop images here, or
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleFileInputClick}
                  className="mt-2 px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-xl hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-350 flex items-center gap-2 mx-auto"
                  aria-label="Select images"
                >
                  <PlusIcon className="h-5 w-5" />
                  Select Images
                </motion.button>
              </div>
            </div>
            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {previewImages.map((url, index) => (
                  <motion.div
                    key={url} // Use url as key to avoid conflicts
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-background-light dark:bg-background-dark rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-card dark:shadow-card-dark"
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
                      className="absolute top-2 right-2 p-1 bg-red-600 rounded-full hover:bg-red-700 transition-colors duration-350"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <XMarkIcon className="h-4 w-4 text-white" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Link Field */}
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Link (Optional)
            </label>
            <input
              id="link"
              type="text"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="Enter a related link"
              className="mt-1 w-full px-3 py-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-350 text-sm placeholder-gray-400"
            />
          </div>

          {/* Tags Field */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Tags (Optional, comma-separated)
            </label>
            <input
              id="tags"
              type="text"
              name="tags"
              onChange={handleTagsChange}
              placeholder="e.g., travel, food, tech"
              className="mt-1 w-full px-3 py-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-350 text-sm placeholder-gray-400"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={submitting}
            className={`w-full py-2 px-4 bg-primary-light dark:bg-primary-dark text-white font-medium rounded-xl hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-350 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={`Submit ${formData.contentType}`}
          >
            {submitting ? 'Saving...' : `Add New ${formData.contentType.charAt(0).toUpperCase() + formData.contentType.slice(1)}`}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}