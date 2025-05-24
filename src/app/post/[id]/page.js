'use client';

import { useEffect, useState, useContext } from 'react';
import { HeartIcon, ShareIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Nav from '@/app/components/navbar/page';
import { AuthContext } from '@/app/components/AuthContext/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon, TagIcon, EyeIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import DOMPurify from 'dompurify';

export const dynamic = 'force-dynamic';

const VerifiedBadge = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block ml-1"
    title="Verified"
  >
    <circle cx="12" cy="12" r="12" fill="#1DA1F2" />
    <path
      d="M9.75 16.5L5.25 12L6.6825 10.5675L9.75 13.6275L17.3175 6.06L18.75 7.5L9.75 16.5Z"
      fill="white"
    />
  </svg>
);

export default function BlogPost({ params }) {
  const { id } = params;
  const { userData, token } = useContext(AuthContext);
  const userId = userData?.id || null;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [morePosts, setMorePosts] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [error, setError] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);

  const DEFAULT_IMAGE = '/def.jpg';
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  useEffect(() => {
    let isMounted = true;
    if (!id || isNaN(parseInt(id, 10))) {
      setError('Invalid post ID');
      if (isMounted) setLoading(false);
      return;
    }
    setPost(null);
    Promise.all([fetchPost(), fetchComments()])
      .then(() => {
        if (isMounted) setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load content');
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id, userId]);

  // Separate useEffect for fetching more posts, dependent on post
  useEffect(() => {
    if (post && post.userId) {
      fetchMorePosts();
    }
  }, [post]);

  const fetchPost = async () => {
    try {
      const url = userId
        ? `${apiUrl}/posts/${id}?userId=${userId}&t=${Date.now()}`
        : `${apiUrl}/posts/${id}?t=${Date.now()}`;
      const response = await fetch(url, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      if (data && data.success && data.post) {
        setPost({
          ...data.post,
          category: data.post.category || 'General',
          tags: Array.isArray(data.post.tags) ? data.post.tags : ['News', 'Trending'],
          views: data.post.views || 0,
          reading_time: data.post.reading_time || '5 min',
          author_bio: data.post.author_bio || 'Passionate about sharing stories.',
          imageUrls: Array.isArray(data.post.imageUrls) && data.post.imageUrls.length > 0 
            ? data.post.imageUrls 
            : [DEFAULT_IMAGE],
          verified: data.post.verified || 0,
        });
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      setError('Failed to fetch post');
      console.error('Fetch post error:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`${apiUrl}/comments/${id}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data && data.success) {
        setComments(data.comments.map(comment => ({
          ...comment,
          author_image: comment.author_image || DEFAULT_IMAGE,
          verified: comment.verified || 0,
        })));
      } else {
        throw new Error('Invalid comments response');
      }
    } catch (error) {
      setError('Failed to fetch comments');
      console.error('Fetch comments error:', error);
    }
  };

  const fetchMorePosts = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/posts?userId=${post.userId}&exclude=${id}&limit=3`,
        {
          cache: 'no-store',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const data = await response.json();
      if (data && data.success) {
        const filteredPosts = data.posts
          .filter(p => p.id !== parseInt(id, 10))
          .map(p => ({
            ...p,
            imageUrls: Array.isArray(p.imageUrls) && p.imageUrls.length > 0 
              ? p.imageUrls 
              : [DEFAULT_IMAGE],
          }));
        console.log('Fetched more posts:', filteredPosts);
        setMorePosts(filteredPosts);
      }
    } catch (error) {
      console.error('Fetch more posts error:', error);
    }
  };

  const handleLike = async (postId, isLiked) => {
    if (!userId || !token) {
      setError('Please log in to like a post');
      return;
    }
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`${apiUrl}/likes`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, userId }),
      });
      if (!response.ok) {
        throw new Error('Failed to update like');
      }
      setPost((prev) => ({
        ...prev,
        likes_count: isLiked ? prev.likes_count - 1 : prev.likes_count + 1,
        is_liked: !isLiked,
      }));
    } catch (error) {
      setError('Failed to update like');
      console.error('Like error:', error);
    }
  };

  const handleShare = async (platform = 'clipboard') => {
    if (!userId || !token) {
      setError('Please log in to share a post');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: id, userId }),
      });
      if (!response.ok) {
        throw new Error('DRAMATIC Failed to share post');
      }
      const postUrl = `${window.location.origin}/post/${id}`;
      if (platform === 'clipboard') {
        await navigator.clipboard.writeText(postUrl);
        alert('Post URL copied to clipboard!');
      } else if (platform === 'twitter') {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post?.title || '')}`,
          '_blank'
        );
      } else if (platform === 'facebook') {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
          '_blank'
        );
      }
      setShareOpen(false);
    } catch (error) {
      setError('Failed to share post');
      console.error('Share error:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!userId || !token) {
      setError('Please log in to comment');
      return;
    }
    const content = commentInput.trim();
    if (!content) {
      setError('Comment cannot be empty');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: id, userId, content }),
      });
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
      const result = await response.json();
      setComments((prev) => [
        { 
          ...result.comment, 
          fullName: userData?.name || 'User',
          author_image: userData?.image || DEFAULT_IMAGE,
          verified: userData?.verified || 0,
        },
        ...prev,
      ]);
      setCommentInput('');
      setPost((prev) => ({ ...prev, comments_count: prev.comments_count + 1 }));
      setShowComments(true);
    } catch (error) {
      setError('Failed to post comment');
      console.error('Comment error:', error);
    }
  };

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const handleFollow = async () => {
    if (!userId || !token) {
      setError('Please log in to follow users');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, followId: post.userId }),
      });
      if (!response.ok) {
        throw new Error('Failed to follow user');
      }
      setPost((prev) => ({ ...prev, is_followed: true }));
    } catch (error) {
      setError('Failed to follow user');
      console.error('Follow error:', error);
    }
  };

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

  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 animate-pulse">
          <div className="h-64 sm:h-80 md:h-96 bg-gray-300 dark:bg-gray-700 rounded-xl mb-6"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full Transnational Institutebg-gray-300 dark:bg-gray-700"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2 mb-8">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
          <div className="flex gap-6 border-t border-b border-gray-200 dark:border-gray-600 py-4 mb-8">
            <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 pt-16">
      <Nav />
      <style jsx>{`
        .post-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1rem 0;
        }
        .post-content p {
          margin-bottom: 1rem;
        }
        .post-image {
          width: 100%;
          height: auto;
          max-height: 500px;
          object-fit: cover;
        }
        @media (min-width: 1024px) {
          .post-image {
            max-height: 600px;
          }
        }
      `}</style>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50"
        >
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="hover:text-gray-200 transition-all duration-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full h-auto"
            >
              <Image
                src={expandedImage}
                alt="Expanded image"
                width={1200}
                height={800}
                className="w-full h-auto rounded-xl"
                onError={(e) => {
                  e.target.src = DEFAULT_IMAGE;
                }}
              />
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 bg-gray-800 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all duration-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          {/* Header Image */}
          <div className="relative">
            <div className="w-full h-64 sm:h-80 md:h-96">
              {post.imageUrls && post.imageUrls.length > 0 ? (
                <Image
                  src={post.imageUrls[0]}
                  alt={post.title}
                  fill
                  className="object-cover rounded-t-2xl"
                  priority
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded-t-2xl" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-block bg-indigo-500 dark:bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight font-heading">
              {post.title}
            </h1>

            {/* Post Metadata */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                <span>{post.reading_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeIcon className="w-4 h-4" />
                <span>{post.views} views</span>
              </div>
              <div className="flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                <span>{post.tags.join(', ')}</span>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Image
                  src={post.author_image || DEFAULT_IMAGE}
                  alt={post.fullName}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
                <div>
                  <Link
                    href={`/profile/${post.userId}`}
                    className="text-lg font-medium hover:text-indigo-500 dark:hover:text-purple-500 transition-colors duration-300"
                  >
                    {post.fullName}
                    {post.verified ? <VerifiedBadge /> : null}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatDateTime(post.created_at)}</span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFollow}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${
                  post.is_followed
                    ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                }`}
                disabled={post.is_followed}
              >
                <UserPlusIcon className="w-4 h-4" />
                {post.is_followed ? 'Following' : 'Follow'}
              </motion.button>
            </div>

            {/* Post Images */}
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="mb-8">
                {post.imageUrls.length === 1 ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => setExpandedImage(post.imageUrls[0])}
                  >
                    <Image
                      src={post.imageUrls[0] || DEFAULT_IMAGE}
                      alt={`${post.title} image`}
                      width={800}
                      height={600}
                      className="post-image rounded-xl"
                      onError={(e) => {
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                  </motion.div>
                ) : (
                  <div className="grid gap-3">
                    <div className={post.imageUrls.length >= 2 ? 'grid grid-cols-2 gap-3' : ''}>
                      {post.imageUrls.slice(0, 2).map((url, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          className="relative h-48 sm:h-64 rounded-xl overflow-hidden cursor-pointer"
                          onClick={() => setExpandedImage(url)}
                        >
                          <Image
                            src={url || DEFAULT_IMAGE}
                            alt={`${post.title} image ${index + 1}`}
                            fill
                            className="object-cover rounded-xl"
                            onError={(e) => {
                              e.target.src = DEFAULT_IMAGE;
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                    {post.imageUrls.length > 2 && (
                      <div className="grid grid-cols-3 gap-3">
                        {post.imageUrls.slice(2).map((url, index) => (
                          <motion.div
                            key={index + 2}
                            whileHover={{ scale: 1.02 }}
                            className="relative h-32 sm:h-48 rounded-xl overflow-hidden cursor-pointer"
                            onClick={() => setExpandedImage(url)}
                          >
                            <Image
                              src={url || DEFAULT_IMAGE}
                              alt={`${post.title} image ${index + 3}`}
                              fill
                              className="object-cover rounded-xl"
                              onError={(e) => {
                                e.target.src = DEFAULT_IMAGE;
                              }}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Post Description */}
            <div
              className="post-content text-lg leading-relaxed mb-8 text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.description) }}
            />

            {/* Interaction Bar */}
            <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-600 py-4 mb-8">
              <div className="flex items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(post.id, post.is_liked)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-purple-500 transition-colors duration-300"
                  aria-label={post.is_liked ? 'Unlike post' : 'Like post'}
                >
                  {post.is_liked ? (
                    <HeartIconSolid className="w-6 h-6 text-indigo-500 dark:text-purple-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                  <span>{post.likes_count}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleComments}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-purple-500 transition-colors duration-300"
                  aria-label="Toggle comments"
                >
                  <ChatBubbleLeftIcon className="w-6 h-6" />
                  <span>{post.comments_count}</span>
                </motion.button>
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShareOpen((prev) => !prev)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-purple-500 transition-colors duration-300"
                    aria-label="Share post"
                  >
                    <ShareIcon className="w-6 h-6" />
                    <span>Share</span>
                  </motion.button>
                  <AnimatePresence>
                    {shareOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 p-2 z-50"
                      >
                        <button
                          onClick={() => handleShare('clipboard')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-300"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-300"
                        >
                          Share to Twitter
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-300"
                        >
                          Share to Facebook
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Comment Section */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8"
                >
                  <div className="mb-6 p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full p-3 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-colors duration-300 placeholder-gray-400 resize-none"
                      rows="4"
                      aria-label="Comment input"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCommentSubmit}
                      className="mt-3 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-colors duration-300"
                      aria-label="Submit comment"
                    >
                      Post Comment
                    </motion.button>
                  </div>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Image
                            src={comment.author_image || DEFAULT_IMAGE}
                            alt={comment.fullName}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = DEFAULT_IMAGE;
                            }}
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {comment.fullName}
                              {comment.verified ? <VerifiedBadge /> : null}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {formatDateTime(comment.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                        <button
                          className="text-xs text-indigo-500 dark:text-purple-500 hover:underline mt-2"
                          aria-label="Reply to comment"
                        >
                          Reply
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.article>

        {/* Author Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-semibold mb-4 font-heading">About the Author</h2>
          <div className="flex items-center gap-4">
            <Image
              src={post.author_image || DEFAULT_IMAGE}
              alt={post.fullName}
              width={64}
              height={64}
              className="rounded-full object-cover"
              onError={(e) => {
                e.target.src = DEFAULT_IMAGE;
              }}
            />
            <div>
              <Link
                href={`/profile/${post.userId}`}
                className="text-lg font-medium hover:text-indigo-500 dark:hover:text-purple-500 transition-colors duration-300"
              >
                {post.fullName}
                {post.verified ? <VerifiedBadge /> : null}
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-300">{post.author_bio}</p>
            </div>
          </div>
        </motion.div>

        {/* More from Author */}
        {morePosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-semibold mb-4 font-heading">Also Read</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {morePosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/post/${relatedPost.id}`}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                    <Image
                      src={relatedPost.imageUrls[0] || DEFAULT_IMAGE}
                      alt={relatedPost.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {DOMPurify.sanitize(relatedPost.description.replace(/<[^>]+>/g, ''))}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}