'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; 
import styles from './write.module.css';
import { useRouter } from 'next/navigation';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function WritePost() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: ''
  });

  const router = useRouter(); // Initialize the router

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

    // Retrieve user data from local storage
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userId = userData ? userData.id : null; // Get user ID

    if (!userId) {
      alert('User not authenticated');
      return; // Exit if user is not authenticated
    }

    const response = await fetch(`${apiUrl}/write`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...formData,
        userId // Include userId in the request body
      })
    });

    if (response.ok) {
      alert('Post saved successfully!');
      
      // Redirect to homepage
      router.push('/'); // Redirect to homepage
      
      // Reset form data
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        link: ''
      });
    } else {
      alert('Error saving post');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.writePostContainer}>
      <div className={styles.writePostCard}>
        <h1 className={styles.writePostTitle}>Create a New Blog</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.writePostFormGroup}>
            <label className={styles.label}>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={styles.writePostInput}
            />
          </div>

          <div className={styles.writePostFormGroup}>
            <label className={styles.label}>Description:</label>
            <ReactQuill
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              className={styles.writePostTextarea}
              theme="snow" 
            />
          </div>

          <div className={styles.writePostFormGroup}>
            <label className={styles.label}>Image URL:</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              required
              className={styles.writePostInput}
            />
          </div>

          <div className={styles.writePostFormGroup}>
            <label className={styles.label}>Link:</label>
            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={handleChange}
              required
              className={styles.writePostInput}
            />
          </div>

          <button type="submit" className={styles.writePostButton}>Add New Blog</button>
        </form>
      </div>
    </div>
  );
}
