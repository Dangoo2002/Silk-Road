'use client';
import { useEffect, useState, useContext, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Clock, ExternalLink, TrendingUp, UserPlus, ThumbsUp, Share, MessageCircle, UserCheck, UserX, Tag } from 'lucide-react';
import { AuthContext } from '../AuthContext/AuthContext';

export default function SocialMediaHome() {
  const { userData, token } = useContext(AuthContext);
  const userId = userData?.id || null;
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [showComments, setShowComments] = useState({});
  const [expandedPost, setExpandedPost] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [suggestedPosts, setSuggestedPosts] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [error, setError] = useState('');
  const [viewedPosts, setViewedPosts] = useState(new Set());
  const [expandedImage, setExpandedImage] = useState(null);

  const DEFAULT_IMAGE = '/default.jpg';
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend-production.up.railway.app';

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const truncateDescription = (html, wordLimit = 15) => {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text.split(' ');
    if (words.length <= wordLimit) return { text, truncated: false };
    return { text: words.slice(0, wordLimit).join(' ') + '...', truncated: true };
  };

  const fetchPosts = useCallback(async (pageNum, isRefresh = false) => {
    if (!token && userId) {
      setError('Authentication required. Please log in again.');
      return;
    }
    setIsLoading(true);
    try {
      const endpoint = `${apiUrl}/posts?page=${pageNum}&limit=20&t=${Date.now()}&userId=${userId}`;
      const response = await fetch(endpoint, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch posts: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const newPosts = data.posts
          .filter(post => Array.isArray(post.imageUrls))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map(post => ({
            ...post,
            imageUrls: Array.isArray(post.imageUrls) && post.imageUrls.length > 0 ? post.imageUrls : [DEFAULT_IMAGE],
            author_image: post.author_image || DEFAULT_IMAGE,
            author: post.author || 'Anonymous',
            created_at: post.created_at || new Date().toISOString(),
            tags: Array.isArray(post.tags) ? post.tags : [],
          }));
        setPosts((prev) => (isRefresh || pageNum === 1 ? newPosts : [...prev, ...newPosts]));
        setHasMore(data.posts.length === 20);
        const commentsData = {};
        for (const post of newPosts) {
          const commentsResponse = await fetch(`${apiUrl}/comments/${post.id}`, {
            cache: 'no-store',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const commentsResult = await commentsResponse.json();
          if (commentsResult.success) {
            commentsData[post.id] = commentsResult.comments.map(comment => ({
              ...comment,
              author_image: comment.author_image || DEFAULT_IMAGE,
            }));
          }
        }
        setComments((prev) => (isRefresh ? commentsData : { ...prev, ...commentsData }));
      }
    } catch (error) {
      console.error('Posts error:', error.message);
      setError(`Failed to load posts: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token, apiUrl, userId]);

  const fetchSuggestedUsers = useCallback(async () => {
    if (!userId || !token) {
      setError('Authentication required to fetch users.');
      return;
    }
    try {
      const userIds = [...new Set([
        ...posts.map(post => post.userId),
      ])].filter(id => id !== userId).slice(0, 5);
      const users = [];
      for (const id of userIds) {
        const response = await fetch(`${apiUrl}/user/${id}`, {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.warn(`Failed to fetch user ${id}: ${errorData.message}`);
          continue;
        }
        const data = await response.json();
        if (data.success) {
          users.push({
            ...data.user,
            image: data.user.image || DEFAULT_IMAGE,
            is_followed: !!data.user.is_followed,
          });
        }
      }
      setSuggestedUsers(users);
    } catch (error) {
      console.error('Users error:', error.message);
      setError(`Failed to load users: ${error.message}`);
    }
  }, [userId, token, apiUrl, posts]);

  const fetchSuggestedPosts = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/posts?limit=5&userId=${userId}&sort=created_at&order=desc`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch suggested posts: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const sortedPosts = data.posts
          .filter(post => Array.isArray(post.imageUrls))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
          .map(post => ({
            ...post,
            imageUrls: Array.isArray(post.imageUrls) && post.imageUrls.length > 0 ? post.imageUrls : [DEFAULT_IMAGE],
            author_image: post.author_image || DEFAULT_IMAGE,
            author: post.author || 'Anonymous',
            created_at: post.created_at || new Date().toISOString(),
            tags: Array.isArray(post.tags) ? post.tags : [],
          }));
        setSuggestedPosts(sortedPosts);
      }
    } catch (error) {
      console.error('Suggested posts error:', error.message);
      setError(`Failed to load suggested posts: ${error.message}`);
    }
  }, [token, apiUrl, userId]);

  const fetchTrendingTopics = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/posts?sort=views&limit=100&userId=${userId}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch posts for trending topics: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const categoryViews = {};
        data.posts.forEach(post => {
          const category = post.category || 'General';
          categoryViews[category] = (categoryViews[category] || 0) + (post.views || 0);
        });
        const sortedTopics = Object.entries(categoryViews)
          .map(([name, views]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            views,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 4);
        setTrendingTopics(sortedTopics);
      } else {
        setTrendingTopics([
          { id: 'ai-in-africa', name: 'AI in Africa', views: 1500 },
          { id: 'kenya-elections', name: 'Kenya Elections', views: 1200 },
          { id: 'electric-vehicles', name: 'Electric Vehicles', views: 800 },
          { id: 'tech-startups', name: 'Tech Startups', views: 600 },
        ]);
      }
    } catch (error) {
      console.error('Trending topics error:', error.message);
      setTrendingTopics([
        { id: 'ai-in-africa', name: 'AI in Africa', views: 1500 },
        { id: 'kenya-elections', name: 'Kenya Elections', views: 1200 },
        { id: 'electric-vehicles', name: 'Electric Vehicles', views: 800 },
        { id: 'tech-startups', name: 'Tech Startups', views: 600 },
      ]);
    }
  }, [token, apiUrl, userId]);

  const fetchFollowers = useCallback(async () => {
    if (!userId || !token) {
      setError('Authentication required to fetch followers.');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/followers/${userId}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch followers: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setFollowers(data.followers.slice(0, 5).map(user => ({
          ...user,
          image: user.image || DEFAULT_IMAGE,
        })));
      }
    } catch (error) {
      console.error('Followers error:', error.message);
      setError(`Failed to load followers: ${error.message}`);
    }
  }, [userId, token, apiUrl]);

  const fetchFollowing = useCallback(async () => {
    if (!userId || !token) {
      setError('Authentication required to fetch following.');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/following/${userId}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch following: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setFollowing(data.following.slice(0, 5).map(user => ({
          ...user,
          image: user.image || DEFAULT_IMAGE,
        })));
      }
    } catch (error) {
      console.error('Following error:', error.message);
      setError(`Failed to load following: ${error.message}`);
    }
  }, [userId, token, apiUrl]);

  const trackPostView = useCallback(async (postId) => {
    if (!userId || !token || viewedPosts.has(postId)) return;
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
        setViewedPosts((prev) => new Set(prev).add(postId));
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, views: (post.views || 0) + 1 } : post
          )
        );
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
  }, [userId, token, viewedPosts, apiUrl]);

  const handleFollow = useCallback(async (followId) => {
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
        body: JSON.stringify({ userId, followId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'No token provided' || errorData.message === 'Invalid token') {
          setError('Your session has expired. Please log in again.');
          return;
        }
        throw new Error(errorData.message || 'Failed to follow user');
      }
      setSuggestedUsers((prev) =>
        prev.map((user) =>
          user.id === followId ? { ...user, is_followed: true } : user
        )
      );
      fetchFollowing();
      fetchPosts(1, true);
    } catch (error) {
      console.error('Follow error:', error.message);
      setError(`An error occurred while following user: ${error.message}`);
    }
  }, [userId, token, apiUrl, fetchFollowing, fetchPosts]);

  const handleUnfollow = useCallback(async (followId) => {
    if (!userId || !token) {
      setError('Please log in to unfollow users');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/unfollow`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, followId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'No token provided' || errorData.message === 'Invalid token') {
          setError('Your session has expired. Please log in again.');
          return;
        }
        throw new Error(errorData.message || 'Failed to unfollow user');
      }
      setSuggestedUsers((prev) =>
        prev.map((user) =>
          user.id === followId ? { ...user, is_followed: false } : user
        )
      );
      fetchFollowing();
      fetchPosts(1, true);
    } catch (error) {
      console.error('Unfollow error:', error.message);
      setError(`An error occurred while unfollowing user: ${error.message}`);
    }
  }, [userId, token, apiUrl, fetchFollowing, fetchPosts]);

  const handlePostLike = useCallback(async (postId, isLiked) => {
    if (!userId || !token) {
      setError('Please log in to like a post');
      return;
    }
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
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
                is_liked: !isLiked,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Post like error:', error.message);
      setError(`An error occurred while updating post like: ${error.message}`);
    }
  }, [userId, token, apiUrl]);

  const handlePostShare = useCallback((postId) => {
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
  }, []);

  const handlePostCommentSubmit = useCallback(async (postId) => {
    if (!userId || !token) {
      setError('Please log in to comment');
      return;
    }
    const content = commentInput[postId]?.trim();
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
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), { 
          ...result.comment, 
          fullName: userData?.name || 'User',
          author_image: userData?.image || DEFAULT_IMAGE,
        }],
      }));
      setCommentInput((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments_count: (post.comments_count || 0) + 1 } : post
        )
      );
    } catch (error) {
      console.error('Post comment error:', error.message);
      setError(`An error occurred while posting comment: ${error.message}`);
    }
  }, [userId, token, commentInput, userData, apiUrl]);

  const togglePostExpand = useCallback((postId) => {
    setExpandedPost((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const toggleComments = useCallback((postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const handleImageClick = (url) => {
    setExpandedImage(url);
  };

  const closeImageModal = () => {
    setExpandedImage(null);
  };

  useEffect(() => {
    if (token) {
      fetchPosts(1);
      fetchFollowers();
      fetchFollowing();
      fetchSuggestedPosts();
      fetchTrendingTopics();
    }

    const refreshInterval = setInterval(() => {
      if (token) {
        fetchPosts(1, true);
        fetchFollowers();
        fetchFollowing();
        fetchSuggestedPosts();
        fetchTrendingTopics();
      }
    }, 7 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [fetchPosts, fetchFollowers, fetchFollowing, fetchSuggestedPosts, fetchTrendingTopics, token]);

  useEffect(() => {
    if (posts.length > 0) {
      fetchSuggestedUsers();
    }
  }, [posts, fetchSuggestedUsers]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        hasMore &&
        !isLoading
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (page > 1 && token) fetchPosts(page);
  }, [page, fetchPosts, token]);

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
      <div className="container mx-auto px-4 py-8 lg:flex lg:gap-6">
        <div className="lg:w-2/3">
          {userId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-4 mb-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={userData?.image || DEFAULT_IMAGE}
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load user image: ${userData?.image}`);
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
                <Link
                  href="/write"
                  className="flex-1 p-2 bg-white/50 dark:bg-gray-700/50 rounded-full text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  What's on your mind, {userData?.name || 'User'}?
                </Link>
              </div>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-4 mb-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold mb-4 font-heading flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500 dark:text-purple-500" />
              Trending Topics
            </h2>
            {trendingTopics.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No trending topics available</p>
            ) : (
              <div className="flex overflow-x-auto gap-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {trendingTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/topic/${topic.id}`}
                    className="flex-shrink-0 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{topic.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{topic.views} views</p>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-4 mb-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold mb-4 font-heading">Suggested Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestedPosts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No suggested posts available</p>
              ) : (
                suggestedPosts.slice(0, 5).map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    <Image
                      src={post.imageUrls[0] || DEFAULT_IMAGE}
                      alt={post.title || 'Post'}
                      width={80}
                      height={60}
                      className="rounded-xl object-cover"
                      onError={(e) => {
                        console.error(`Failed to load suggested post image: ${post.imageUrls[0]}`);
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                    <div>
                      <h3 className="text-sm font-semibold line-clamp-2">{post.title || 'Untitled'}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {post.category || 'General'} • {post.author || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <Eye className="inline w-3 h-3 mr-1" />
                        {post.views || 0} views
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-4 mb-6 lg:hidden border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 font-heading">
              <UserPlus className="w-5 h-5 text-indigo-500 dark:text-purple-500" />
              Suggested Users
            </h2>
            <div className="space-y-3">
              {suggestedUsers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No suggested users available</p>
              ) : (
                suggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
                    <Image
                      src={user.image || DEFAULT_IMAGE}
                      alt="User"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load suggested user image: ${user.image}`);
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                    <div className="flex-1">
                      <Link
                        href={`/profile/${user.id}`}
                        className="text-sm font-semibold hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300"
                      >
                        {user.name || 'User'}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle || 'user'}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => user.is_followed ? handleUnfollow(user.id) : handleFollow(user.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                        user.is_followed
                          ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                      }`}
                    >
                      {user.is_followed ? (
                        <>
                          <UserX className="w-4 h-4" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </motion.button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
          <div className="space-y-6">
            {posts.length === 0 && !isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <span className="text-gray-500 dark:text-gray-400">No posts available</span>
              </motion.div>
            ) : (
              posts.map((post) => {
                const { text: truncatedText, truncated } = truncateDescription(post.description || '');
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 post-container"
                    data-post-id={post.id}
                    ref={(el) => {
                      if (el) {
                        const observer = new IntersectionObserver(
                          ([entry]) => {
                            if (entry.isIntersecting) {
                              trackPostView(post.id);
                              observer.unobserve(el);
                            }
                          },
                          { threshold: 0.5 }
                        );
                        observer.observe(el);
                      }
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Image
                          src={post.author_image || DEFAULT_IMAGE}
                          alt="User"
                          width={40}
                          height={40}
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
                            {post.author || 'Anonymous'}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateTime(post.created_at)} • {post.category || 'General'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold mb-2 hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300 font-heading">
                          {post.title || 'Untitled'}
                        </h2>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {expandedPost[post.id] ? (
                            <div dangerouslySetInnerHTML={{ __html: post.description || '' }} />
                          ) : (
                            <span>{truncatedText}</span>
                          )}
                          {truncated && (
                            <button
                              onClick={() => togglePostExpand(post.id)}
                              className="text-indigo-500 dark:text-purple-500 hover:underline ml-2 text-sm"
                            >
                              {expandedPost[post.id] ? 'Read Less' : 'Read More'}
                            </button>
                          )}
                        </div>
                        <div className="mb-3">
                          {post.imageUrls.length === 1 ? (
                            <Image
                              src={post.imageUrls[0] || DEFAULT_IMAGE}
                              alt={`${post.title || 'Post'} image`}
                              width={600}
                              height={400}
                              className="w-full h-64 rounded-xl object-cover cursor-pointer"
                              onClick={() => handleImageClick(post.imageUrls[0])}
                              onError={(e) => {
                                console.error(`Failed to load post image: ${post.imageUrls[0]}`);
                                e.target.src = DEFAULT_IMAGE;
                              }}
                            />
                          ) : (
                            <div className="grid gap-2">
                              <div className={post.imageUrls.length >= 2 ? 'grid grid-cols-2 gap-2' : ''}>
                                {post.imageUrls.slice(0, 2).map((url, index) => (
                                  <Image
                                    key={index}
                                    src={url || DEFAULT_IMAGE}
                                    alt={`${post.title || 'Post'} image ${index + 1}`}
                                    width={300}
                                    height={200}
                                    className="w-full h-48 rounded-xl object-cover cursor-pointer"
                                    onClick={() => handleImageClick(url)}
                                    onError={(e) => {
                                      console.error(`Failed to load post image: ${url}`);
                                      e.target.src = DEFAULT_IMAGE;
                                    }}
                                  />
                                ))}
                              </div>
                              {post.imageUrls.length > 2 && (
                                <div className="grid grid-cols-3 gap-2">
                                  {post.imageUrls.slice(2).map((url, index) => (
                                    <Image
                                      key={index + 2}
                                      src={url || DEFAULT_IMAGE}
                                      alt={`${post.title || 'Post'} image ${index + 3}`}
                                      width={200}
                                      height={133}
                                      className="w-full h-32 rounded-xl object-cover cursor-pointer"
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
                          <div className="flex flex-wrap gap-2 mb-3">
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
                      </div>
                      <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-600 py-2 mb-3">
                        <div className="flex items-center gap-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handlePostLike(post.id, post.is_liked)}
                            className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300"
                          >
                            <ThumbsUp
                              className={`w-5 h-5 ${post.is_liked ? 'fill-indigo-500 dark:fill-purple-500 text-indigo-500 dark:text-purple-500' : ''}`}
                            />
                            <span className="text-sm">{post.likes_count || 0}</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{post.comments_count || 0}</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handlePostShare(post.id)}
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
                          <span className="text-sm">{post.views || 0}</span>
                        </div>
                      </div>
                      {showComments[post.id] && (
                        <div className="mt-3">
                          <div className="mb-3">
                            <textarea
                              value={commentInput[post.id] || ''}
                              onChange={(e) =>
                                setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              placeholder="Add a comment..."
                              className="w-full p-2 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all duration-300 resize-none"
                              rows="2"
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePostCommentSubmit(post.id)}
                              className="mt-2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm"
                            >
                              Post
                            </motion.button>
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                            {(comments[post.id] || []).map((comment) => (
                              <div key={comment.id} className="flex gap-2">
                                <Image
                                  src={comment.author_image || DEFAULT_IMAGE}
                                  alt="User"
                                  width={24}
                                  height={24}
                                  className="rounded-full object-cover"
                                  onError={(e) => {
                                    console.error(`Failed to load comment author image: ${comment.author_image}`);
                                    e.target.src = DEFAULT_IMAGE;
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{comment.fullName || 'User'}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDateTime(comment.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <span className="text-gray-500 dark:text-gray-400">Loading...</span>
              </motion.div>
            )}
            {!hasMore && posts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <span className="text-gray-500 dark:text-gray-400">No more posts to load</span>
              </motion.div>
            )}
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/3">
          <div className="sticky top-20 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 font-heading">
                <UserPlus className="w-5 h-5 text-indigo-500 dark:text-purple-500" />
                Suggested Users
              </h2>
              <div className="space-y-3">
                {suggestedUsers.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No suggested users available</p>
                ) : (
                  suggestedUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
                      <Image
                        src={user.image || DEFAULT_IMAGE}
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          console.error(`Failed to load suggested user image: ${user.image}`);
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div className="flex-1">
                        <Link
                          href={`/profile/${user.id}`}
                          className="text-sm font-semibold hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300"
                        >
                          {user.name || 'User'}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle || 'user'}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => user.is_followed ? handleUnfollow(user.id) : handleFollow(user.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                          user.is_followed
                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                        }`}
                      >
                        {user.is_followed ? (
                          <>
                            <UserX className="w-4 h-4" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            Follow
                          </>
                        )}
                      </motion.button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold mb-4 font-heading">Followers</h2>
              <div className="space-y-3">
                {followers.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No followers yet</p>
                ) : (
                  followers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      <Image
                        src={user.image || DEFAULT_IMAGE}
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          console.error(`Failed to load follower image: ${user.image}`);
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle || 'user'}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold mb-4 font-heading">Following</h2>
              <div className="space-y-3">
                {following.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Not following anyone yet</p>
                ) : (
                  following.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      <Image
                        src={user.image || DEFAULT_IMAGE}
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          console.error(`Failed to load following image: ${user.image}`);
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle || 'user'}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}