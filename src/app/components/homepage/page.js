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
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const endpoint = `${apiUrl}/posts`;
      console.log('Fetching from:', endpoint); // Log for debugging

      const response = await fetch(endpoint);

      console.log('Response Status:', response.status); // Log the response status
      console.log('Response Headers:', response.headers); // Log response headers

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
