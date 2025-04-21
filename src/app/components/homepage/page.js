'use client';

import { useEffect, useState, useContext } from 'react';
import { HeartIcon, ShareIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { AuthContext } from '../AuthContext/AuthContext';

export default function Landing() {
  const { userData } = useContext(AuthContext); // Get user data from AuthContext
  const userId = userData?.id || null; // Use authenticated user ID or null
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [showComments, setShowComments] = useState({});
  const postsPerPage = 6;

  useEffect(() => {
    fetchPosts();
  }, [userId]); // Add userId as a dependency to refetch when it changes

  const fetchPosts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const endpoint = userId
        ? `${apiUrl}/posts?userId=${userId}&t=${Date.now()}` // Include userId for is_liked
        : `${apiUrl}/posts?t=${Date.now()}`; // Fetch without userId if not logged in
      console.log('Fetching from:', endpoint);

      const response = await fetch(endpoint, { cache: 'no-store' });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching posts:', errorText);
        alert('Failed to fetch posts');
        return;
      }

      const data = await response.json();
      console.log('Fetched Data:', data);

      if (data && data.success) {
        const sortedPosts = data.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPosts(sortedPosts);

        // Fetch comments for each post
        const commentsData = {};
        for (const post of sortedPosts) {
          const commentsResponse = await fetch(`${apiUrl}/comments/${post.id}`, { cache: 'no-store' });
          const commentsResult = await commentsResponse.json();
          if (commentsResult.success) {
            commentsData[post.id] = commentsResult.comments;
          }
        }
        setComments(commentsData);
      } else {
        alert('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      alert('An error occurred while fetching posts');
    }
  };

  const handleLike = async (postId, isLiked) => {
    if (!userId) {
      alert('Please log in to like a post');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`${apiUrl}/likes`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error liking/unliking post:', errorText);
        alert('Failed to update like');
        return;
      }

      const updatedPosts = posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
              is_liked: !isLiked,
            }
          : post
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      alert('An error occurred while updating like');
    }
  };

  const handleShare = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      alert('Post URL copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy URL');
    });
  };

  const handleCommentSubmit = async (postId) => {
    if (!userId) {
      alert('Please log in to comment');
      return;
    }

    const content = commentInput[postId]?.trim();
    if (!content) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const response = await fetch(`${apiUrl}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId, content }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error posting comment:', errorText);
        alert('Failed to post comment');
        return;
      }

      const result = await response.json();
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), result.comment],
      }));
      setCommentInput((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments_count: post.comments_count + 1 } : post
        )
      );
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('An error occurred while posting comment');
    }
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    return `${formattedDate} at ${formattedTime}`;
  };

  const truncateText = (text, wordLimit) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 text-center mb-12 relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-emerald-500 after:rounded">
        Latest Blogs
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
          >
            <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-gray-600 text-base mb-4">
                {truncateText(post.description, 30)}{' '}
                <Link
                  href={`/post/${post.id}`}
                  className="text-blue-500 font-medium hover:text-blue-600 hover:underline transition-colors"
                >
                  Read More
                </Link>
              </p>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handleLike(post.id, post.is_liked)}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                >
                  {post.is_liked ? (
                    <HeartIconSolid className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                  <span>{post.likes_count}</span>
                </button>
                <button
                  onClick={() => handleShare(post.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <ShareIcon className="w-6 h-6" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <ChatBubbleLeftIcon className="w-6 h-6" />
                  <span>{post.comments_count}</span>
                </button>
              </div>
              {showComments[post.id] && (
                <div className="mt-4">
                  <div className="mb-4 p-4 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-inner">
                    <textarea
                      value={commentInput[post.id] || ''}
                      onChange={(e) =>
                        setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      placeholder="Write a comment..."
                      className="w-full p-3 bg-white text-black border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 resize-none"
                      rows="3"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      className="mt-3 px-6 py-2 bg-white text-black font-medium rounded-lg border border-transparent shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 hover:border-blue-200 transform hover:scale-105 transition-all duration-300"
                    >
                      Post Comment
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="p-2 bg-gray-100 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.fullName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/user-symbol.jpg"
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {post.fullName}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">
                    {formatDateTime(post.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
            currentPage === 1
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors`}
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          ←
        </button>
        <span className="text-base font-medium text-gray-900">
          {currentPage} / {totalPages}
        </span>
        <button
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
            currentPage === totalPages
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors`}
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          →
        </button>
      </div>
    </div>
  );
}