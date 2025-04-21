
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function WritePost() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  // Check if user is logged in
  const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userData')) : null;
  const userId = userData ? userData.id : null;

  // Validate Image URL
  const validateImageUrl = async (url) => {
    try {
      const response = await fetch(url);
      return response.ok && response.headers.get('content-type').startsWith('image/');
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const strippedDescription = formData.description.replace(/<[^>]+>/g, '');

    const isValidImageUrl = await validateImageUrl(formData.imageUrl);
    if (!isValidImageUrl) {
      alert('Please enter a valid image URL.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          description: strippedDescription,
          userId,
        }),
      });

      if (response.ok) {
        alert('Post saved successfully!');
        router.push('/');
        setFormData({
          title: '',
          description: '',
          imageUrl: '',
          link: '',
        });
      } else {
        const errorResponse = await response.json();
        console.error('Error saving post:', errorResponse);
        alert(`Error saving post: ${errorResponse.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Network or server error:', err);
      alert('An unexpected error occurred while saving the post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6 transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Login Required</h2>
          <p className="text-gray-600 text-center">
            You must be logged in to create a blog post.
          </p>
          <div className="flex justify-center">
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8 space-y-6 transform transition-all duration-300 hover:shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Create a New Blog</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter the blog title"
              className="mt-1 w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-colors"
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <ReactQuill
                id="description"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="A minimum of 250 words"
                theme="snow"
                className="bg-white text-black border border-gray-300 rounded-lg"
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

          {/* Image URL Field */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              id="imageUrl"
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              required
              placeholder="Use short and valid image links"
              className="mt-1 w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-colors"
            />
          </div>

          {/* Link Field */}
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700">
              Link
            </label>
            <input
              id="link"
              type="text"
              name="link"
              value={formData.link}
              onChange={handleChange}
              required
              placeholder="Enter a related link"
              className="mt-1 w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Saving...' : 'Add New Blog'}
          </button>
        </form>
      </div>
    </div>
  );
}
