'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; 
import styles from './write.module.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function WritePost() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

  
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/write`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert('Post saved successfully!');
    
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
              theme="snow" // Using the snow theme for a clean look
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
