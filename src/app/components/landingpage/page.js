'use client';
import { useEffect, useState, useContext, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Clock, ExternalLink, TrendingUp, UserPlus, ThumbsUp, Share, MessageCircle, UserCheck, UserX, Tag } from 'lucide-react';
import { AuthContext } from '../AuthContext/AuthContext';

export default function SocialMediaHome() {
  const { userData, token, setError: setAuthError, setSuccess } = useContext(AuthContext);
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
    const text = html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return { text, truncated: false };
    return { text: words.slice(0, wordLimit).join(' ') + '...', truncated: true };
  };

  const defaultPosts = [
    {
      id: 'default-1',
      title: 'Welcome to Our Platform',
      description: 'Discover amazing content and connect with others!',
      author: 'Platform Team',
      author_image: DEFAULT_IMAGE,
      imageUrls: [DEFAULT_IMAGE],
      created_at: new Date().toISOString(),
      category: 'Welcome',
      views: 1000,
      likes_count: 50,
      comments_count: 10,
      tags: ['welcome', 'community'],
    },
    {
      id: 'default-2',
      title: 'Join the Conversation',
      description: 'Share your thoughts and ideas with our vibrant community.',
      author: 'Platform Team',
      author_image: DEFAULT_IMAGE,
      imageUrls: [DEFAULT_IMAGE],
      created_at: new Date().toISOString(),
      category: 'Community',
      views: 800,
      likes_count: 30,
      comments_count: 5,
      tags: ['community', 'discussion'],
    },
  ];

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 rounded w-2/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>
  );

  const SkeletonUserCard = () => (
    <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse border border-gray-100">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );

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
        await Promise.all(
          newPosts.map(async (post) => {
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
          })
        );
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
      const response = await fetch(`${apiUrl}/users?limit=100`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch users: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        // Filter out current user and randomize
        const filteredUsers = data.users
          .filter(user => user.id !== userId)
          .map(user => ({
            ...user,
            image: user.image || DEFAULT_IMAGE,
            is_followed: user.is_followed || false,
          }));
        // Shuffle and pick 4
        const shuffled = filteredUsers.sort(() => 0.5 - Math.random());
        setSuggestedUsers(shuffled.slice(0, 4));
      }
    } catch (error) {
      console.error('Users error:', error.message);
      setError(`Failed to load users: ${error.message}`);
    }
  }, [userId, token, apiUrl]);

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
        setFollowers(data.followers.slice(0, 4).map(user => ({
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
        setFollowing(data.following.slice(0, 4).map(user => ({
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
        throw new Error(errorData.message || 'Failed to follow user');
      }
      setSuggestedUsers((prev) =>
        prev.map((user) =>
          user.id === followId ? { ...user, is_followed: true } : user
        )
      );
      fetchFollowing();
      setSuccess('Successfully followed user!');
    } catch (error) {
      console.error('Follow error:', error.message);
      setError(`An error occurred while following user: ${error.message}`);
    }
  }, [userId, token, apiUrl, fetchFollowing, setSuccess]);

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
        throw new Error(errorData.message || 'Failed to unfollow user');
      }
      setSuggestedUsers((prev) =>
        prev.map((user) =>
          user.id === followId ? { ...user, is_followed: false } : user
        )
      );
      fetchFollowing();
      setSuccess('Successfully unfollowed user!');
    } catch (error) {
      console.error('Unfollow error:', error.message);
      setError(`An error occurred while unfollowing user: ${error.message}`);
    }
  }, [userId, token, apiUrl, fetchFollowing, setSuccess]);

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
      setSuccess('Post URL copied to clipboard!');
    }).catch((err) => {
      console.error('Post share error:', err);
      setError('Failed to copy post URL');
    });
  }, [setSuccess]);

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
      setSuccess('Comment posted successfully!');
    } catch (error) {
      console.error('Post comment error:', error.message);
      setError(`An error occurred while posting comment: ${error.message}`);
    }
  }, [userId, token, commentInput, userData, apiUrl, setSuccess]);

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
    if (token && userId) {
      Promise.all([
        fetchPosts(1, true),
        fetchFollowers(),
        fetchFollowing(),
        fetchSuggestedUsers(),
        fetchSuggestedPosts(),
        fetchTrendingTopics(),
      ]).catch(err => {
        console.error('Initial fetch error:', err);
        setError('Failed to load initial data');
      });
    }
  }, [token, userId, fetchPosts, fetchFollowers, fetchFollowing, fetchSuggestedUsers, fetchSuggestedPosts, fetchTrendingTopics]);

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
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-16">
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
      <div className="container mx-auto px-4 py-8 lg:flex lg:gap-8">
        <div className="lg:w-2/3">
          {!userId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100 text-center"
            >
              <p className="text-lg font-bold text-gray-900">
                You must be logged in to view personalized content
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 text-sm font-medium"
              >
                Log In
              </Link>
            </motion.div>
          )}
          {isLoading && !userId && (
            <div className="space-y-8">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
          {userId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={userData?.image || DEFAULT_IMAGE}
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
                <Link
                  href="/write"
                  className="flex-1 p-3 bg-gray-50 rounded-full text-gray-500 text-sm hover:bg-gray-100 transition-all duration-300"
                >
                  What's on your mind, {userData?.name || 'User'}?
                </Link>
              </div>
            </motion.div>
          )}
          {(userId ? trendingTopics.length > 0 : true) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Trending Topics
              </h2>
              {trendingTopics.length === 0 ? (
                <p className="text-sm text-gray-500">No trending topics available</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {trendingTopics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/`}
                      className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                    >
                      <p className="text-sm font-semibold text-gray-900">{topic.name}</p>
                      <p className="text-xs text-gray-500">{topic.views} views</p>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {(userId ? suggestedPosts.length > 0 : true) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100"
            >
              <h2 className="text-lg font-semibold mb-4">Suggested Posts</h2>
              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 animate-pulse">
                      <div className="w-20 h-15 rounded-xl bg-gray-200"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!isLoading && suggestedPosts.length === 0 && userId ? (
                <p className="text-sm text-gray-500">No suggested posts available</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(userId ? suggestedPosts : defaultPosts).slice(0, 5).map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300"
                    >
                      <Image
                        src={post.imageUrls[0] || DEFAULT_IMAGE}
                        alt={post.title || 'Post'}
                        width={80}
                        height={60}
                        className="rounded-xl object-cover"
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div>
                        <h3 className="text-sm font-semibold line-clamp-2">{post.title || 'Untitled'}</h3>
                        <p className="text-xs text-gray-500">
                          {post.category || 'General'} • {post.author || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">
                          <Eye className="inline w-3 h-3 mr-1" />
                          {post.views || 0} views
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {userId && isLoading && <SkeletonUserCard />}
          {userId && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-md p-6 mb-8 lg:hidden border border-gray-100"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Suggested Users
              </h2>
              <div className="space-y-3">
                {suggestedUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">No suggested users available</p>
                ) : (
                  suggestedUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-300">
                      <Image
                        src={user.image || DEFAULT_IMAGE}
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div className="flex-1">
                        <Link
                          href={`/profile/${user.id}`}
                          className="text-sm font-semibold hover:text-blue-600 transition-all duration-300"
                        >
                          {user.name || 'User'}
                        </Link>
                        <p className="text-xs text-gray-500">@{user.handle || 'user'}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => user.is_followed ? handleUnfollow(user.id) : handleFollow(user.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                          user.is_followed
                            ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
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
          )}
          <div className="space-y-8">
            {(userId ? posts : defaultPosts).map((post) => {
              const { text: truncatedText, truncated } = truncateDescription(post.description || '');
              return (
                <Link href={`/post/${post.id}`} key={post.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                    data-post-id={post.id}
                    ref={(el) => {
                      if (el && userId) {
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
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Image
                          src={post.author_image || DEFAULT_IMAGE}
                          alt="User"
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div>
                          <Link
                            href={`/profile/${post.userId || 'unknown'}`}
                            className="text-sm font-semibold hover:text-blue-600 transition-all duration-300"
                          >
                            {post.author || 'Anonymous'}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(post.created_at)} • {post.category || 'General'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-all duration-300">
                          {post.title || 'Untitled'}
                        </h2>
                        <div className="text-sm text-gray-600 mb-4">
                          {expandedPost[post.id] ? (
                            <div dangerouslySetInnerHTML={{ __html: post.description || '' }} />
                          ) : (
                            <span>{truncatedText}</span>
                          )}
                          {truncated && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                togglePostExpand(post.id);
                              }}
                              className="text-blue-600 hover:underline ml-2 text-sm"
                            >
                              {expandedPost[post.id] ? 'Read Less' : 'Read More'}
                            </button>
                          )}
                        </div>
                        <div className="mb-4">
                          {post.imageUrls.length === 1 ? (
                            <Image
                              src={post.imageUrls[0] || DEFAULT_IMAGE}
                              alt={`${post.title || 'Post'} image`}
                              width={1200}
                              height={600}
                              className="w-full h-auto rounded-2xl object-cover cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                handleImageClick(post.imageUrls[0]);
                              }}
                              onError={(e) => {
                                e.target.src = DEFAULT_IMAGE;
                              }}
                            />
                          ) : (
                            <div className="grid gap-4">
                              <div className={post.imageUrls.length >= 2 ? 'grid grid-cols-2 gap-4' : ''}>
                                {post.imageUrls.slice(0, 2).map((url, index) => (
                                  <Image
                                    key={index}
                                    src={url || DEFAULT_IMAGE}
                                    alt={`${post.title || 'Post'} image ${index + 1}`}
                                    width={600}
                                    height={300}
                                    className="w-full h-auto rounded-2xl object-cover cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleImageClick(url);
                                    }}
                                    onError={(e) => {
                                      e.target.src = DEFAULT_IMAGE;
                                    }}
                                  />
                                ))}
                              </div>
                              {post.imageUrls.length > 2 && (
                                <div className="grid grid-cols-3 gap-4">
                                  {post.imageUrls.slice(2).map((url, index) => (
                                    <Image
                                      key={index + 2}
                                      src={url || DEFAULT_IMAGE}
                                      alt={`${post.title || 'Post'} image ${index + 3}`}
                                      width={400}
                                      height={200}
                                      className="w-full h-auto rounded-2xl object-cover cursor-pointer"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleImageClick(url);
                                      }}
                                      onError={(e) => {
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
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {userId && (
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                          <div className="flex items-center gap-6">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePostLike(post.id, post.is_liked);
                              }}
                              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-all duration-300"
                            >
                              <ThumbsUp
                                className={`w-5 h-5 ${post.is_liked ? 'fill-blue-600 text-blue-600' : ''}`}
                              />
                              <span className="text-sm">{post.likes_count || 0}</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.preventDefault();
                                toggleComments(post.id);
                              }}
                              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-all duration-300"
                            >
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-sm">{post.comments_count || 0}</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePostShare(post.id);
                              }}
                              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-all duration-300"
                            >
                              <Share className="w-5 h-5" />
                              <span className="text-sm">Share</span>
                            </motion.button>
                            {post.link && (
                              <a
                                href={post.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-all duration-300"
                                onClick={(e) => e.preventDefault()}
                              >
                                <ExternalLink className="w-5 h-5" />
                                <span className="text-sm">Link</span>
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Eye className="w-5 h-5" />
                            <span className="text-sm">{post.views || 0}</span>
                          </div>
                        </div>
                      )}
                      {userId && showComments[post.id] && (
                        <div className="mt-4">
                          <div className="mb-4">
                            <textarea
                              value={commentInput[post.id] || ''}
                              onChange={(e) =>
                                setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              placeholder="Add a comment..."
                              className="w-full p-3 bg-gray-50 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 resize-none"
                              rows="2"
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePostCommentSubmit(post.id);
                              }}
                              className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 text-sm"
                            >
                              Post
                            </motion.button>
                          </div>
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {(comments[post.id] || []).map((comment) => (
                              <div key={comment.id} className="flex gap-2">
                                <Image
                                  src={comment.author_image || DEFAULT_IMAGE}
                                  alt="User"
                                  width={24}
                                  height={24}
                                  className="rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.src = DEFAULT_IMAGE;
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{comment.fullName || 'User'}</span>
                                    <span className="text-xs text-gray-500">
                                      {formatDateTime(comment.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
            {isLoading && userId && (
              <div className="space-y-8">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}
            {!hasMore && posts.length > 0 && userId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <span className="text-gray-500">No more posts to load</span>
              </motion.div>
            )}
            {!userId && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <p className="text-lg font-bold text-gray-900">
                  You must be logged in to view more posts
                </p>
                <Link
                  href="/login"
                  className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 text-sm font-medium"
                >
                  Log In
                </Link>
              </motion.div>
            )}
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/3">
          <div className="sticky top-20 space-y-8">
            {isLoading && <SkeletonUserCard />}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Suggested Users
                </h2>
                <div className="space-y-3">
                  {suggestedUsers.length === 0 ? (
                    <p className="text-sm text-gray-500">No suggested users available</p>
                  ) : (
                    suggestedUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-300">
                        <Image
                          src={user.image || DEFAULT_IMAGE}
                          alt="User"
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div className="flex-1">
                          <Link
                            href={`/profile/${user.id}`}
                            className="text-sm font-semibold hover:text-blue-600 transition-all duration-300"
                          >
                            {user.name || 'User'}
                          </Link>
                          <p className="text-xs text-gray-500">@{user.handle || 'user'}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => user.is_followed ? handleUnfollow(user.id) : handleFollow(user.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                            user.is_followed
                              ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
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
            )}
            {isLoading && <SkeletonUserCard />}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
              >
                <h2 className="text-lg font-semibold mb-4">Followers</h2>
                <div className="space-y-3">
                  {followers.length === 0 ? (
                    <p className="text-sm text-gray-500">No followers yet</p>
                  ) : (
                    followers.map((user) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-300"
                      >
                        <Image
                          src={user.image || DEFAULT_IMAGE}
                          alt="User"
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-500">@{user.handle || 'user'}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </motion.div>
            )}
            {isLoading && <SkeletonUserCard />}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
              >
                <h2 className="text-lg font-semibold mb-4">Following</h2>
                <div className="space-y-3">
                  {following.length === 0 ? (
                    <p className="text-sm text-gray-500">Not following anyone yet</p>
                  ) : (
                    following.map((user) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-300"
                      >
                        <Image
                          src={user.image || DEFAULT_IMAGE}
                          alt="User"
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-500">@{user.handle || 'user'}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}