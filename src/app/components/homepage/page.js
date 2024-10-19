'use client';

import { useEffect, useState } from 'react';
import styles from './home.module.css';

export default function Landing() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const endpoint = `${apiUrl}/posts`;
      console.log('Fetching from:', endpoint); 

      const response = await fetch(endpoint);

      console.log('Response Status:', response.status); 
      console.log('Response Headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching posts:', errorText);
        alert('Failed to fetch posts');
        return;
      }

      const data = await response.json();
      console.log('Fetched Data:', data); 

      if (data && data.success) {
        setPosts(data.posts);
      } else {
        alert('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      alert('An error occurred while fetching posts');
    }
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
    <div className={styles.homeContainer}>
      <h1 className={styles.homeTitle}>Latest Blogs</h1>
      <div className={styles.cardsContainer}>
        {currentPosts.map((post) => (
          <div key={post.id} className={styles.card}>
            <img src={post.imageUrl} alt={post.title} className={styles.cardImage} />
            <h2 className={styles.cardTitle}>{post.title}</h2>
            <p className={styles.cardDescription}>
              {truncateText(post.description, 30)}{' '}
              <a href={`/post/${post.id}`} className={styles.cardLink}> 
                Read More
              </a>
            </p>
            <div className={styles.cardFooter}>
              <div className={styles.userInfo}>
                <img 
                  src="/user-symbol.jpg" 
                  alt="User" 
                  className={styles.userImage} 
                />
                <span className={styles.userName}>{post.fullName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.pagination}>
        <button 
          className={styles.paginationButton} 
          onClick={handlePrevPage} 
          disabled={currentPage === 1}
        >
          ←
        </button>
        <span className={styles.paginationInfo}>{currentPage} / {totalPages}</span>
        <button 
          className={styles.paginationButton} 
          onClick={handleNextPage} 
          disabled={currentPage === totalPages}
        >
          →
        </button>
      </div>
    </div>
  );
}
