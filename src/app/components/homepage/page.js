'use client';
import { useEffect, useState, useContext } from 'react';
import { HeartIcon, ShareIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';
import { AuthContext } from '../AuthContext/AuthContext';

export default function SocialMediaFeed() {
  const { userData } = useContext(AuthContext);
  const userId = userData?.id || null;
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [showComments, setShowComments] = useState({});
  const postsPerPage = 6;

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const fetchPosts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const endpoint = userId
        ? `${apiUrl}/posts?userId=${userId}&t=${Date.now()}`
        : `${apiUrl}/posts?t=${Date.now()}`;
      const response = await fetch(endpoint, { cache: 'no-store' });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching posts:', errorText);
        alert('Failed to fetch posts');
        return;
      }

      const data = await response.json();
      if (data && data.success) {
        const sortedPosts = data.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPosts(sortedPosts);

        const commentsData = {};
        for (const post of sortedPosts) {
          const commentsResponse = await fetch(`${apiUrl}/comments/${post.id}`, { cache: 'no-store' });
          const commentsResult = await commentsResponse.json();
          if (commentsResult.success) {
            commentsData[post.id] = commentsResult.comments;
          }
        }
        setComments(commentsData);
      } else {
        alert('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      alert('An error occurred while fetching posts');
    }
  };

  const handleLike = async (postId, isLiked) => {
    if (!userId) {
      alert('Please log in to like a post');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`${apiUrl}/likes`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error liking/unliking post:', errorText);
        alert('Failed to update like');
        return;
      }

      const updatedPosts = posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
              is_liked: !isLiked,
            }
          : post
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      alert('An error occurred while updating like');
    }
  };

  const handleShare = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      alert('Post URL copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy URL');
    });
  };

  const handleCommentSubmit = async (postId) => {
    if (!userId) {
      alert('Please log in to comment');
      return;
    }

    const content = commentInput[postId]?.trim();
    if (!content) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const response = await fetch(`${apiUrl}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId, content }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error posting comment:', errorText);
        alert('Failed to post comment');
        return;
      }

      const result = await response.json();
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), result.comment],
      }));
      setCommentInput((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments_count: post.comments_count + 1 } : post
        )
      );
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('An error occurred while posting comment');
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

    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const truncateText = (text, wordLimit) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">What’s Happening</h1>
      <div className="space-y-6">
        {currentPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div className="p-4">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src="/user-symbol.jpg"
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <Link
                    href={`/profile/${post.userId}`}
                    className="text-sm font-semibold hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.fullName}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(post.created_at)}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <Link href={`/post/${post.id}`}>
                <h2 className="text-lg font-semibold mb-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {truncateText(post.description, 20)}{' '}
                <Link
                  href={`/post/${post.id}`}
                  className="text-blue-500 dark:text-blue-400 font-medium hover:underline"
                >
                  Read more
                </Link>
              </p>
              {post.imageUrl && (
                <Link href={`/post/${post.id}`}>
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="w-full rounded-lg object-cover mb-3"
                  />
                </Link>
              )}

              {/* Interaction Bar */}
              <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-700 py-2 mb-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id, post.is_liked)}
                    className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    {post.is_liked ? (
                      <HeartIconSolid className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span className="text-sm">{post.likes_count}</span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <span className="text-sm">{post.comments_count}</span>
                  </button>
                  <button
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <ShareIcon className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-3">
                  <div className="mb-3">
                    <textarea
                      value={commentInput[post.id] || ''}
                      onChange={(e) =>
                        setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      placeholder="Add a comment..."
                      className="w-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                      rows="2"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm"
                    >
                      Post
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Image
                          src="/user-symbol.jpg"
                          alt="User"
                          width={24}
                          height={24}
                          className="rounded-full"
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
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium text-white ${
            currentPage === 1
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors`}
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium text-white ${
            currentPage === totalPages
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors`}
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}