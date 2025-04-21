'use client';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '@/app/components/AuthContext/AuthContext';

export default function EditBlog() {
  const router = useRouter();
  const { blogId } = useParams(); // Get blogId from URL
  const { userData } = useContext(AuthContext);
  const [blogDetails, setBlogDetails] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  useEffect(() => {
    if (blogId && userData?.id) {
      const fetchBlogDetails = async () => {
        try {
          const response = await axios.get(`${baseUrl}/api/blogs/${blogId}`, {
            params: { userId: userData.id },
            withCredentials: true,
          });
          if (response.data.success) {
            setBlogDetails({
              title: response.data.data.title,
              description: response.data.data.description,
              imageUrl: response.data.data.imageUrl,
              link: response.data.data.link,
            });
          } else {
            setError('Failed to fetch blog details');
          }
        } catch (error) {
          console.error('Error fetching blog details:', error);
          setError('Failed to fetch blog details');
        } finally {
          setLoading(false);
        }
      };
      fetchBlogDetails();
    } else if (!userData?.id) {
      setError('Please log in to edit a blog');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [blogId, userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlogDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!blogId || !userData?.id) {
      alert('Blog ID or user ID is missing');
      return;
    }
    if (!blogDetails.title || !blogDetails.description || !blogDetails.imageUrl || !blogDetails.link) {
      alert('All fields are required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.put(
        `${baseUrl}/api/blogs/${blogId}`,
        { ...blogDetails, userId: userData.id },
        { withCredentials: true }
      );
      if (response.data.success) {
        alert('Blog updated successfully');
        router.push('/account');
      } else {
        alert('Failed to update blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Failed to update blog');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Edit Blog</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={blogDetails.title}
              onChange={handleInputChange}
              placeholder="Enter blog title"
              className="mt-1 w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={blogDetails.description}
              onChange={handleInputChange}
              placeholder="Enter blog description"
              className="mt-1 w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-y"
              rows="5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="text"
              name="imageUrl"
              value={blogDetails.imageUrl}
              onChange={handleInputChange}
              placeholder="Enter image URL"
              className="mt-1 w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Link</label>
            <input
              type="text"
              name="link"
              value={blogDetails.link}
              onChange={handleInputChange}
              placeholder="Enter link URL"
              className="mt-1 w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/account')}
              className="flex-1 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}