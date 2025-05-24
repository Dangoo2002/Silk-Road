'use client';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/app/components/AuthContext/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, ChatBubbleOvalLeftIcon, UserPlusIcon, UserMinusIcon, HomeIcon, UserIcon, DocumentTextIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { useSwipeable } from 'react-swipeable';

const SkeletonProfile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="container mx-auto px-4 py-20">
        {/* Skeleton Profile Header */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-2xl p-8 mb-12 relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10" />
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Skeleton Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20" />
            </div>
            {/* Skeleton User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-2 mx-auto md:mx-0" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4 mx-auto md:mx-0" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-64 mb-4 mx-auto md:mx-0" />
              {/* Skeleton Stats */}
              <div className="mt-4 flex justify-center md:justify-start gap-8">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20" />
              </div>
              {/* Skeleton Follow Button */}
              <div className="mt-4 h-10 bg-gray-300 dark:bg-gray-600 rounded-full w-32 mx-auto md:mx-0" />
            </div>
          </div>
        </div>
        {/* Skeleton Posts Section */}
        <div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-8" />
          <div className="relative">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-lg p-6 animate-pulse">
              <div className="w-full h-64 bg-gray-300 dark:bg-gray-600 rounded-2xl mb-4" />
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 mb-4" />
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VerifiedBadge = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block ml-1"
    title="Verified"
  >
    <circle cx="12" cy="12" r="12" fill="#3B82F6" />
    <path
      d="M9.75 16.5L5.25 12L6.6825 10.5675L9.75 13.6275L17.3175 6.06L18.75 7.5L9.75 16.5Z"
      fill="white"
    />
  </svg>
);

export default function ProfilePage() {
  const { isLoggedIn, userData, token } = useContext(AuthContext);
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [postIndex, setPostIndex] = useState(0);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend-production.up.railway.app';
  const DEFAULT_IMAGE = '/def.jpg';

  // Swipe handlers for the carousel
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setPostIndex((prev) => Math.min(posts.length - 1, prev + 1)),
    onSwipedRight: () => setPostIndex((prev) => Math.max(0, prev - 1)),
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = isLoggedIn && token ? { Authorization: `Bearer ${token}` } : {};
        const userResponse = await fetch(`${apiUrl}/user/${id}`, {
          headers,
          cache: 'no-store',
        });
        const userDataResult = await userResponse.json();
        if (!userDataResult.success) {
          throw new Error(userDataResult.message || 'Failed to fetch user');
        }
        setUser(userDataResult.user);
        setIsFollowing(userDataResult.user.is_followed);

        const postsResponse = await fetch(`${apiUrl}/user/${id}/posts`, {
          headers,
          cache: 'no-store',
        });
        const postsResult = await postsResponse.json();
        if (!postsResult.success) {
          throw new Error(postsResult.message || 'Failed to fetch posts');
        }
        setPosts(postsResult.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id, isLoggedIn, token, apiUrl]);

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
          Authorization: `Bearer ${token}`,
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

  const handlePrevPost = () => setPostIndex((prev) => Math.max(0, prev - 1));
  const handleNextPost = () => setPostIndex((prev) => Math.min(posts.length - 1, prev + 1));

  const scrollToSection = (section) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <SkeletonProfile />;
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-red-500 dark:text-red-400 text-lg font-medium">{error || 'User not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Floating Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl px-4 py-2 shadow-lg shadow-gray-200/20 dark:shadow-gray-900/20 flex"
      >
        <div className="flex items-center space-x-2 sm:space-x-4">
          {[
            { key: 'home', icon: HomeIcon, label: 'Home', href: '/' },
            { key: 'profile', icon: UserIcon, label: 'Profile', section: 'profile' },
            { key: 'posts', icon: DocumentTextIcon, label: 'Posts', section: 'posts' },
          ].map(({ key, icon: Icon, label, href, section }) => (
            <motion.button
              key={key}
              onClick={() => (href ? router.push(href) : scrollToSection(section))}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-xl transition-all duration-300 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Icon className="w-5 h-5" />
              <span className="sr-only">{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-20">
        {/* Profile Header */}
        <motion.div
          id="profile"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-2xl p-8 mb-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 dark:from-indigo-700/10 dark:to-purple-800/10" />
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse opacity-50" />
                <Image
                  src={user.image && typeof user.image === 'string' ? `${user.image}?t=${Date.now()}` : DEFAULT_IMAGE}
                  alt={user.name}
                  width={128}
                  height={128}
                  className="relative z-10 w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                  onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                />
              </div>
            </div>
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
                {user.name}
                {user.verified ? <VerifiedBadge /> : null}
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400">@{user.handle}</p>
              <p className="mt-3 text-gray-700 dark:text-gray-300 max-w-md leading-relaxed">
                {user.bio || 'No bio available'}
              </p>
              {/* Stats */}
              <div className="mt-6 flex justify-center md:justify-start gap-8 text-sm">
                {[
                  { label: 'Posts', value: user.posts_count },
                  { label: 'Followers', value: user.followers_count },
                  { label: 'Following', value: user.following_count },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <span className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {value}
                    </span>
                    <span className="block text-gray-500 dark:text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
              {/* Follow Button */}
              {isLoggedIn && userData?.id !== parseInt(id) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollowToggle}
                  className={`mt-6 px-6 py-3 rounded-2xl text-base font-medium shadow-lg transition-all duration-300 ${
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
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Posts Section */}
        <motion.div
          id="posts"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-8">
            Posts
          </h2>
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
            </motion.div>
          ) : (
            <div className="relative" {...swipeHandlers}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={postIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <Link href={`/post/${posts[postIndex].id}`} className="block">
                    <div className="relative h-64 w-full">
                      <Image
                        src={
                          posts[postIndex].imageUrls?.[0] && typeof posts[postIndex].imageUrls[0] === 'string'
                            ? `${posts[postIndex].imageUrls[0]}?t=${Date.now()}`
                            : DEFAULT_IMAGE
                        }
                        alt={posts[postIndex].title}
                        fill
                        className="object-cover rounded-t-3xl"
                        onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                        {posts[postIndex].title}
                      </h3>
                      <p
                        className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(posts[postIndex].description, { ALLOWED_TAGS: [] }),
                        }}
                      />
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <HeartIcon className={`h-5 w-5 ${posts[postIndex].is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                          <span>{posts[postIndex].likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                          <span>{posts[postIndex].comments_count}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>
              {posts.length > 1 && (
                <>
                  <motion.button
                    onClick={handlePrevPost}
                    disabled={postIndex === 0}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg ${
                      postIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </motion.button>
                  <motion.button
                    onClick={handleNextPost}
                    disabled={postIndex === posts.length - 1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg ${
                      postIndex === posts.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    <ArrowRightIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </motion.button>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}