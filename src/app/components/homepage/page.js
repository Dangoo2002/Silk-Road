'use client';

import { useEffect, useState } from 'react';
import styles from './home.module.css';

export default function Landing() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''; 
    console.log(`Fetching from: ${apiUrl}/posts`);

    fetch(`${apiUrl}/posts`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setPosts(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className={styles.container}>
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <div key={index} className={styles.postContainer}>
            <div className={styles.textSection}>
              <h1>{post.title}</h1>
              <p>
                {post.description.split(' ').slice(0, 50).join(' ') + '...'} 
              </p>
              <a className={styles.readMore} href={post.link}>Read More</a>
              <p className={styles.author}>By: {post.fullName}</p>
            </div>
            <div className={styles.imageSection}>
              <img src={post.imageUrl} alt={post.title} />
            </div>
          </div>
        ))
      ) : (
        <p>Loading posts...</p>
      )}
    </div>
  );
}
