
'use client';
import { useEffect, useState, useContext, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Eye, Clock, ExternalLink, TrendingUp, UserPlus, ThumbsUp, Share, MessageCircle, UserCheck, UserX, Tag } from 'lucide-react';
import { AuthContext } from '../AuthContext/AuthContext';

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

  const DEFAULT_IMAGE = '/default.jpg';
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend-production.up.railway.app';

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };
  const getStoryTimeRemaining = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursPassed = (now - created) / (1000 * 60 * 60);
    const hoursLeft = Math.max(0, 24 - hoursPassed);
    return (hoursLeft / 24) * 100;
  };
  
  // Helper function to display time remaining text
  const getTimeRemainingText = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursPassed = (now - created) / (1000 * 60 * 60);
    const hoursLeft = Math.max(0, 24 - hoursPassed);
    
    if (hoursLeft > 1) {
      return `${Math.floor(hoursLeft)}h remaining`;
    } else if (hoursLeft > 0) {
      const minutesLeft = Math.floor(hoursLeft * 60);
      return `${minutesLeft}m remaining`;
    }
    return 'Expired soon';
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
      console.log('Fetched posts:', data); // Debug log
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

  const fetchStories = useCallback(async () => {
    if (!userId || !token) {
      setError('Authentication required to fetch stories.');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/stories?currentUserId=${userId}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch stories: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched stories:', data); // Debug log
      if (data.success) {
        const storiesWithUserLikes = data.stories.map((story) => ({
          ...story,
          imageUrls: Array.isArray(story.imageUrls) && story.imageUrls.length > 0 ? story.imageUrls : [DEFAULT_IMAGE],
          is_liked: story.is_liked || false,
          likes_count: story.likes_count || 0,
          comments: Array.isArray(story.comments) ? story.comments : [],
          author_image: story.author_image || DEFAULT_IMAGE,
          tags: Array.isArray(story.tags) ? story.tags : [],
        }));
        setStories(storiesWithUserLikes);
      } else {
        throw new Error('No stories found in response');
      }
    } catch (error) {
      console.error('Stories error:', error.message);
      setError(`Failed to load stories: ${error.message}`);
    }
  }, [userId, token, apiUrl]);

  const fetchStoryById = useCallback(async (storyId) => {
    if (!userId || !token) {
      setError('Authentication required to fetch story.');
      return null;
    }
    try {
      const response = await fetch(`${apiUrl}/stories/${storyId}?currentUserId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Story not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch story: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.success) {
        return {
          ...data.story,
          imageUrls: Array.isArray(data.story.imageUrls) ? data.story.imageUrls : [DEFAULT_IMAGE],
          is_liked: data.story.is_liked || false,
          likes_count: data.story.likes_count || 0,
          comments: Array.isArray(data.story.comments) ? data.story.comments : [],
          author_image: data.story.author_image || DEFAULT_IMAGE,
          tags: Array.isArray(data.story.tags) ? data.story.tags : [],
        };
      }
      throw new Error('No story found in response');
    } catch (error) {
      console.error(`Story ${storyId} error:`, error.message);
      setError(`Failed to load story: ${error.message}`);
      return null;
    }
  }, [userId, token, apiUrl]);

  const fetchStoryComments = useCallback(async (storyId) => {
    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/story-comments/${storyId}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch story comments: ${response.status}`);
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
                    author_image: comment.author_image || DEFAULT_IMAGE,
                  })),
                }
              : story
          )
        );
      }
    } catch (error) {
      console.error('Story comments error:', error.message);
      setError(`Failed to load story comments: ${error.message}`);
    }
  }, [token, apiUrl]);

  const fetchSuggestedUsers = useCallback(async () => {
    if (!userId || !token) {
      setError('Authentication required to fetch users.');
      return;
    }
    try {
      const userIds = [...new Set([
        ...posts.map(post => post.userId),
        ...stories.map(story => story.userId),
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
  }, [userId, token, apiUrl, posts, stories]);

  const fetchSuggestedPosts = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/posts?limit=5&userId=${userId}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch suggested posts: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setSuggestedPosts(data.posts
          .filter(post => Array.isArray(post.imageUrls))
          .map(post => ({
            ...post,
            imageUrls: Array.isArray(post.imageUrls) && post.imageUrls.length > 0 ? post.imageUrls : [DEFAULT_IMAGE],
            author_image: post.author_image || DEFAULT_IMAGE,
            author: post.author || 'Anonymous',
            created_at: post.created_at || new Date().toISOString(),
            tags: Array.isArray(post.tags) ? post.tags : [],
          })));
      }
    } catch (error) {
      console.error('Suggested posts error:', error.message);
      setError(`Failed to load suggested posts: ${error.message}`);
    }
  }, [token, apiUrl, userId]);

  const fetchTrendingTopics = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/trending-topics?limit=3`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch trending topics: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setTrendingTopics(data.topics);
      } else {
        setTrendingTopics([
          { id: 1, name: 'AI in Africa', shares: 1500 },
          { id: 2, name: 'Kenya Elections', shares: 1200 },
          { id: 3, name: 'Electric Vehicles', shares: 800 },
        ]);
      }
    } catch (error) {
      console.error('Trending topics error:', error.message);
      setTrendingTopics([
        { id: 1, name: 'AI in Africa', shares: 1500 },
        { id: 2, name: 'Kenya Elections', shares: 1200 },
        { id: 3, name: 'Electric Vehicles', shares: 800 },
      ]);
    }
  }, [token, apiUrl]);

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
      fetchStories();
      fetchPosts(1, true);
    } catch (error) {
      console.error('Follow error:', error.message);
      setError(`An error occurred while following user: ${error.message}`);
    }
  }, [userId, token, apiUrl, fetchFollowing, fetchStories, fetchPosts]);

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
      fetchStories();
      fetchPosts(1, true);
    } catch (error) {
      console.error('Unfollow error:', error.message);
      setError(`An error occurred while unfollowing user: ${error.message}`);
    }
  }, [userId, token, apiUrl, fetchFollowing, fetchStories, fetchPosts]);

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
        if (errorData.message === 'No token provided' || errorData.message === 'Invalid token') {
          setError('Your session has expired. Please log in again.');
          return;
        }
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
      console.error('Story like error:', error.message);
      setError(`An error occurred while updating story like: ${error.message}`);
    }
  }, [userId, token, apiUrl]);

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
      console.error('Story share error:', err);
      setError('Failed to copy story URL');
    });
  }, []);

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
        if (errorData.message === 'No token provided' || errorData.message === 'Invalid token') {
          setError('Your session has expired. Please log in again.');
          return;
        }
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
                    author_image: userData?.image || DEFAULT_IMAGE,
                  },
                ],
              }
            : story
        )
      );
      setStoryCommentInput('');
      fetchStoryComments(storyId);
    } catch (error) {
      console.error('Story comment error:', error.message);
      setError(`An error occurred while posting comment: ${error.message}`);
    }
  }, [userId, token, storyCommentInput, userData, apiUrl, fetchStoryComments]);

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
    setExpandedPost((prev) => (prev === postId ? null : postId));
  }, []);

  const toggleComments = useCallback((postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const openStory = useCallback(async (index) => {
  try {
    const story = stories[index];
    if (!story) {
      throw new Error('Story not found');
    }
    
    const updatedStory = await fetchStoryById(story.id);
    if (!updatedStory) {
      throw new Error('Failed to load story');
    }

    setStories(prev =>
      prev.map(s => (s.id === story.id ? updatedStory : s))
    );
    setSelectedStoryIndex(index);
    setStoryProgress(0);
  } catch (error) {
    console.error('Story open error:', error);
    setError(error.message);
    setSelectedStoryIndex(null);
  }
}, [stories, fetchStoryById]);

  const closeStory = useCallback(() => {
    setSelectedStoryIndex(null);
    setStoryProgress(0);
  }, []);

  const goToPrevStory = useCallback(() => {
    setSelectedStoryIndex((prev) => Math.max(0, prev - 1));
    setStoryProgress(0);
  }, []);

  const goToNextStory = useCallback(() => {
    setSelectedStoryIndex((prev) => Math.min(stories.length - 1, prev + 1));
    setStoryProgress(0);
  }, [stories.length]);

  useEffect(() => {
    if (token) {
      fetchStories();
      fetchPosts(1);
      fetchFollowers();
      fetchFollowing();
      fetchSuggestedPosts();
      fetchTrendingTopics();
    }

    const refreshInterval = setInterval(() => {
      if (token) {
        fetchStories();
        fetchPosts(1, true);
        fetchFollowers();
        fetchFollowing();
        fetchSuggestedPosts();
        fetchTrendingTopics();
      }
    }, 7 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [fetchStories, fetchPosts, fetchFollowers, fetchFollowing, fetchSuggestedPosts, fetchTrendingTopics, token]);

  useEffect(() => {
    if (posts.length > 0 || stories.length > 0) {
      fetchSuggestedUsers();
    }
  }, [posts, stories, fetchSuggestedUsers]);

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

  useEffect(() => {
    if (selectedStoryIndex === null || isPaused) return;
    const progressInterval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          if (selectedStoryIndex < stories.length - 1) {
            setSelectedStoryIndex((prev) => prev + 1);
            return 0;
          } else {
            setSelectedStoryIndex(null);
            return 0;
          }
        }
        return prev + (100 / (5 * 60)); // 5 seconds per story
      });
    }, 1000 / 60);
    return () => clearInterval(progressInterval);
  }, [selectedStoryIndex, isPaused, stories.length]);

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
                          src={story.imageUrls[0] || DEFAULT_IMAGE}
                          alt={story.title || 'Story'}
                          width={60}
                          height={60}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            console.error(`Failed to load story thumbnail: ${story.imageUrls[0]}`);
                            e.target.src = DEFAULT_IMAGE;
                          }}
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
                          className="text-sm font-semibold hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
                        >
                          {post.author || 'Anonymous'}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(post.created_at)} • {post.category || 'General'}
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {post.imageUrls.map((url, index) => (
                          <Image
                            key={index}
                            src={url || DEFAULT_IMAGE}
                            alt={`${post.title || 'Post'} image ${index + 1}`}
                            width={600}
                            height={400}
                            className="w-full h-64 rounded-xl object-cover"
                            onError={(e) => {
                              console.error(`Failed to load post image: ${url}`);
                              e.target.src = DEFAULT_IMAGE;
                            }}
                          />
                        ))}
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
                        {post.link && (
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
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
                      key={topic.id}
                      href={`/post/${topic.id}`}
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
            </div>
          </div>
        </div>
      </div>
      {selectedStoryIndex !== null && stories[selectedStoryIndex] && (
  <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
    <div className="relative w-full max-w-md h-[80vh] bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden">
      {/* Story progress bar with time remaining indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-600">
        <div
          className="h-full bg-primary-light dark:bg-primary-dark transition-all duration-100"
          style={{ 
            width: `${storyProgress}%`,
            backgroundColor: storyProgress < 20 ? '#ef4444' : '' // Red when almost expired
          }}
        />
        <div 
          className="absolute top-0 right-0 h-full bg-gray-400 opacity-20"
          style={{ 
            width: `${100 - getStoryTimeRemaining(stories[selectedStoryIndex].created_at)}%` 
          }}
        />
      </div>
      
      {/* Close button */}
      <button
        onClick={closeStory}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-350 z-10"
      >
        <X className="w-6 h-6" />
      </button>
      
      {/* Navigation buttons */}
      <button
        onClick={goToPrevStory}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-350 z-10"
        disabled={selectedStoryIndex === 0}
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={goToNextStory}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-350 z-10"
        disabled={selectedStoryIndex === stories.length - 1}
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Story content */}
      <div className="relative h-[60%]">
        {/* Story images */}
        {stories[selectedStoryIndex].imageUrls.map((url, index) => (
          <div 
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${index === 0 ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="relative w-full h-full">
              <Image
                src={url || DEFAULT_IMAGE}
                alt={`${stories[selectedStoryIndex].title || 'Story'} image ${index + 1}`}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  console.error(`Failed to load story image: ${url}`);
                  e.target.src = DEFAULT_IMAGE;
                }}
              />
            </div>
          </div>
        ))}
        
        {/* Story metadata overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-lg font-semibold">
            {stories[selectedStoryIndex].title || 'Untitled'}
          </h3>
          <p className="text-white/80 text-sm line-clamp-2">
            {stories[selectedStoryIndex].description || ''}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Link
              href={`/profile/${stories[selectedStoryIndex].userId}`}
              className="text-white text-sm font-medium hover:text-primary-light transition-colors duration-350"
            >
              {stories[selectedStoryIndex].author || 'Anonymous'}
            </Link>
            <span className="text-white/70 text-xs">
              {formatDateTime(stories[selectedStoryIndex].created_at)}
            </span>
            {stories[selectedStoryIndex].category && (
              <span className="text-white/70 text-xs">
                • {stories[selectedStoryIndex].category}
              </span>
            )}
            {/* Time remaining indicator */}
            <span className="ml-auto text-xs text-white/70">
              {getTimeRemainingText(stories[selectedStoryIndex].created_at)}
            </span>
          </div>
          {stories[selectedStoryIndex].tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {stories[selectedStoryIndex].tags.map((tag, index) => (
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
      </div>

      {/* Story actions and comments */}
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

        {/* Comments section */}
        <div className="space-y-2 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 mb-4">
          {(stories[selectedStoryIndex].comments || []).map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div className="relative w-6 h-6">
                <Image
                  src={comment.author_image || DEFAULT_IMAGE}
                  alt="User"
                  fill
                  className="rounded-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load comment author image: ${comment.author_image}`);
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">
                    {comment.fullName || 'User'}
                  </span>
                  <span className="text-white/70 text-xs">
                    {formatDateTime(comment.created_at)}
                  </span>
                </div>
                <p className="text-white/90 text-sm">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Comment input */}
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
          </div>
        </div>
      )}
    </div>
  );
}
