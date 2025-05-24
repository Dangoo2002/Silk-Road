'use client';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/app/components/AuthContext/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, ChatBubbleOvalLeftIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';

export default function ProfilePage() {
  const { isLoggedIn, userData } = useContext(AuthContext);
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const DEFAULT_IMAGE = '/user-symbol.jpg';

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch user details
        const userResponse = await fetch(`${apiUrl}/user/${id}`, {
          headers: isLoggedIn && userData?.token ? { Authorization: `Bearer ${userData.token}` } : {},
          cache: 'no-store',
        });
        const userDataResult = await userResponse.json();
        if (!userDataResult.success) {
          throw new Error(userDataResult.message || 'Failed to fetch user');
        }
        setUser(userDataResult.user);
        setIsFollowing(userDataResult.user.is_followed);

        // Fetch user posts
        const postsResponse = await fetch(`${apiUrl}/user/${id}/posts`, {
          headers: isLoggedIn && userData?.token ? { Authorization: `Bearer ${userData.token}` } : {},
          cache: 'no-store',
        });
        const postsResult = await postsResponse.json();
        if (!postsResult.success) {
          throw new Error(postsResult.message || 'Failed to fetch posts');
        }
        setPosts(postsResult.posts);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id, isLoggedIn, userData, apiUrl]);

  const handleFollowToggle = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      const endpoint = isFollowing ? '/unfollow' : '/follow';
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData.token}`,
        },
        body: JSON.stringify({
          userId: userData.id,
          followId: parseInt(id),
        }),
      });
      const result = await response.json();
      if (result.success) {
        setIsFollowing(!isFollowing);
        setUser((prev) => ({
          ...prev,
          followers_count: isFollowing ? prev.followers_count - 1 : prev.followers_count + 1,
        }));
      } else {
        setError(result.message || 'Failed to update follow status');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300 text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 dark:text-red-400 text-lg">{error || 'User not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl p-6 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10" />
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <Image
                src={user.image || DEFAULT_IMAGE}
                alt={user.name}
                width={120}
                height={120}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
                onError={(e) => (e.target.src = DEFAULT_IMAGE)}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20" />
            </div>
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{user.handle}</p>
              <p className="mt-2 text-gray-700 dark:text-gray-300 max-w-md">{user.bio}</p>
              {/* Stats */}
              <div className="mt-4 flex justify-center md:justify-start gap-6 text-sm">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{user.posts_count}</span>
                  <span className="text-gray-500 dark:text-gray-400"> Posts</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{user.followers_count}</span>
                  <span className="text-gray-500 dark:text-gray-400"> Followers</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{user.following_count}</span>
                  <span className="text-gray-500 dark:text-gray-400"> Following</span>
                </div>
              </div>
              {/* Follow Button */}
              {isLoggedIn && userData?.id !== parseInt(id) && (
                <button
                  onClick={handleFollowToggle}
                  className={`mt-4 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                  }`}
                >
                  {isFollowing ? (
                    <div className="flex items-center gap-2">
                      <UserMinusIcon className="h-5 w-5" />
                      Unfollow
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlusIcon className="h-5 w-5" />
                      Follow
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Posts Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Posts</h2>
          {posts.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No posts yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-xl overflow-hidden hover:shadow-lg dark:hover:shadow-2xl transition-shadow duration-300"
                  >
                    <Link href={`/post/${post.id}`} className="block">
                      <div className="relative">
                        <Image
                          src={post.imageUrls[0] || DEFAULT_IMAGE}
                          alt={post.title}
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover"
                          onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                          {post.title}
                        </h3>
                        <p
                          className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(post.description, { ALLOWED_TAGS: [] }),
                          }}
                        />
                        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <HeartIcon className="h-5 w-5" />
                            <span>{post.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                            <span>{post.comments_count}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}