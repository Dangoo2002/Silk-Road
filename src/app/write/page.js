'use client'

import { useState } from 'react';
import styles from './write.module.css';

export default function WritePost() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/write', {
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
      <h1 className={styles.writePostTitle}>Create a New Post</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.writePostFormGroup}>
          <label>Title:</label>
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
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className={styles.writePostTextarea}
          />
        </div>

        <div className={styles.writePostFormGroup}>
          <label>Image URL:</label>
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
          <label>Link:</label>
          <input
            type="text"
            name="link"
            value={formData.link}
            onChange={handleChange}
            required
            className={styles.writePostInput}
          />
        </div>

        <button type="submit" className={styles.writePostButton}>Submit</button>
      </form>
    </div>
  );
}
