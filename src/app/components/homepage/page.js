'use client'

import { useEffect, useState } from 'react';
import styles from './home.module.css';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts')
      .then(response => response.json())
      .then(data => setPosts(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className={styles.container}>
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <div key={index} className={styles.postContainer}>
            {index % 2 === 0 ? (
              <>
                <div className={styles.textSection}>
                  <h1>{post.title}</h1>
                  <p>{post.description}</p>
                  <a className={styles.readMore} href={post.link}>Read More</a>
                </div>
                <div className={styles.imageSection}>
                  <img src={post.imageUrl} alt={post.title} />
                </div>
              </>
            ) : (
              <>
                <div className={styles.imageSection}>
                  <img src={post.imageUrl} alt={post.title} />
                </div>
                <div className={styles.textSection}>
                  <h1>{post.title}</h1>
                  <p>{post.description}</p>
                  <a className={styles.readMore} href={post.link}>Read More</a>
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <p>Loading posts...</p>
      )}
    </div>
  );
}
