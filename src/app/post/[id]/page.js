'use client';

import { useEffect, useState, useContext } from 'react';
import { HeartIcon, ShareIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Nav from '@/app/components/navbar/page';
import Footer from '@/app/components/footer/page';
import { AuthContext } from '@/app/components/AuthContext/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon, TagIcon, EyeIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic'; // Disable static optimization

export default function BlogPost({ params }) {
  const { id } = params;
  const { userData } = useContext(AuthContext);
  const userId = userData?.id || null;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [morePosts, setMorePosts] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!id || isNaN(parseInt(id, 10))) {
      console.error('Invalid post ID:', id);
      if (isMounted) setLoading(false);
      return;
    }
    setPost(null);
    Promise.all([fetchPost(), fetchComments(), fetchMorePosts()]).then(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [id, userId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const url = userId
        ? `${apiUrl}/posts/${id}?userId=${userId}&t=${Date.now()}`
        : `${apiUrl}/posts/${id}?t=${Date.now()}`;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        console.error('Error fetching post:', await response.text());
        alert('Failed to fetch post');
        return;
      }

      const data = await response.json();
      if (data && data.success && data.post) {
        setPost({
          ...data.post,
          category: data.post.category || 'General',
          tags: data.post.tags || ['News', 'Trending'],
          views: data.post.views || 0,
          reading_time: data.post.reading_time || '5 min',
          author_bio: data.post.author_bio || 'Passionate about sharing stories and insights.',
        });
      } else {
        console.error('Invalid response:', data);
        alert('Failed to fetch post');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('An error occurred while fetching post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const response = await fetch(`${apiUrl}/comments/${id}`, { cache: 'no-store' });
      const data = await response.json();

      if (data && data.success) {
        setComments(data.comments);
      } else {
        alert('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      alert('An error occurred while fetching comments');
    }
  };

  const fetchMorePosts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const response = await fetch(`${apiUrl}/posts?userId=${post?.userId || ''}&exclude=${id}&limit=3`, { cache: 'no-store' });
      const data = await response.json();

      if (data && data.success) {
        setMorePosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching more posts:', error);
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
        console.error('Error liking/unliking post:', await response.text());
        alert('Failed to update like');
        return;
      }

      setPost((prev) => ({
        ...prev,
        likes_count: isLiked ? prev.likes_count - 1 : prev.likes_count + 1,
        is_liked: !isLiked,
      }));
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      alert('An error occurred while updating like');
    }
  };

  const handleShare = async (platform = 'clipboard') => {
    if (!userId) {
      alert('Please log in to share a post');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const response = await fetch(`${apiUrl}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id, userId }),
      });

      if (!response.ok) {
        console.error('Error sharing post:', await response.text());
        alert('Failed to share post');
        return;
      }

      const postUrl = `${window.location.origin}/post/${id}`;
      if (platform === 'clipboard') {
        navigator.clipboard.writeText(postUrl).then(() => {
          alert('Post URL copied to clipboard!');
        }).catch((err) => {
          console.error('Failed to copy URL:', err);
          alert('Failed to copy URL');
        });
      } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post?.title || '')}`, '_blank');
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
      }
      setShareOpen(false);
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('An error occurred while sharing post');
    }
  };

  const handleCommentSubmit = async () => {
    if (!userId) {
      alert('Please log in to comment');
      return;
    }

    const content = commentInput.trim();
    if (!content) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const response = await fetch(`${apiUrl}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id, userId, content }),
      });

      if (!response.ok) {
        console.error('Error posting comment:', await response.text());
        alert('Failed to post comment');
        return;
      }

      const result = await response.json();
      setComments((prev) => [...prev, { ...result.comment, fullName: userData?.name || 'User' }]);
      setCommentInput('');
      setPost((prev) => ({ ...prev, comments_count: prev.comments_count + 1 }));
      setShowComments(true);
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('An error occurred while posting comment');
    }
  };

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const handleFollow = async () => {
    if (!userId) {
      alert('Please log in to follow users');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const response = await fetch(`${apiUrl}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, followId: post.userId }),
      });

      if (!response.ok) {
        console.error('Error following user:', await response.text());
        alert('Failed to follow user');
        return;
      }

      setPost((prev) => ({ ...prev, is_followed: true }));
    } catch (error) {
      console.error('Error following user:', error);
      alert('An error occurred while following user');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-2xl font-semibold text-text-light dark:text-text-dark">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-2xl font-semibold text-text-light dark:text-text-dark">Post not found</div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pt-16">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark overflow-hidden"
        >
          {/* Header Image */}
          <div className="relative">
            <Image
              src={post.imageUrl || '/api/placeholder/1200/400'}
              alt={post.title}
              width={1200}
              height={400}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-block bg-primary-light dark:bg-primary-dark text-white px-3 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-light dark:text-text-dark mb-6 leading-tight font-heading">
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
                  src="/user-symbol.jpg"
                  alt={post.fullName}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div>
                  <Link
                    href={`/profile/${post.userId}`}
                    className="text-lg font-medium text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
                  >
                    {post.fullName}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatDateTime(post.created_at)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleFollow}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors duration-350 ${
                  post.is_followed
                    ? 'bg-background-light dark:bg-background-dark text-gray-700 dark:text-gray-300'
                    : 'bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary-light'
                }`}
                disabled={post.is_followed}
              >
                <UserPlusIcon className="w-4 h-4" />
                {post.is_followed ? 'Following' : 'Follow'}
              </button>
            </div>

            {/* Post Description */}
            <p className="text-text-light dark:text-text-dark text-lg leading-relaxed mb-8">{post.description}</p>

            {/* Interaction Bar */}
            <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-600 py-4 mb-8">
              <div className="flex items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(post.id, post.is_liked)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-accent-light dark:hover:text-accent-dark transition-colors duration-350"
                  aria-label={post.is_liked ? 'Unlike post' : 'Like post'}
                >
                  {post.is_liked ? (
                    <HeartIconSolid className="w-6 h-6 text-accent-light dark:text-accent-dark" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                  <span>{post.likes_count}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleComments}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
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
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
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
                        className="absolute top-full left-0 mt-2 w-48 bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark border border-gray-200 dark:border-gray-600 p-2 z-50"
                      >
                        <button
                          onClick={() => handleShare('clipboard')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-background-light dark:hover:bg-background-dark rounded-md transition-colors duration-350"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-background-light dark:hover:bg-background-dark rounded-md transition-colors duration-350"
                        >
                          Share to Twitter
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-background-light dark:hover:bg-background-dark rounded-md transition-colors duration-350"
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
                  <div className="mb-6 p-4 bg-background-light dark:bg-background-dark rounded-xl shadow-card dark:shadow-card-dark">
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full p-3 bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-350 placeholder-gray-400 resize-none"
                      rows="4"
                      aria-label="Comment input"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCommentSubmit}
                      className="mt-3 px-6 py-2 bg-primary-light dark:bg-primary-dark text-white font-medium rounded-xl hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-350"
                      aria-label="Submit comment"
                    >
                      Post Comment
                    </motion.button>
                  </div>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-4 bg-background-light dark:bg-background-dark rounded-xl shadow-card dark:shadow-card-dark">
                        <div className="flex items-center gap-2 mb-2">
                          <Image
                            src="/user-symbol.jpg"
                            alt={comment.fullName}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <span className="text-sm font-medium text-text-light dark:text-text-dark">
                              {comment.fullName}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {formatDateTime(comment.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-text-light dark:text-text-dark">{comment.content}</p>
                        <button
                          className="text-xs text-primary-light dark:text-primary-dark hover:underline mt-2"
                          aria-label="Reply to comment"
                        >
                          Reply
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.article>

        {/* Author Bio */}
        <div className="mt-12 bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-6">
          <h2 className="text-2xl font-semibold mb-4 font-heading">About the Author</h2>
          <div className="flex items-center gap-4">
            <Image
              src="/user-symbol.jpg"
              alt={post.fullName}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
            <div>
              <Link
                href={`/profile/${post.userId}`}
                className="text-lg font-medium text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-350"
              >
                {post.fullName}
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-300">{post.author_bio}</p>
            </div>
          </div>
        </div>

        {/* More from Author */}
        {morePosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4 font-heading">More from {post.fullName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {morePosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/post/${relatedPost.id}`}
                  className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark p-4 hover:shadow-card dark:hover:shadow-card-dark transition-all duration-350"
                >
                  <Image
                    src={relatedPost.imageUrl || '/api/placeholder/300/200'}
                    alt={relatedPost.title}
                    width={300}
                    height={200}
                    className="w-full h-40 rounded-xl object-cover mb-4"
                  />
                  <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2 line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{relatedPost.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}