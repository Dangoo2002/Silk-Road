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
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700 animate-pulse">
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
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700 animate-pulse">
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
      const response = await fetch(`${apiUrl}/users?limit=4&random=true`, {
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
        })));
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

  // ... (keep all other utility functions the same)

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

  // ... (keep all other useEffect hooks the same)

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
      
      {/* Error message and expanded image modal remain the same */}

      <div className="container mx-auto px-4 py-8 lg:flex lg:gap-8">
        <div className="lg:w-2/3">
          {/* Login prompt for non-logged-in users */}
          {!userId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700 text-center"
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

          {/* Loading skeletons */}
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

          {/* User post creation prompt */}
          {userId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
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

          {/* Trending topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
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

          {/* Suggested posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
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

          {/* Mobile-only suggested users */}
          {userId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 mb-8 lg:hidden border border-gray-200 dark:border-gray-700"
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
          )}

          {/* Main posts feed */}
          <div className="space-y-8">
            {(userId ? posts : defaultPosts).map((post) => {
              const { text: truncatedText, truncated } = truncateDescription(post.description || '');
              return (
                <Link href={`/post/${post.id}`} key={post.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 post-container"
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
                        <h2 className="text-xl font-semibold mb-3 hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300 font-heading">
                          {post.title || 'Untitled'}
                        </h2>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
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
                              onClick={(e) => {
                                e.preventDefault();
                                handleImageClick(post.imageUrls[0]);
                              }}
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
                                <div className="grid grid-cols-3 gap-3">
                                  {post.imageUrls.slice(2).map((url, index) => (
                                    <Image
                                      key={index + 2}
                                      src={url || DEFAULT_IMAGE}
                                      alt={`${post.title || 'Post'} image ${index + 3}`}
                                      width={300}
                                      height={200}
                                      className="w-full h-32 sm:h-48 rounded-xl object-cover cursor-pointer"
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
                              onClick={(e) => {
                                e.preventDefault();
                                handlePostLike(post.id, post.is_liked);
                              }}
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
                              onClick={(e) => {
                                e.preventDefault();
                                toggleComments(post.id);
                              }}
                              className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-purple-500 transition-all duration-300"
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
                              onClick={(e) => {
                                e.preventDefault();
                                handlePostCommentSubmit(post.id);
                              }}
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
                </Link>
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

        {/* Right sidebar (desktop only) */}
        <div className="hidden lg:block lg:w-1/3">
          <div className="sticky top-20 space-y-8">
            {/* Suggested Users */}
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
            )}

            {/* Followers */}
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
                          <p className="text-sm font-semibold">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle || 'user'}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Following */}
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
                          <p className="text-sm font-semibold">{user.name || 'User'}</p>
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