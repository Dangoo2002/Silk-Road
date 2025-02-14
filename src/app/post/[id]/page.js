'use client';

import { useEffect, useState } from 'react';
import styles from './post.module.css'; 
import Nav from '@/app/components/navbar/page';
import Footer from '@/app/components/footer/page';

export default function BlogPost({ params }) {
  const { id } = params; 
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';
      const response = await fetch(`${apiUrl}/posts/${id}`); 

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching post:', errorText);
        alert('Failed to fetch post');
        return;
      }

      const data = await response.json();

      if (data && data.success) {
        setPost(data.post); 
      } else {
        alert('Failed to fetch post');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('An error occurred while fetching post');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true
    });
    return `${formattedDate} at ${formattedTime}`;
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div>
      <Nav />
      <div className={styles.postContainer}>
        <h1 className={styles.postTitle}>{post.title}</h1>
        <img src={post.imageUrl} alt={post.title} className={styles.postImage} />
        <p className={styles.postDescription}>{post.description}</p>
        <div className={styles.authorInfo}>
          <img src="/user-symbol.jpg" alt={post.fullName} className={styles.userImage} />
          <span className={styles.userName}>{post.fullName}</span>
          <span className={styles.verticalLine}>|</span>
          <span className={styles.postDate}>{formatDateTime(post.created_at)}</span> 
        </div>
      </div>
      <Footer />
    </div>
  );
}
