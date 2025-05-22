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
  const [storyLikes, setStoryLikes] = useState({});
  const [storyComments, setStoryComments] = useState({});
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

  const PLACEHOLDER_IMAGE = '/api/placeholder/400/300';
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  const fetchPosts = useCallback(async (pageNum, isRefresh = false) => {
    setIsLoading(true);
    try {
      const endpoint = `${apiUrl}/posts?page=${pageNum}&limit=20&t=${Date.now()}`;
      const response = await fetch(endpoint, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch posts');
      }
      const data = await response.json();
      if (data.success) {
        const newPosts = data.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPosts((prev) => (isRefresh || pageNum === 1 ? newPosts : [...prev, ...newPosts]));
        setHasMore(data.posts.length === 20);
        const commentsData = {};
        for (const post of newPosts) {
          const commentsResponse = await fetch(`${apiUrl}/comments/${post.id}`, { cache: 'no-store' });
          const commentsResult = await commentsResponse.json();
          if (commentsResult.success) {
            commentsData[post.id] = commentsResult.comments;
          }
        }
        setComments((prev) => (isRefresh ? commentsData : { ...prev, ...commentsData }));
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchStories = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const response = await fetch(`${apiUrl}/stories?currentUserId=${userId}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch stories');
      }
      const data = await response.json();
      if (data.success) {
        const storiesWithUserLikes = data.stories.map((story) => ({
          ...story,
          image: story.imageUrl || PLACEHOLDER_IMAGE,
          is_liked: story.is_liked || false,
          likes_count: story.likes_count || 0,
          comments: storyComments[story.id] || [],
        }));
        setStories(storiesWithUserLikes);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setError('Failed to load stories. Please try again.');
    }
  }, [userId, storyComments, token]);

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
        setStoryComments((prev) => ({
          ...prev,
          [storyId]: data.comments,
        }));
      }
    } catch (error) {
      console.error('Error fetching story comments:', error);
      setError('Failed to load story comments. Please try again.');
    }
  }, [token]);

  const fetchSuggestedPosts = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/posts?sort=views&limit=5`, {
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
        })));
      }
    } catch (error) {
      console.error('Error fetching suggested posts:', error);
      setError('Failed to load suggested posts. Please try again.');
    }
  }, [token]);

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
  }, [userId, token]);

  const fetchTrendingTopics = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/trending-topics?sort=shares&limit=3`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        setTrendingTopics([
          { name: "AI in Africa", shares: 1500 },
          { name: "Kenya Elections", shares: 1200 },
          { name: "Electric Vehicles", shares: 800 },
        ]);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setTrendingTopics(data.topics);
      } else {
        setTrendingTopics([
          { name: "AI in Africa", shares: 1500 },
          { name: "Kenya Elections", shares: 1200 },
          { name: "Electric Vehicles", shares: 800 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      setTrendingTopics([
        { name: "AI in Africa", shares: 1500 },
        { name: "Kenya Elections", shares: 1200 },
        { name: "Electric Vehicles", shares: 800 },
      ]);
    }
  }, [token]);

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
        setFollowers(data.followers.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
      setError('Failed to load followers. Please try again.');
    }
  }, [userId, token]);

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
        setFollowing(data.following.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching following:', error);
      setError('Failed to load following. Please try again.');
    }
  }, [userId, token]);

  const handleFollow = async (followId) => {
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
  };

  const handleUnfollow = async (followId) => {
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
  };

  const handleStoryLike = async (storyId, isLiked) => {
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
  };

  const handleStoryShare = (storyId) => {
    const storyUrl = `${window.location.origin}/story/${storyId}`;
    navigator.clipboard.writeText(storyUrl).then(() => {
      alert('Story URL copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy URL:', err);
      setError('Failed to copy story URL');
    });
  };

  const handleStoryCommentSubmit = async (storyId) => {
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
      setStoryComments((prev) => ({
        ...prev,
        [storyId]: [...(prev[storyId] || []), { ...result.comment, fullName: userData?.name || 'User' }],
      }));
      setStoryCommentInput('');
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('An error occurred while posting comment');
    }
  };

  const handlePostLike = async (postId, isLiked) => {
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
  };

  const handlePostShare = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      alert('Post URL copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy URL:', err);
      setError('Failed to copy post URL');
    });
  };

  const handlePostCommentSubmit = async (postId) => {
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
        [postId]: [...(prev[postId] || []), { ...result.comment, fullName: userData?.name || 'User' }],
      }));
      setCommentInput((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments_count: post.comments_count + 1 } : post
        )
      );
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('An error occurred while posting comment');
    }
  };

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

  useEffect(() => {
    if (selectedStoryIndex === null || isPaused) return;
    const progressInterval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          if (selectedStoryIndex < stories.length - 1) {
            setSelectedStoryIndex(selectedStoryIndex + 1);
            fetchStoryComments(stories[selectedStoryIndex + 1].id);
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
  }, [selectedStoryIndex, isPaused, stories.length, fetchStoryComments]);

  const openStory = (index) => {
    setSelectedStoryIndex(index);
    setStoryProgress(0);
    setIsPaused(false);
    fetchStoryComments(stories[index].id);
  };

  const closeStory = () => {
    setSelectedStoryIndex(null);
    setStoryProgress(0);
    setIsPaused(false);
    setStoryCommentInput('');
  };

  const goToNextStory = () => {
    if (selectedStoryIndex < stories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
      setStoryProgress(0);
      setStoryCommentInput('');
      fetchStoryComments(stories[selectedStoryIndex + 1].id);
    } else {
      closeStory();
    }
  };

  const goToPrevStory = () => {
    if (selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
      setStoryProgress(0);
      setStoryCommentInput('');
      fetchStoryComments(stories[selectedStoryIndex - 1].id);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const togglePostExpand = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
    if (!showComments[postId]) {
      setShowComments((prev) => ({ ...prev, [postId]: true }));
    }
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
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
                          alt={story.title}
                          width={60}
                          height={60}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-center text-xs font-medium truncate">
                      {story.author.split(' ')[0]}
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
                      alt={post.title}
                      width={80}
                      height={60}
                      className="rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="text-sm font-semibold line-clamp-2">{post.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {post.category} • {post.author}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <Eye className="inline w-3 h-3 mr-1" />
                        {post.views} views
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
                  className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark hover:shadow-card dark:hover:shadow-card-dark transition-all duration-350"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Image
                        src={post.author_image || '/user-symbol.jpg'}
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <Link
                          href={`/profile/${post.userId}`}
                          className="text-sm font-semibold hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
                        >
                          {post.author}
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
                        {post.title}
                      </h2>
                      <p
                        className={`text-sm text-gray-600 dark:text-gray-300 mb-3 transition-all duration-350 ${
                          expandedPost === post.id ? '' : 'line-clamp-3'
                        }`}
                        dangerouslySetInnerHTML={{ __html: post.description }}
                      />
                      {post.image && (
                        <Image
                          src={post.image}
                          alt={post.title}
                          width={600}
                          height={400}
                          className="w-full h-64 rounded-xl object-cover mb-3"
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
                          <span className="text-sm">{post.likes_count}</span>
                        </button>
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">{post.comments_count}</span>
                        </button>
                        <button
                          onClick={() => handlePostShare(post.id)}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
                        >
                          <Share className="w-5 h-5" />
                          <span className="text-sm">Share</span>
                        </button>
                      </div>
                      {post.link && (
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
                        >
                          <ExternalLink className="w-5 h-5" />
                          <span className="text-sm">Visit</span>
                        </a>
                      )}
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
                          {comments[post.id]?.map((comment) => (
                            <div key={comment.id} className="flex gap-2">
                              <Image
                                src={comment.author_image || '/user-symbol.jpg'}
                                alt="User"
                                width={24}
                                height={24}
                                className="rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{comment.fullName}</span>
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
                      <p className="text-sm font-medium">{topic.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{topic.shares} shares</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 font-heading">
                <UserCheck className="w-5 h-5" />
                Followers
              </h2>
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
                        src={user.image || '/user-symbol.jpg'}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.handle || '@' + user.name.toLowerCase().replace(/\s/g, '')}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 font-heading">
                <UserCheck className="w-5 h-5" />
                Following
              </h2>
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
                        src={user.image || '/user-symbol.jpg'}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.handle || '@' + user.name.toLowerCase().replace(/\s/g, '')}</p>
                      </div>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">No suggested users</p>
                ) : (
                  suggestedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-350"
                    >
                      <Link
                        href={`/profile/${user.id}`}
                        className="flex items-center gap-3 flex-1"
                      >
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.handle || '@' + user.name.toLowerCase().replace(/\s/g, '')}</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => user.is_followed ? handleUnfollow(user.id) : handleFollow(user.id)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors duration-350 ${
                          user.is_followed
                            ? 'bg-background-light dark:bg-background-dark text-gray-700 dark:text-gray-300 hover:bg-surface-light dark:hover:bg-surface-dark'
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
          </div>
        </div>
      </div>
      {selectedStoryIndex !== null && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={togglePause}>
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full">
                <div
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{
                    width:
                      index < selectedStoryIndex
                        ? '100%'
                        : index === selectedStoryIndex
                        ? `${storyProgress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeStory();
            }}
            className="absolute top-4 right-4 text-white z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevStory();
            }}
            className="absolute left-4 text-white z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNextStory();
            }}
            className="absolute right-4 text-white z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full max-w-md">
            <Image
              src={stories[selectedStoryIndex].image}
              alt={stories[selectedStoryIndex].title}
              width={400}
              height={600}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={stories[selectedStoryIndex].author_image || '/user-symbol.jpg'}
                  alt="User"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-white text-sm font-semibold">
                    {stories[selectedStoryIndex].author}
                  </p>
                  <p className="text-white/70 text-xs">
                    {formatDateTime(stories[selectedStoryIndex].created_at)}
                  </p>
                </div>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">
                {stories[selectedStoryIndex].title}
              </h3>
              {stories[selectedStoryIndex].description && (
                <p className="text-white/90 text-sm mb-4">
                  {stories[selectedStoryIndex].description}
                </p>
              )}
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStoryLike(
                      stories[selectedStoryIndex].id,
                      stories[selectedStoryIndex].is_liked
                    );
                  }}
                  className="flex items-center gap-1 text-white hover:text-accent-light transition-colors duration-350"
                >
                  <ThumbsUp
                    className={`w-5 h-5 ${stories[selectedStoryIndex].is_liked ? 'fill-white' : ''}`}
                  />
                  <span className="text-sm">{stories[selectedStoryIndex].likes_count}</span>
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-white hover:text-primary-light transition-colors duration-350"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{storyComments[stories[selectedStoryIndex].id]?.length || 0}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStoryShare(stories[selectedStoryIndex].id);
                  }}
                  className="flex items-center gap-1 text-white hover:text-primary-light transition-colors duration-350"
                >
                  <Share className="w-5 h-5" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
              <div className="space-y-2 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 mb-4">
                {storyComments[stories[selectedStoryIndex].id]?.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Image
                      src={comment.author_image || '/user-symbol.jpg'}
                      alt="User"
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{comment.fullName}</span>
                        <span className="text-white/70 text-xs">
                          {formatDateTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-white/90 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={storyCommentInput}
                  onChange={(e) => setStoryCommentInput(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Add a comment..."
                  className="flex-1 p-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-350"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStoryCommentSubmit(stories[selectedStoryIndex].id);
                  }}
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