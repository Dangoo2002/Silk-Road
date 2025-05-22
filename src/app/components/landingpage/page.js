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
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch story: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        return {
          ...data.story,
          imageUrls: Array.isArray(data.story.imageUrls) && data.story.imageUrls.length > 0 ? data.story.imageUrls : [DEFAULT_IMAGE],
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
      setError(`Failed to load story ${storyId}: ${error.message}`);
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
      // Derive user IDs from posts and stories
      const userIds = [...new Set([
        ...posts.map(post => post.userId),
        ...stories.map(story => story.userId),
      ])].filter(id => id !== userId).slice(0, 5); // Limit to 5 users
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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {/* Stories Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Stories</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex-none w-16 cursor-pointer"
              onClick={async () => {
                const updatedStory = await fetchStoryById(story.id);
                if (updatedStory) {
                  setStories((prev) =>
                    prev.map((s) => (s.id === story.id ? updatedStory : s))
                  );
                  setSelectedStoryIndex(index);
                }
              }}
            >
              <div className="relative w-16 h-16 rounded-full border-2 border-blue-500">
                <Image
                  src={story.author_image}
                  alt={story.author}
                  fill
                  className="rounded-full object-cover"
                  onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                />
              </div>
              <p className="text-center text-xs mt-1 truncate">{story.author}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setSelectedStoryIndex(null)}
          >
            <X size={24} />
          </button>
          <div className="relative w-full max-w-md h-[70vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-300">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${storyProgress}%` }}
              />
            </div>
            <div className="w-full h-full overflow-x-auto flex snap-x snap-mandatory">
              {stories[selectedStoryIndex].imageUrls.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`${stories[selectedStoryIndex].title || 'Story'} image ${index + 1}`}
                  fill
                  className="object-cover snap-center"
                  onError={(e) => {
                    console.error(`Failed to load story image: ${url}`);
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
              ))}
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-lg font-semibold">{stories[selectedStoryIndex].title}</h3>
              <p className="text-sm">By {stories[selectedStoryIndex].author}</p>
              <div className="flex items-center space-x-4 mt-2">
                <button
                  onClick={() => handleStoryLike(stories[selectedStoryIndex].id, stories[selectedStoryIndex].is_liked)}
                  className="flex items-center space-x-1"
                >
                  <ThumbsUp size={20} fill={stories[selectedStoryIndex].is_liked ? 'white' : 'none'} />
                  <span>{stories[selectedStoryIndex].likes_count}</span>
                </button>
                <button
                  onClick={() => handleStoryShare(stories[selectedStoryIndex].id)}
                  className="flex items-center space-x-1"
                >
                  <Share size={20} />
                </button>
                <button
                  onClick={() => fetchStoryComments(stories[selectedStoryIndex].id)}
                  className="flex items-center space-x-1"
                >
                  <MessageCircle size={20} />
                  <span>{stories[selectedStoryIndex].comments.length}</span>
                </button>
              </div>
              <div className="mt-2">
                {stories[selectedStoryIndex].comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <span className="font-semibold">{comment.fullName}</span>: {comment.content}
                  </div>
                ))}
                <div className="flex mt-2">
                  <input
                    type="text"
                    value={storyCommentInput}
                    onChange={(e) => setStoryCommentInput(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent border-b border-white text-white placeholder-gray-300"
                  />
                  <button
                    onClick={() => handleStoryCommentSubmit(stories[selectedStoryIndex].id)}
                    className="ml-2 text-blue-400"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
              onClick={() => setSelectedStoryIndex((prev) => Math.max(0, prev - 1))}
              disabled={selectedStoryIndex === 0}
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white"
              onClick={() => setSelectedStoryIndex((prev) => Math.min(stories.length - 1, prev + 1))}
              disabled={selectedStoryIndex === stories.length - 1}
            >
              <ChevronRight size={32} />
            </button>
            <button
              className="absolute bottom-4 right-4 text-white"
              onClick={() => setIsPaused((prev) => !prev)}
            >
              {isPaused ? 'Play' : 'Pause'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Posts */}
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-md mb-6 p-6"
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
              <div className="flex items-center mb-4">
                <Image
                  src={post.author_image}
                  alt={post.author}
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                  onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                />
                <div>
                  <Link href={`/profile/${post.userId}`}>
                    <span className="font-semibold hover:underline">{post.author}</span>
                  </Link>
                  <p className="text-gray-500 text-sm">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Link href={`/post/${post.id}`}>
                <h3 className="text-xl font-semibold mb-2 hover:underline">{post.title}</h3>
              </Link>
              <p
                className="text-gray-700 mb-4"
                dangerouslySetInnerHTML={{
                  __html: expandedPost === post.id ? post.description : post.description.slice(0, 200) + (post.description.length > 200 ? '...' : ''),
                }}
              />
              {post.description.length > 200 && (
                <button
                  className="text-blue-500 mb-4"
                  onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                >
                  {expandedPost === post.id ? 'Show Less' : 'Read More'}
                </button>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {post.imageUrls.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
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
              <div className="flex items-center justify-between text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Eye size={20} className="mr-1" />
                    <span>{post.views || 0}</span>
                  </div>
                  <button
                    onClick={() => handlePostLike(post.id, post.is_liked)}
                    className="flex items-center"
                  >
                    <ThumbsUp size={20} fill={post.is_liked ? 'blue' : 'none'} className="mr-1" />
                    <span>{post.likes_count || 0}</span>
                  </button>
                  <button
                    onClick={() => setShowComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="flex items-center"
                  >
                    <MessageCircle size={20} className="mr-1" />
                    <span>{post.comments_count || 0}</span>
                  </button>
                </div>
                <button
                  onClick={() => handlePostShare(post.id)}
                  className="flex items-center"
                >
                  <Share size={20} />
                </button>
              </div>
              {showComments[post.id] && (
                <div className="mt-4">
                  <div className="mb-4">
                    <input
                      type="text"
                      value={commentInput[post.id] || ''}
                      onChange={(e) =>
                        setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      placeholder="Add a comment..."
                      className="w-full p-2 border rounded"
                    />
                    <button
                      onClick={() => handlePostCommentSubmit(post.id)}
                      className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Post Comment
                    </button>
                  </div>
                  {(comments[post.id] || []).map((comment) => (
                    <div key={comment.id} className="flex items-start mb-2">
                      <Image
                        src={comment.author_image}
                        alt={comment.fullName}
                        width={24}
                        height={24}
                        className="rounded-full mr-2"
                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                      />
                      <div>
                        <span className="font-semibold">{comment.fullName}</span>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && <p className="text-center">Loading more posts...</p>}
          {!hasMore && posts.length > 0 && (
            <p className="text-center text-gray-500">No more posts to load</p>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Suggested Users */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">Suggested Users</h3>
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full mr-2"
                    onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                  />
                  <Link href={`/profile/${user.id}`}>
                    <span className="font-semibold hover:underline">{user.name}</span>
                  </Link>
                </div>
                {user.is_followed ? (
                  <button
                    onClick={() => handleUnfollow(user.id)}
                    className="flex items-center text-gray-500 hover:text-red-500"
                  >
                    <UserX size={20} className="mr-1" />
                    Unfollow
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(user.id)}
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <UserPlus size={20} className="mr-1" />
                    Follow
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Trending Topics */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">Trending Topics</h3>
            {trendingTopics.map((topic) => (
              <div key={topic.id} className="flex items-center mb-2">
                <TrendingUp size={20} className="mr-2 text-blue-500" />
                <span>{topic.name} ({topic.shares} shares)</span>
              </div>
            ))}
          </div>

          {/* Suggested Posts */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-semibold mb-3">Suggested Posts</h3>
            {suggestedPosts.map((post) => (
              <div key={post.id} className="mb-4">
                <Link href={`/post/${post.id}`}>
                  <div className="flex items-center">
                    <Image
                      src={post.imageUrls[0]}
                      alt={post.title}
                      width={60}
                      height={60}
                      className="rounded mr-2"
                      onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                    />
                    <div>
                      <h4 className="font-semibold hover:underline">{post.title}</h4>
                      <p className="text-gray-500 text-sm">{post.author}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}