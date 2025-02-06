'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './edit.module.css';

export default function EditBlog() {
  const router = useRouter();
  const [blogId, setBlogId] = useState(null); // Set blogId using state

  const [blogDetails, setBlogDetails] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
  });

  useEffect(() => {
    // Ensure the query parameters are available
    if (router.query?.blogId) {
      setBlogId(router.query.blogId); // Set blogId when available
    }
  }, [router.query]); // Re-run this effect when the query params change

  useEffect(() => {
    if (blogId) {
      // Fetch the existing blog details if blogId is available
      const fetchBlogDetails = async () => {
        try {
          const response = await axios.get(`/api/blogs/${blogId}`);
          setBlogDetails(response.data);
        } catch (error) {
          console.error('Error fetching blog details:', error);
          alert('Failed to fetch blog details');
        }
      };

      fetchBlogDetails();
    }
  }, [blogId]); // Only fetch blog details when blogId changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlogDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault(); // Prevent form submission and page reload

    if (!blogId) {
      alert('Blog ID is not available');
      return;
    }

    console.log('Submitting form with data:', blogDetails); // Debugging: Check the data

    try {
      const response = await axios.put(`/api/blogs/${blogId}`, blogDetails);
      console.log('API response:', response); // Debugging: Check the API response
      if (response.data.success) {
        alert('Blog updated successfully');
        router.push('/account'); // Redirect to the account page
      } else {
        alert('Failed to update blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Failed to update blog');
    }
  };

  return (
    <div className={styles.editBlogContainer}>
      <h2 className={styles.editBlogTitle}>Edit Blog</h2>
      <form className={styles.editBlogForm}>
        <label className={styles.editBlogLabel}>
          Title:
          <input
            type="text"
            name="title"
            value={blogDetails.title}
            onChange={handleInputChange}
            required
            className={styles.editBlogInput}
          />
        </label>
        <label className={styles.editBlogLabel}>
          Description:
          <textarea
            name="description"
            value={blogDetails.description}
            onChange={handleInputChange}
            required
            className={styles.editBlogTextarea}
          />
        </label>
        <label className={styles.editBlogLabel}>
          Image URL:
          <input
            type="text"
            name="imageUrl"
            value={blogDetails.imageUrl}
            onChange={handleInputChange}
            required
            className={styles.editBlogInput}
          />
        </label>
        <label className={styles.editBlogLabel}>
          Link:
          <input
            type="text"
            name="link"
            value={blogDetails.link}
            onChange={handleInputChange}
            required
            className={styles.editBlogInput}
          />
        </label>
        {/* Button with onClick handler */}
        <button type="button" onClick={handleClick} className={styles.editBlogButton}>Save Changes</button>
      </form>
    </div>
  );
}
