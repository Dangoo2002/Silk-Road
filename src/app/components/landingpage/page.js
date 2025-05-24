'use client';
import { useEffect, useState, useContext, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Clock, ExternalLink, TrendingUp, UserPlus, ThumbsUp, Share, MessageCircle, UserX, Tag } from 'lucide-react';
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

  const DEFAULT_IMAGE = '/def.jpg';
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
      verified: 0,
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
      verified: 0,
    },
  ];

  const SkeletonCard = () => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-12 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        </div>
        <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
      </div>
    </div>
  );

  const SkeletonUserCard = () => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-12 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            </div>
            <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );

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
            verified: post.verified || 0,
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
              verified: comment.verified || 0,
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
      const response = await fetch(`${apiUrl}/suggested-users?userId=${userId}&limit=4`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch suggested users: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setSuggestedUsers(data.users.map(user => ({
          ...user,
          image: user.image || DEFAULT_IMAGE,
          is_followed: !!user.is_followed,
          verified: user.verified || 0,
        })));
      } else {
        setError('No suggested users found.');
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
            verified: post.verified || 0,
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
          verified: user.verified || 0,
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
          verified: user.verified || 0,
        })));
      }
    } catch (error) {
      console.error('Following error:', error.message);
      setError(`Failed to load following: ${error.message}`);
    }
  }, [userId, token, apiUrl]);

  const handleFollow = async (followId) => {
    if (!userId || !token) {
      setError('Authentication required to follow users.');
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
      setFollowing((prev) => [
        ...prev,
        suggestedUsers.find((user) => user.id === followId),
      ]);
    } catch (error) {
      console.error('Follow error:', error.message);
      setError(`Failed to follow user: ${error.message}`);
    }
  };

  const handleUnfollow = async (followId) => {
    if (!userId || !token) {
      setError('Authentication required to unfollow users.');
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
      setFollowing((prev) => prev.filter((user) => user.id !== followId));
    } catch (error) {
      console.error('Unfollow error:', error.message);
      setError(`Failed to unfollow user: ${error.message}`);
    }
  };

  const handlePostLike = async (postId, isLiked, e) => {
    e.stopPropagation();
    if (!userId || !token) {
      setError('Authentication required to like posts.');
      return;
    }
    try {
      const endpoint = isLiked ? `${apiUrl}/likes` : `${apiUrl}/likes`;
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, userId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isLiked ? 'unlike' : 'like'} post`);
      }
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
              ...post,
              is_liked: !isLiked,
              likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
            }
            : post
        )
      );
    } catch (error) {
      console.error('Like error:', error.message);
      setError(`Failed to ${isLiked ? 'unlike' : 'like'} post: ${error.message}`);
    }
  };

  const handlePostCommentSubmit = async (postId, e) => {
    e.stopPropagation();
    if (!userId || !token) {
      setError('Authentication required to comment.');
      return;
    }
    const content = commentInput[postId]?.trim();
    if (!content) {
      setError('Comment cannot be empty.');
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
      const data = await response.json();
      if (data.success) {
        setComments((prev) => ({
          ...prev,
          [postId]: [
            { ...data.comment, author_image: data.comment.author_image || DEFAULT_IMAGE, verified: data.comment.verified || 0 },
            ...(prev[postId] || []),
          ],
        }));
        setCommentInput((prev) => ({ ...prev, [postId]: '' }));
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, comments_count: (post.comments_count || 0) + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Comment error:', error.message);
      setError(`Failed to post comment: ${error.message}`);
    }
  };

  const handlePostShare = async (postId, e) => {
    e.stopPropagation();
    if (!userId || !token) {
      setError('Authentication required to share posts.');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, userId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to share post');
      }
      alert('Post shared successfully!');
    } catch (error) {
      console.error('Share error:', error.message);
      setError(`Failed to share post: ${error.message}`);
    }
  };

  const trackPostView = async (postId) => {
    if (!userId || !token || viewedPosts.has(postId)) {
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/post-views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, userId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to track post view');
      }
      setViewedPosts((prev) => new Set(prev).add(postId));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, views: (post.views || 0) + 1 } : post
        )
      );
    } catch (error) {
      console.error('View tracking error:', error.message);
    }
  };

  const toggleComments = (postId, e) => {
    e.stopPropagation();
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const togglePostExpand = (postId, e) => {
    e.stopPropagation();
    setExpandedPost((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleImageClick = (imageUrl, e) => {
    e.stopPropagation();
    setExpandedImage(imageUrl);
  };

  useEffect(() => {
    if (token) {
      fetchPosts(1);
      fetchFollowers();
      fetchFollowing();
      fetchSuggestedPosts();
      fetchTrendingTopics();
      fetchSuggestedUsers();
    }
  }, [fetchPosts, fetchFollowers, fetchFollowing, fetchSuggestedPosts, fetchTrendingTopics, fetchSuggestedUsers, token]);

  useEffect(() => {
    if (!userId || !token) return;
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
  }, [hasMore, isLoading, userId, token]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
    }
  }, [page, fetchPosts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 pt-16">
      <style jsx>{`
        .highlight-post {
          animation: highlight 2s ease-in-out;
        }
        @keyframes highlight {
          0% { background-color: rgba(99, 102, 241, 0.2); }
          50% { background-color: rgba(99, 102, 241, 0.4); }
          100% { background-color: rgba(99, 102, 241, 0.2); }
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
            <X className="w-5 h-5" />
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
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-12 border border-gray-200 dark:border-gray-700 text-center"
            >
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                You must be logged in to view personalized content
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
              >
                Log In
              </Link>
            </motion.div>
          )}

          {isLoading && !userId && (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}
          {userId && isLoading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {userId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-12 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={userData?.image || DEFAULT_IMAGE}
                  alt="User"
                  width={48}
                  height={48}
                  className="rounded-full object-cover w-12 h-12"
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
                <Link
                  href="/write"
                  className="flex-1 p-3 bg-white/50 dark:bg-gray-700/50 rounded-full text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
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
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-12 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold mb-4 font-heading flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500 dark:text-purple-500" />
              Trending Topics
            </h2>
            {trendingTopics.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No trending topics available</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/`}
                    className="flex-shrink-0 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
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
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-12 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold mb-4 font-heading">Suggested Posts</h2>
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-20 h-15 rounded-xl bg-gray-300 dark:bg-gray-600"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && suggestedPosts.length === 0 && userId ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No suggested posts available</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(userId ? suggestedPosts : defaultPosts).slice(0, 5).map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    <Image
                      src={post.imageUrls[0] || DEFAULT_IMAGE}
                      alt={post.title || 'Post'}
                      width={80}
                      height={60}
                      className="rounded-xl object-cover w-20 h-15"
                      onError={(e) => {
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
                ))}
              </div>
            )}
          </motion.div>

          {userId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-12 lg:hidden border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 font-heading">
                <UserPlus className="w-5 h-5 text-indigo-500 dark:text-purple-500" />
                Suggested Users
              </h2>
              <div className="space-y-4">
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
                        className="rounded-full object-cover w-10 h-10"
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div className="flex-1">
                        <Link
                          href={`/profile/${user.id}`}
                          className="text-sm font-semibold hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300 flex items-center gap-1"
                        >
                          {user.name || 'User'}
                          {user.verified ? <VerifiedBadge /> : null}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle || 'user'}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => user.is_followed ? handleUnfollow(user.id) : handleFollow(user.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-300 ${user.is_followed
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
                            <UserPlus className="w-4 h-4" />
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

          <div className="space-y-12">
            {(userId ? posts : defaultPosts).map((post) => {
              const { text: truncatedText, truncated } = truncateDescription(post.description || '');
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 post-container mb-12"
                  key={post.id}
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
                    <div className="flex items-center gap-4 mb-4">
                      <Image
                        src={post.author_image || DEFAULT_IMAGE}
                        alt="User"
                        width={48}
                        height={48}
                        className="rounded-full object-cover w-12 h-12"
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div>
                        <Link
                          href={`/profile/${post.userId || 'unknown'}`}
                          className="text-sm font-semibold hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300 flex items-center gap-1"
                        >
                          {post.author || 'Anonymous'}
                          {post.verified ? <VerifiedBadge /> : null}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(post.created_at)} • {post.category || 'General'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Link href={`/post/${post.id}`}>
                        <h2 className="text-xl font-semibold mb-3 hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300 font-heading">
                          {post.title || 'Untitled'}
                        </h2>
                      </Link>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {expandedPost[post.id] ? (
                          <div dangerouslySetInnerHTML={{ __html: post.description || '' }} />
                        ) : (
                          <span>{truncatedText}</span>
                        )}
                        {truncated && (
                          <button
                            onClick={(e) => togglePostExpand(post.id, e)}
                            className="text-indigo-500 dark:text-purple-500 hover:underline ml-2 text-sm"
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
                            width={800}
                            height={600}
                            className="post-image rounded-xl cursor-pointer"
                            onClick={(e) => handleImageClick(post.imageUrls[0], e)}
                            onError={(e) => {
                              e.target.src = DEFAULT_IMAGE;
                            }}
                          />
                        ) : (
                          <div className="grid gap-3">
                            <div className={post.imageUrls.length >= 2 ? 'grid grid-cols-2 gap-3' : ''}>
                              {post.imageUrls.slice(0, 2).map((url, index) => (
                                <Image
                                  key={index}
                                  src={url || DEFAULT_IMAGE}
                                  alt={`${post.title || 'Post'} image ${index + 1}`}
                                  width={400}
                                  height={300}
                                  className="w-full h-48 sm:h-64 rounded-xl object-cover cursor-pointer"
                                  onClick={(e) => handleImageClick(url, e)}
                                  onError={(e) => {
                                    e.target.src = DEFAULT_IMAGE;
                                  }}
                                />
                              ))}
                            </div>
                            {post.imageUrls.length > 2 && (
                              <div className="grid grid-cols-3 gap-3">
                                {post.imageUrls.slice(2).map((url, index) => (
                                  <Image
                                    key={index + 2}
                                    src={url || DEFAULT_IMAGE}
                                    alt={`${post.title || 'Post'} image ${index + 3}`}
                                    width={300}
                                    height={200}
                                    className="w-full h-32 sm:h-48 rounded-xl object-cover cursor-pointer"
                                    onClick={(e) => handleImageClick(url, e)}
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
                              className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full text-xs"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {userId && (
                      <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-600 py-3 mb-4">
                        <div className="flex items-center gap-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handlePostLike(post.id, post.is_liked, e)}
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
                            onClick={(e) => toggleComments(post.id, e)}
                            className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{post.comments_count || 0}</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handlePostShare(post.id, e)}
                            className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300"
                          >
                            <Share className="w-5 h-5" />
                            <span className="text-sm">Share</span>
                          </motion.button>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
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
                            className="w-full p-3 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all duration-300 resize-none"
                            rows="2"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handlePostCommentSubmit(post.id, e)}
                            className="mt-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm"
                          >
                            Post Comment
                          </motion.button>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 pr-2">
                          {(comments[post.id] || []).map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Image
                                src={comment.author_image || DEFAULT_IMAGE}
                                alt="User"
                                width={32}
                                height={32}
                                className="rounded-full object-cover w-8 h-8"
                                onError={(e) => {
                                  e.target.src = DEFAULT_IMAGE;
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {comment.fullName || 'User'}
                                    {comment.verified ? <VerifiedBadge /> : null}
                                  </span>
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
            })}
            {isLoading && userId && (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}
            {!hasMore && posts.length > 0 && userId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <span className="text-gray-500 dark:text-gray-400">No more posts to load</span>
              </motion.div>
            )}
            {!userId && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  You must be logged in to view more posts
                </p>
                <Link
                  href="/login"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
                >
                  Log In
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/3">
          <div className="sticky top-20 space-y-12">
            {isLoading && <SkeletonUserCard />}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 font-heading">
                  <UserPlus className="w-5 h-5 text-indigo-500 dark:text-purple-500" />
                  Suggested Users
                </h2>
                <div className="space-y-4">
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
                          className="rounded-full object-cover w-10 h-10"
                          onError={(e) => {
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div className="flex-1">
                          <Link
                            href={`/profile/${user.id}`}
                            className="text-sm font-semibold hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300 flex items-center gap-1"
                          >
                            {user.name || 'User'}
                            {user.verified ? <VerifiedBadge /> : null}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle || 'user'}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => user.is_followed ? handleUnfollow(user.id) : handleFollow(user.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-300 ${user.is_followed
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
                              <UserPlus className="w-4 h-4" />
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
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-lg font-semibold mb-4 font-heading">Followers</h2>
                <div className="space-y-4">
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
                          className="rounded-full object-cover w-10 h-10"
                          onError={(e) => {
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold flex items-center gap-1">
                            {user.name || 'User'}
                            {user.verified ? <VerifiedBadge /> : null}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle || 'user'}</p>
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
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-lg font-semibold mb-4 font-heading">Following</h2>
                <div className="space-y-4">
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
                          className="rounded-full object-cover w-10 h-10"
                          onError={(e) => {
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold flex items-center gap-1">
                            {user.name || 'User'}
                            {user.verified ? <VerifiedBadge /> : null}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle || 'user'}</p>
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