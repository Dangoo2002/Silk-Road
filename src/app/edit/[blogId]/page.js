'use client';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useContext, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Clock, ExternalLink, ThumbsUp, Share, MessageCircle, Tag } from 'lucide-react';
import { AuthContext } from '@/app/components/AuthContext/AuthContext';

export default function PostDetail() {
  const router = useRouter();
  const { id: postId } = useParams(); // Get postId from URL
  const { userData, token } = useContext(AuthContext);
  const userId = userData?.id || null;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [hasViewed, setHasViewed] = useState(false);

  const DEFAULT_IMAGE = '/default.jpg';
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend-production.up.railway.app';

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const fetchPost = useCallback(async () => {
    if (!postId) {
      setError('Post ID is missing');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/posts/${postId}?userId=${userId}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch post: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const fetchedPost = {
          ...data.post,
          imageUrls: Array.isArray(data.post.imageUrls) && data.post.imageUrls.length > 0 ? data.post.imageUrls : [DEFAULT_IMAGE],
          author_image: data.post.author_image || DEFAULT_IMAGE,
          author: data.post.author || 'Anonymous',
          created_at: data.post.created_at || new Date().toISOString(),
          tags: Array.isArray(data.post.tags) ? data.post.tags : [],
          likes_count: data.post.likes_count || 0,
          comments_count: data.post.comments_count || 0,
          views: data.post.views || 0,
          is_liked: !!data.post.is_liked,
        };
        setPost(fetchedPost);
      } else {
        throw new Error('Failed to fetch post details');
      }
    } catch (error) {
      console.error('Error fetching post:', error.message);
      setError(`Failed to fetch post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [postId, userId, token, apiUrl]);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      const response = await fetch(`${apiUrl}/comments/${postId}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch comments: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setComments(
          data.comments.map(comment => ({
            ...comment,
            author_image: comment.author_image || DEFAULT_IMAGE,
            fullName: comment.fullName || 'User',
          }))
        );
      }
    } catch (error) {
      console.error('Comments error:', error.message);
      setError(`Failed to load comments: ${error.message}`);
    }
  }, [postId, token, apiUrl]);

  const trackPostView = useCallback(async () => {
    if (!userId || !token || !postId || hasViewed) return;
    try {
      const response = await fetch(`${apiUrl}/post-views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, userId }),
      });
      if (response.ok) {
        setHasViewed(true);
        setPost((prev) => prev ? { ...prev, views: (prev.views || 0) + 1 } : prev);
      } else {
        const errorData = await response.json();
        if (errorData.message === 'No token provided' || errorData.message === 'Invalid token') {
          setError('Your session has expired. Please log in again.');
        }
      }
    } catch (error) {
      console.error('Post view error:', error.message);
      setError(`Error tracking post view: ${error.message}`);
    }
  }, [userId, token, postId, hasViewed, apiUrl]);

  const handlePostLike = useCallback(async () => {
    if (!userId || !token) {
      setError('Please log in to like a post');
      return;
    }
    const isLiked = post?.is_liked;
    try {
      const response = await fetch(`${apiUrl}/likes`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, userId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'No token provided' || errorData.message === 'Invalid token') {
          setError('Your session has expired. Please log in again.');
          return;
        }
        throw new Error(errorData.message || 'Failed to update post like');
      }
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes_count: isLiked ? prev.likes_count - 1 : prev.likes_count + 1,
              is_liked: !isLiked,
            }
          : prev
      );
    } catch (error) {
      console.error('Post like error:', error.message);
      setError(`An error occurred while updating post like: ${error.message}`);
    }
  }, [userId, token, postId, post, apiUrl]);

  const handlePostShare = useCallback(() => {
    if (!navigator.clipboard) {
      setError('Clipboard API not supported in this browser');
      return;
    }
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      setError('');
      alert('Post URL copied to clipboard!');
    }).catch((err) => {
      console.error('Post share error:', err);
      setError('Failed to copy post URL');
    });
  }, [postId]);

  const handleCommentSubmit = useCallback(async () => {
    if (!userId || !token) {
      setError('Please log in to comment');
      return;
    }
    const content = commentInput.trim();
    if (!content) {
      setError('Comment cannot be empty');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, userId, content }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'No token provided' || errorData.message === 'Invalid token') {
          setError('Your session has expired. Please log in again.');
          return;
        }
        throw new Error(errorData.message || 'Failed to post comment');
      }
      const result = await response.json();
      setComments((prev) => [
        ...prev,
        {
          ...result.comment,
          fullName: userData?.name || 'User',
          author_image: userData?.image || DEFAULT_IMAGE,
        },
      ]);
      setCommentInput('');
      setPost((prev) =>
        prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : prev
      );
    } catch (error) {
      console.error('Post comment error:', error.message);
      setError(`An error occurred while posting comment: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [userId, token, postId, commentInput, userData, apiUrl]);

  const handleImageClick = (url) => {
    setExpandedImage(url);
  };

  const closeImageModal = () => {
    setExpandedImage(null);
  };

  useEffect(() => {
    if (postId && token) {
      fetchPost();
      fetchComments();
    } else if (!token && !userId) {
      setError('Please log in to view this post');
      setLoading(false);
    }
  }, [postId, token, userId, fetchPost, fetchComments]);

  useEffect(() => {
    if (post && !hasViewed) {
      trackPostView();
    }
  }, [post, hasViewed, trackPostView]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-indigo-500 dark:border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full"
        >
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/login')}
            className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
          >
            Go to Login
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full"
        >
          <p className="text-gray-600 dark:text-gray-400 text-center">Post not found</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 pt-16">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 mx-auto max-w-md bg-red-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={expandedImage || DEFAULT_IMAGE}
                alt="Expanded image"
                width={1200}
                height={800}
                className="w-full h-auto rounded-xl object-contain"
                onError={(e) => {
                  console.error(`Failed to load expanded image: ${expandedImage}`);
                  e.target.src = DEFAULT_IMAGE;
                }}
              />
              <button
                onClick={closeImageModal}
                className="absolute top-2 right-2 p-2 bg-gray-900/70 rounded-full text-white hover:bg-gray-900 transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={post.author_image || DEFAULT_IMAGE}
              alt="Author"
              width={48}
              height={48}
              className="rounded-full object-cover"
              onError={(e) => {
                console.error(`Failed to load author image: ${post.author_image}`);
                e.target.src = DEFAULT_IMAGE;
              }}
            />
            <div>
              <Link
                href={`/profile/${post.userId}`}
                className="text-sm font-semibold hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300"
              >
                {post.author}
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDateTime(post.created_at)} • {post.category || 'General'}
              </p>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 font-heading text-gray-900 dark:text-gray-100">
            {post.title || 'Untitled'}
          </h1>
          <div className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.description || '' }} />
          </div>
          <div className="mb-6">
            {post.imageUrls.length === 1 ? (
              <Image
                src={post.imageUrls[0] || DEFAULT_IMAGE}
                alt={`${post.title || 'Post'} image`}
                width={800}
                height={500}
                className="w-full h-auto max-h-[500px] rounded-xl object-cover cursor-pointer"
                onClick={() => handleImageClick(post.imageUrls[0])}
                onError={(e) => {
                  console.error(`Failed to load post image: ${post.imageUrls[0]}`);
                  e.target.src = DEFAULT_IMAGE;
                }}
              />
            ) : (
              <div className="grid gap-2">
                <div className={post.imageUrls.length >= 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : ''}>
                  {post.imageUrls.slice(0, 2).map((url, index) => (
                    <Image
                      key={index}
                      src={url || DEFAULT_IMAGE}
                      alt={`${post.title || 'Post'} image ${index + 1}`}
                      width={400}
                      height={250}
                      className="w-full h-auto max-h-[300px] rounded-xl object-cover cursor-pointer"
                      onClick={() => handleImageClick(url)}
                      onError={(e) => {
                        console.error(`Failed to load post image: ${url}`);
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                  ))}
                </div>
                {post.imageUrls.length > 2 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {post.imageUrls.slice(2).map((url, index) => (
                      <Image
                        key={index + 2}
                        src={url || DEFAULT_IMAGE}
                        alt={`${post.title || 'Post'} image ${index + 3}`}
                        width={266}
                        height={166}
                        className="w-full h-auto max-h-[200px] rounded-xl object-cover cursor-pointer"
                        onClick={() => handleImageClick(url)}
                        onError={(e) => {
                          console.error(`Failed to load post image: ${url}`);
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full text-xs"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-600 py-4 mb-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePostLike}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300"
              >
                <ThumbsUp
                  className={`w-5 h-5 ${post.is_liked ? 'fill-indigo-500 dark:fill-purple-500 text-indigo-500 dark:text-purple-500' : ''}`}
                />
                <span className="text-sm">{post.likes_count}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.comments_count}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePostShare}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300"
              >
                <Share className="w-5 h-5" />
                <span className="text-sm">Share</span>
              </motion.button>
              {post.link && (
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span className="text-sm">Link</span>
                </a>
              )}
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Eye className="w-5 h-5" />
              <span className="text-sm">{post.views}</span>
            </div>
          </div>
          {showComments && (
            <div className="space-y-4">
              <div>
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all duration-300 resize-none"
                  rows="3"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCommentSubmit}
                  disabled={submitting}
                  className={`mt-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm ${
                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </motion.button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Image
                        src={comment.author_image || DEFAULT_IMAGE}
                        alt="Commenter"
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          console.error(`Failed to load comment author image: ${comment.author_image}`);
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {comment.fullName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}