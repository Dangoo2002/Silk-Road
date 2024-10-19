'use client';

import { useEffect, useState } from 'react';
import styles from './home.module.css';

export default function Landing() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const endpoint = `${apiUrl}/posts`; // Correctly format the endpoint with backticks
      console.log('Fetching from:', endpoint); // Log for debugging

      const response = await fetch(endpoint);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching posts:', errorText);
        alert('Failed to fetch posts');
        return;
      }

      const data = await response.json();

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

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.homeTitle}>Latest Blogs</h1>
      <div className={styles.cardsContainer}>
        {posts.map((post) => (
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
    </div>
  );
}
