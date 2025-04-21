'use client';

import { useEffect, useState } from 'react';
import { HeartIcon, ShareIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Nav from '@/app/components/navbar/page';
import Footer from '@/app/components/footer/page';

export default function BlogPost({ params }) {
  const { id } = params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = '1'; // Replace with actual user ID from your auth system

  useEffect(() => {
    console.log('Received params.id:', id); // Debug log
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const url = `${apiUrl}/posts/${id}?userId=${userId}`;
      console.log('Fetching post from:', url); // Debug log
      const response = await fetch(url);

      console.log('Response Status:', response.status); // Debug log
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching post:', errorText);
        alert('Failed to fetch post');
        return;
      }

      const data = await response.json();
      console.log('Fetched Post Data:', data); // Debug log

      if (data && data.success) {
        setPost(data.post);
      } else {
        alert('Failed to fetch post');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('An error occurred while fetching post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const response = await fetch(`${apiUrl}/comments/${id}`);
      const data = await response.json();

      if (data && data.success) {
        setComments(data.comments);
      } else {
        alert('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      alert('An error occurred while fetching comments');
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

      setPost((prev) => ({
        ...prev,
        likes_count: isLiked ? prev.likes_count - 1 : prev.likes_count + 1,
        is_liked: !isLiked,
      }));
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      alert('An error occurred while updating like');
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      alert('Post URL copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy URL');
    });
  };

  const handleCommentSubmit = async () => {
    if (!userId) {
      alert('Please log in to comment');
      return;
    }

    const content = commentInput.trim();
    if (!content) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const response = await fetch(`${apiUrl}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id, userId, content }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error posting comment:', errorText);
        alert('Failed to post comment');
        return;
      }

      const result = await response.json();
      setComments((prev) => [...prev, result.comment]);
      setCommentInput('');
      setPost((prev) => ({ ...prev, comments_count: prev.comments_count + 1 }));
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('An error occurred while posting comment');
    }
  };

  const toggleComments = () => {
    setShowComments((prev) => !prev);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-gray-700">Post not found</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-64 sm:h-80 md:h-96 object-cover"
          />
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/user-symbol.jpg"
                alt={post.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <span className="text-lg font-medium text-gray-900">{post.fullName}</span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatDateTime(post.created_at)}</span>
                  <span className="text-gray-300">|</span>
                  <span>{post.comments_count} Comments</span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">{post.description}</p>
            <div className="flex items-center gap-6 mb-8">
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
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
              >
                <ShareIcon className="w-6 h-6" />
                <span>Share</span>
              </button>
              <button
                onClick={toggleComments}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
              >
                <ChatBubbleLeftIcon className="w-6 h-6" />
                <span>Comment</span>
              </button>
            </div>
            {showComments && (
              <div className="mt-8">
                <div className="mb-6 p-4 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-inner">
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-3 bg-white text-black border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 resize-none"
                    rows="4"
                  />
                  <button
                    onClick={handleCommentSubmit}
                    className="mt-3 px-6 py-2 bg-white text-black font-medium rounded-lg border border-transparent shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 hover:border-blue-200 transform hover:scale-105 transition-all duration-300"
                  >
                    Post Comment
                  </button>
                </div>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
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
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}