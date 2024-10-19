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

  const [error, setError] = useState(''); // State for error message
  const router = useRouter(); // Initialize the router

  // Validate Image URL
  const validateImageUrl = async (url) => {
    try {
      const response = await fetch(url);
      return response.ok && response.headers.get('content-type').startsWith('image/');
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

    
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userId = userData ? userData.id : null; 
    if (!userId) {

      setError('You must be logged in to create a blog post.'); 
      return; 
    } else {
      setError(''); 
    }

    const strippedDescription = formData.description.replace(/<[^>]+>/g, ''); 

    const isValidImageUrl = await validateImageUrl(formData.imageUrl);
    if (!isValidImageUrl) {
      alert('Please enter a valid image URL.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          description: strippedDescription, 
          userId
        })
      });

      if (response.ok) {
        alert('Post saved successfully!');
        router.push('/');

        setFormData({
          title: '',
          description: '',
          imageUrl: '',
          link: ''
        });
      } else {
     
        const errorResponse = await response.json();
        console.error('Error saving post:', errorResponse);
        alert(`Error saving post: ${errorResponse.message || 'Unknown error'}`);
      }
      
    } catch (err) {
      console.error('Network or server error:', err); 
      alert('An unexpected error occurred while saving the post.');
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
        
        {error && <p className={styles.errorMessage}>{error}</p>} 
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
              placeholder='A minimum of 250 words'
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
                placeholder='Use short and valid image links'
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
