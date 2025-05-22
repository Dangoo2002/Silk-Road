'use client';
import { useEffect, useState, useContext, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Eye, Clock, ExternalLink, TrendingUp, UserPlus, ThumbsUp, Share, MessageCircle, UserCheck, UserX } from 'lucide-react';
import { AuthContext } from '../components/AuthContext/AuthContext';

export default function SocialMediaHome() {
  const { userData, token } = useContext(AuthContext);
  const userId = userData?.id || null;
  const [stories, setStories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [showComments, setShowComments] = useState({});
  const [expandedPost, setExpandedPost] = useState(null);
  const [storyCommentInput, setStoryCommentInput] = useState('');
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
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

  const PLACEHOLDER_IMAGE = '/api/placeholder/400/300';
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend-production.up.railway.app';

  // Fetch posts
  const fetchPosts = useCallback(async (pageNum, isRefresh = false) => {
    setIsLoading(true);
    try {
      const endpoint = `${apiUrl}/posts?page=${pageNum}&limit=20&t=${Date.now()}&userId=${userId}`;
      const response = await fetch(endpoint, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Fetch posts error:', errorData, response.status);
        throw new Error(errorData.message || 'Failed to fetch posts');
      }
      const data = await response.json();
      if (data.success) {
        const newPosts = data.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(post => ({
          ...post,
          image: post.imageUrl || PLACEHOLDER_IMAGE,
          author_image: post.author_image || '/user-symbol.jpg',
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
              author_image: comment.author_image || '/user-symbol.jpg',
            }));
          }
        }
        setComments((prev) => (isRefresh ? commentsData : { ...prev, ...commentsData }));
      }
    } catch (error) {
      console.error('Error fetching posts:', error.message);
      setError('Failed to load posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token, apiUrl, userId]);

  // Fetch stories
  const fetchStories = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const response = await fetch(`${apiUrl}/stories?currentUserId=${userId}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Fetch stories error:', errorData, response.status);
        throw new Error(errorData.message || 'Failed to fetch stories');
      }
      const data = await response.json();
      if (data.success) {
        const storiesWithUserLikes = data.stories.map((story) => ({
          ...story,
          image: story.imageUrl || PLACEHOLDER_IMAGE,
          is_liked: story.is_liked || false,
          likes_count: story.likes_count || 0,
          comments: story.comments || [],
          author_image: story.author_image || '/user-symbol.jpg',
        }));
        setStories(storiesWithUserLikes);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setError('Failed to load stories. Please try again.');
    }
  }, [userId, token, apiUrl, PLACEHOLDER_IMAGE]);

  // Fetch story comments (used for refreshing after posting a comment)
  const fetchStoryComments = useCallback(async (storyId) => {
    try {
      const response = await fetch(`${apiUrl}/story-comments/${storyId}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch story comments');
      }
      const data = await response.json();
      if (data.success) {
        setStories((prev) =>
          prev.map((story) =>
            story.id === storyId
              ? {
                  ...story,
                  comments: data.comments.map(comment => ({
                    ...comment,
                    author_image: comment.author_image || '/user-symbol.jpg',
                  })),
                }
              : story
          )
        );
      }
    } catch (error) {
      console.error('Error fetching story comments:', error);
      setError('Failed to load story comments. Please try again.');
    }
  }, [token, apiUrl]);

  // Fetch suggested posts
  const fetchSuggestedPosts = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/posts?sort=views&limit=5&userId=${userId}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch suggested posts');
      }
      const data = await response.json();
      if (data.success) {
        setSuggestedPosts(data.posts.map(post => ({
          ...post,
          image: post.imageUrl || PLACEHOLDER_IMAGE,
          author_image: post.author_image || '/user-symbol.jpg',
        })));
      }
    } catch (error) {
      console.error('Error fetching suggested posts:', error);
      setError('Failed to load suggested posts. Please try again.');
    }
  }, [token, apiUrl, userId, PLACEHOLDER_IMAGE]);

  // Fetch suggested users
  const fetchSuggestedUsers = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const response = await fetch(`${apiUrl}/suggested-users?userId=${userId}&limit=5`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch suggested users');
      }
      const data = await response.json();
      if (data.success) {
        setSuggestedUsers(data.users.map(user => ({
          ...user,
          image: user.image || '/user-symbol.jpg',
        })));
      }
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      setError('Failed to load suggested users. Please try again.');
    }
  }, [userId, token, apiUrl]);

  // Fetch trending topics
  const fetchTrendingTopics = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/trending-topics?sort=shares&limit=3`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch trending topics');
      }
      const data = await response.json();
      if (data.success) {
        setTrendingTopics(data.topics);
      } else {
        setTrendingTopics([
          { name: 'AI in Africa', shares: 1500 },
          { name: 'Kenya Elections', shares: 1200 },
          { name: 'Electric Vehicles', shares: 800 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      setTrendingTopics([
        { name: 'AI in Africa', shares: 1500 },
        { name: 'Kenya Elections', shares: 1200 },
        { name: 'Electric Vehicles', shares: 800 },
      ]);
    }
  }, [token, apiUrl]);

  // Fetch followers
  const fetchFollowers = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const response = await fetch(`${apiUrl}/followers/${userId}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch followers');
      }
      const data = await response.json();
      if (data.success) {
        setFollowers(data.followers.slice(0, 5).map(user => ({
          ...user,
          image: user.image || '/user-symbol.jpg',
        })));
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
      setError('Failed to load followers. Please try again.');
    }
  }, [userId, token, apiUrl]);

  // Fetch following
  const fetchFollowing = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const response = await fetch(`${apiUrl}/following/${userId}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch following');
      }
      const data = await response.json();
      if (data.success) {
        setFollowing(data.following.slice(0, 5).map(user => ({
          ...user,
          image: user.image || '/user-symbol.jpg',
        })));
      }
    } catch (error) {
      console.error('Error fetching following:', error);
      setError('Failed to load following. Please try again.');
    }
  }, [userId, token, apiUrl]);

  // Track post view
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
        setViewedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, views: (post.views || 0) + 1 } : post
          )
        );
      }
    } catch (error) {
      console.error('Error tracking post view:', error);
    }
  }, [userId, token, viewedPosts, apiUrl]);

  // Handle follow
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
      fetchStories();
      fetchPosts(1, true);
    } catch (error) {
      console.error('Error following user:', error);
      setError('An error occurred while following user');
    }
  }, [userId, token, apiUrl, fetchFollowing, fetchStories, fetchPosts]);

  // Handle unfollow
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
      fetchStories();
      fetchPosts(1, true);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      setError('An error occurred while unfollowing user');
    }
  }, [userId, token, apiUrl, fetchFollowing, fetchStories, fetchPosts]);

  // Handle story like
  const handleStoryLike = useCallback(async (storyId, isLiked) => {
    if (!userId || !token) {
      setError('Please log in to like a story');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/story-likes`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storyId, userId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update story like');
      }
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? {
                ...story,
                is_liked: !isLiked,
                likes_count: isLiked ? story.likes_count - 1 : story.likes_count + 1,
              }
            : story
        )
      );
    } catch (error) {
      console.error('Error liking/unliking story:', error);
      setError('An error occurred while updating story like');
    }
  }, [userId, token, apiUrl]);

  // Handle story share
  const handleStoryShare = useCallback((storyId) => {
    if (!navigator.clipboard) {
      setError('Clipboard API not supported in this browser');
      return;
    }
    const storyUrl = `${window.location.origin}/story/${storyId}`;
    navigator.clipboard.writeText(storyUrl).then(() => {
      setError('');
      alert('Story URL copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy URL:', err);
      setError('Failed to copy story URL');
    });
  }, []);

  // Handle story comment
  const handleStoryCommentSubmit = useCallback(async (storyId) => {
    if (!userId || !token) {
      setError('Please log in to comment');
      return;
    }
    const content = storyCommentInput.trim();
    if (!content) {
      setError('Comment cannot be empty');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/story-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storyId, userId, content }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post comment');
      }
      const result = await response.json();
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? {
                ...story,
                comments: [
                  ...(story.comments || []),
                  {
                    ...result.comment,
                    fullName: userData?.name || 'User',
                    author_image: userData?.image || '/user-symbol.jpg',
                  },
                ],
              }
            : story
        )
      );
      setStoryCommentInput('');
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('An error occurred while posting comment');
    }
  }, [userId, token, storyCommentInput, userData, apiUrl]);

  // Handle post like
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
      console.error('Error liking/unliking post:', error);
      setError('An error occurred while updating post like');
    }
  }, [userId, token, apiUrl]);

  // Handle post share
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
      console.error('Failed to copy URL:', err);
      setError('Failed to copy post URL');
    });
  }, []);

  // Handle post comment
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
          author_image: userData?.image || '/user-symbol.jpg',
        }],
      }));
      setCommentInput((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments_count: (post.comments_count || 0) + 1 } : post
        )
      );
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('An error occurred while posting comment');
    }
  }, [userId, token, commentInput, userData, apiUrl]);

  // Initial fetch and refresh
  useEffect(() => {
    fetchStories();
    fetchPosts(1);
    fetchFollowers();
    fetchFollowing();
    fetchSuggestedUsers();
    fetchSuggestedPosts();
    fetchTrendingTopics();

    const refreshInterval = setInterval(() => {
      fetchStories();
      fetchPosts(1, true);
      fetchFollowers();
      fetchFollowing();
      fetchSuggestedUsers();
      fetchSuggestedPosts();
      fetchTrendingTopics();
    }, 7 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [fetchStories, fetchPosts, fetchFollowers, fetchFollowing, fetchSuggestedUsers, fetchSuggestedPosts, fetchTrendingTopics]);

  // Infinite scroll
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
    if (page > 1) fetchPosts(page);
  }, [page, fetchPosts]);

  // Story progress
  useEffect(() => {
    if (selectedStoryIndex === null || isPaused) return;
    const progressInterval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          if (selectedStoryIndex < stories.length - 1) {
            setSelectedStoryIndex(selectedStoryIndex + 1);
            return 0;
          } else {
            setSelectedStoryIndex(null);
            return 0;
          }
        }
        return prev + 1;
      });
    }, 100);
    return () => clearInterval(progressInterval);
  }, [selectedStoryIndex, isPaused, stories]);

  // Track post views on visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.dataset.postId;
            trackPostView(postId);
          }
        });
      },
      { threshold: 0.5 }
    );

    const postElements = document.querySelectorAll('.post-container');
    postElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [posts, trackPostView]);

  const openStory = useCallback((index) => {
    setSelectedStoryIndex(index);
    setStoryProgress(0);
    setIsPaused(false);
  }, []);

  const closeStory = useCallback(() => {
    setSelectedStoryIndex(null);
    setStoryProgress(0);
    setIsPaused(false);
    setStoryCommentInput('');
  }, []);

  const goToNextStory = useCallback(() => {
    if (selectedStoryIndex < stories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
      setStoryProgress(0);
      setStoryCommentInput('');
    } else {
      closeStory();
    }
  }, [selectedStoryIndex, stories, closeStory]);

  const goToPrevStory = useCallback(() => {
    if (selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
      setStoryProgress(0);
      setStoryCommentInput('');
    }
  }, [selectedStoryIndex]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const togglePostExpand = useCallback((postId) => {
    setExpandedPost((prev) => (prev === postId ? null : postId));
    setShowComments((prev) => ({ ...prev, [postId]: true }));
  }, []);

  const toggleComments = useCallback((postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return 'Unknown time';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark pt-16">
      {error && (
        <div className="fixed top-20 left-0 right-0 mx-auto max-w-md bg-red-600 text-white p-4 rounded-xl shadow-lg z-50">
          {error}
          <button onClick={() => setError('')} className="ml-2 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="container mx-auto px-4 py-8 lg:flex lg:gap-6">
        <div className="lg:w-2/3">
          {userId && (
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-4 mb-6">
              <div className="flex items-center gap-3">
                <Image
                  src={userData?.image || '/user-symbol.jpg'}
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  onError={(e) => (e.target.src = '/user-symbol.jpg')}
                />
                <Link
                  href="/write"
                  className="flex-1 p-2 bg-background-light dark:bg-background-dark rounded-full text-gray-500 dark:text-gray-400 text-sm hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-350"
                >
                  What's on your mind, {userData?.name || 'User'}?
                </Link>
              </div>
            </div>
          )}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4 font-heading">Stories</h2>
            {stories.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No stories available</p>
            ) : (
              <div className="flex overflow-x-auto gap-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {stories.map((story, index) => (
                  <div
                    key={story.id}
                    className="flex-shrink-0 cursor-pointer group w-20"
                    onClick={() => openStory(index)}
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark p-[2px] group-hover:scale-105 transition-transform duration-350">
                        <Image
                          src={story.image}
                          alt={story.title || 'Story'}
                          width={60}
                          height={60}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-center text-xs font-medium truncate">
                      {story.author?.split(' ')[0] || 'User'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4 font-heading">Suggested Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestedPosts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No suggested posts available</p>
              ) : (
                suggestedPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-350"
                  >
                    <Image
                      src={post.image}
                      alt={post.title || 'Post'}
                      width={80}
                      height={60}
                      className="rounded-xl object-cover"
                      onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
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
          </div>
          <div className="space-y-6">
            {posts.length === 0 && !isLoading ? (
              <div className="text-center py-4">
                <span className="text-gray-500 dark:text-gray-400">No posts available</span>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark hover:shadow-card dark:hover:shadow-card-dark transition-all duration-350 post-container"
                  data-post-id={post.id}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Image
                        src={post.author_image}
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        onError={(e) => (e.target.src = '/user-symbol.jpg')}
                      />
                      <div>
                        <Link
                          href={`/profile/${post.userId}`}
                          className="text-sm font-semibold hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
                        >
                          {post.author || 'Anonymous'}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(post.created_at)}
                        </p>
                      </div>
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => togglePostExpand(post.id)}
                    >
                      <h2 className="text-lg font-semibold mb-2 hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350 font-heading">
                        {post.title || 'Untitled'}
                      </h2>
                      <p
                        className={`text-sm text-gray-600 dark:text-gray-300 mb-3 transition-all duration-350 ${
                          expandedPost === post.id ? '' : 'line-clamp-3'
                        }`}
                        dangerouslySetInnerHTML={{ __html: post.description || '' }}
                      />
                      {post.image && (
                        <Image
                          src={post.image}
                          alt={post.title || 'Post'}
                          width={600}
                          height={400}
                          className="w-full h-64 rounded-xl object-cover mb-3"
                          onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-600 py-2 mb-3">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handlePostLike(post.id, post.is_liked)}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-accent-light dark:hover:text-accent-dark transition-colors duration-350"
                        >
                          <ThumbsUp
                            className={`w-5 h-5 ${post.is_liked ? 'fill-accent-light dark:fill-accent-dark text-accent-light dark:text-accent-dark' : ''}`}
                          />
                          <span className="text-sm">{post.likes_count || 0}</span>
                        </button>
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">{post.comments_count || 0}</span>
                        </button>
                        <button
                          onClick={() => handlePostShare(post.id)}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
                        >
                          <Share className="w-5 h-5" />
                          <span className="text-sm">Share</span>
                        </button>
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
                            className="w-full p-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-350 resize-none"
                            rows="2"
                          />
                          <button
                            onClick={() => handlePostCommentSubmit(post.id)}
                            className="mt-2 px-4 py-1 bg-primary-light dark:bg-primary-dark text-white rounded-full hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-350 text-sm"
                          >
                            Post
                          </button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                          {(comments[post.id] || []).map((comment) => (
                            <div key={comment.id} className="flex gap-2">
                              <Image
                                src={comment.author_image}
                                alt="User"
                                width={24}
                                height={24}
                                className="rounded-full object-cover"
                                onError={(e) => (e.target.src = '/user-symbol.jpg')}
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
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-center py-4">
                <span className="text-gray-500 dark:text-gray-400">Loading...</span>
              </div>
            )}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-4">
                <span className="text-gray-500 dark:text-gray-400">No more posts to load</span>
              </div>
            )}
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/3">
          <div className="sticky top-20 space-y-6">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 font-heading">
                <TrendingUp className="w-5 h-5" />
                Trending Topics
              </h2>
              <div className="space-y-3">
                {trendingTopics.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No trending topics available</p>
                ) : (
                  trendingTopics.map((topic) => (
                    <Link
                      key={topic.name}
                      href={`/search?q=${encodeURIComponent(topic.name)}`}
                      className="block p-2 rounded-xl hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-350"
                    >
                      <p className="text-sm font-semibold">{topic.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{topic.shares} shares</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 font-heading">
                <UserPlus className="w-5 h-5" />
                Suggested Users
              </h2>
              <div className="space-y-3">
                {suggestedUsers.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No suggested users available</p>
                ) : (
                  suggestedUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-350">
                      <Image
                        src={user.image}
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        onError={(e) => (e.target.src = '/user-symbol.jpg')}
                      />
                      <div className="flex-1">
                        <Link
                          href={`/profile/${user.id}`}
                          className="text-sm font-semibold hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
                        >
                          {user.name || 'User'}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle || 'user'}</p>
                      </div>
                      <button
                        onClick={() => user.is_followed ? handleUnfollow(user.id) : handleFollow(user.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors duration-350 ${
                          user.is_followed
                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            : 'bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary-light'
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
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-4">
              <h2 className="text-lg font-semibold mb-4 font-heading">Followers</h2>
              <div className="space-y-3">
                {followers.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No followers yet</p>
                ) : (
                  followers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-350"
                    >
                      <Image
                        src={user.image}
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        onError={(e) => (e.target.src = '/user-symbol.jpg')}
                      />
                      <div>
                        <p className="text-sm font-semibold">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle || 'user'}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-4">
              <h2 className="text-lg font-semibold mb-4 font-heading">Following</h2>
              <div className="space-y-3">
                {following.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Not following anyone yet</p>
                ) : (
                  following.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-350"
                    >
                      <Image
                        src={user.image}
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        onError={(e) => (e.target.src = '/user-symbol.jpg')}
                      />
                      <div>
                        <p className="text-sm font-semibold">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle || 'user'}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedStoryIndex !== null && stories[selectedStoryIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-md h-[80vh] bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-600">
              <div
                className="h-full bg-primary-light dark:bg-primary-dark transition-all duration-100"
                style={{ width: `${storyProgress}%` }}
              />
            </div>
            <button
              onClick={closeStory}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-350"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={goToPrevStory}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-350"
              disabled={selectedStoryIndex === 0}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={goToNextStory}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-350"
              disabled={selectedStoryIndex === stories.length - 1}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <div className="relative h-[60%]">
              <Image
                src={stories[selectedStoryIndex].image}
                alt={stories[selectedStoryIndex].title || 'Story'}
                fill
                className="object-cover"
                onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white text-lg font-semibold">{stories[selectedStoryIndex].title || 'Untitled'}</h3>
                <p className="text-white/80 text-sm line-clamp-2">{stories[selectedStoryIndex].description || ''}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Link
                    href={`/profile/${stories[selectedStoryIndex].userId}`}
                    className="text-white text-sm font-medium hover:text-primary-light transition-colors duration-350"
                  >
                    {stories[selectedStoryIndex].author || 'Anonymous'}
                  </Link>
                  <span className="text-white/70 text-xs">{formatDateTime(stories[selectedStoryIndex].created_at)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 h-[40%] flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handleStoryLike(stories[selectedStoryIndex].id, stories[selectedStoryIndex].is_liked)}
                  className="flex items-center gap-1 text-white hover:text-accent-light transition-colors duration-350"
                >
                  <ThumbsUp
                    className={`w-5 h-5 ${stories[selectedStoryIndex].is_liked ? 'fill-accent-light text-accent-light' : ''}`}
                  />
                  <span className="text-sm">{stories[selectedStoryIndex].likes_count || 0}</span>
                </button>
                <button
                  onClick={() => handleStoryShare(stories[selectedStoryIndex].id)}
                  className="flex items-center gap-1 text-white hover:text-primary-light transition-colors duration-350"
                >
                  <Share className="w-5 h-5" />
                  <span className="text-sm">Share</span>
                </button>
                {stories[selectedStoryIndex].link && (
                  <a
                    href={stories[selectedStoryIndex].link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-white hover:text-primary-light transition-colors duration-350"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span className="text-sm">Link</span>
                  </a>
                )}
              </div>
              <div className="space-y-2 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 mb-4">
                {(stories[selectedStoryIndex].comments || []).map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Image
                      src={comment.author_image}
                      alt="User"
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                      onError={(e) => (e.target.src = '/user-symbol.jpg')}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{comment.fullName || 'User'}</span>
                        <span className="text-white/70 text-xs">
                          {formatDateTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-white/90 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-auto">
                <input
                  type="text"
                  value={storyCommentInput}
                  onChange={(e) => setStoryCommentInput(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 p-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark rounded-full focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-350"
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                />
                <button
                  onClick={() => handleStoryCommentSubmit(stories[selectedStoryIndex].id)}
                  className="px-4 py-1 bg-primary-light dark:bg-primary-dark text-white rounded-full hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-350 text-sm"
                >
                  Send
                </button>
              </div>
            </div>
            <button
              onClick={togglePause}
              className="absolute bottom-4 left-4 text-white hover:text-gray-300 transition-colors duration-350"
            >
              {isPaused ? 'Play' : 'Pause'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}