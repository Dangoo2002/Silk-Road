'use client';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext/AuthContext'; // Ensure the context is imported
import styles from './account.module.css';
import Link from 'next/link';

export default function AccountDetails() {
    const { userData, isLoggedIn } = useContext(AuthContext); // Get userData and isLoggedIn from context
    const [activeTab, setActiveTab] = useState('personalDetails');
    const [userDetails, setUserDetails] = useState(null); // Define the userDetails state
    const [userBlogs, setUserBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Set the base URL using process.env
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';


    useEffect(() => {
        console.log("Base URL:", baseUrl);
        if (isLoggedIn && userData?.id) {
            // Fetch user details
            const fetchUserDetails = async () => {
                try {
                    const response = await axios.get(`${baseUrl}/api/user/details`, {
                        params: { id: userData.id }, // Pass userId in the query params
                        withCredentials: true,
                    });
                    setUserDetails(response.data.data);
                } catch (error) {
                    console.error('Error fetching user details:', error);
                    alert('Failed to fetch user details');
                }
            };

            // Fetch user blogs
            const fetchUserBlogs = async () => {
                try {
                    const response = await axios.get(`${baseUrl}/api/user/blogs`, {
                        params: { userId: userData.id }, // Pass userData.id for blogs
                        withCredentials: true,
                    });
                    if (response.data.success) {
                        setUserBlogs(response.data.data); // Set user blogs if successful
                    } else {
                        alert('Failed to fetch user blogs');
                    }
                } catch (error) {
                    console.error('Error fetching user blogs:', error);
                    alert('Error fetching user blogs');
                }
            };

            fetchUserDetails();
            fetchUserBlogs();
        } else {
            setLoading(false); // No user data, stop loading
        }
    }, [isLoggedIn, userData, baseUrl]); // Added baseUrl to dependency array

    const handleDeleteAccount = async () => {
        try {
            const response = await axios.delete(`${baseUrl}/api/user/delete`, {
                params: { id: userData.id }, // Pass userData.id for account deletion
                withCredentials: true,
            });
            if (response.data.success) {
                alert('Account deleted successfully');
                window.location.href = '/';
            } else {
                alert('Failed to delete account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Failed to delete account');
        }
    };

    const handleDeleteBlog = async (blogId) => {
        try {
            const response = await axios.delete(`${baseUrl}/api/blogs/${blogId}`, {
                params: { userId: userData.id }, // Pass user ID for deletion
                withCredentials: true,
            });
            if (response.data.success) {
                setUserBlogs(userBlogs.filter((blog) => blog.id !== blogId)); // Remove deleted blog from state
                alert('Blog deleted successfully');
            } else {
                alert('Failed to delete blog');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Failed to delete blog');
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'personalDetails':
                return (
                    <div className={styles.tabContent}>
                        {userDetails ? (
                            <>
                                <p><strong>Name:</strong> {userDetails.name}</p>
                                <p><strong>Email:</strong> {userDetails.email}</p>
                                <button className={styles.deleteButton} onClick={handleDeleteAccount}>
                                    Delete Account
                                </button>
                            </>
                        ) : loading ? (
                            <p>Loading...</p>
                        ) : (
                            <p>No user details found.</p>
                        )}
                    </div>
                );
            case 'myBlogs':
                return (
                    <div className={styles.tabContent}>
                        {userBlogs.length > 0 ? (
                            userBlogs.map((blog) => (
                                <div key={blog.id} className={styles.blogItem}>
                                    <div className={styles.blogCard}>
                                        {/* Image */}
                                        {blog.imageUrl && (
                                            <img src={blog.imageUrl} alt={blog.title} className={styles.blogImage} />
                                        )}
                                        <div className={styles.blogDetails}>
                                            <h3 className={styles.blogTitle}>{blog.title}</h3>
                                            <p className={styles.blogDescription}>{blog.description}</p>
                                            <div className={styles.blogActions}>
                                                <Link href="edit">
                                                    <button className={styles.editButton}>Edit</button>
                                                </Link>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDeleteBlog(blog.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No blogs found.</p>
                        )}
                    </div>
                );
            case 'changePassword':
                return (
                    <div className={styles.tabContent}>
                        <form className={styles.changePasswordForm}>
                            <label>
                                Current Password:
                                <input type="password" className={styles.inputField} />
                            </label>
                            <label>
                                New Password:
                                <input type="password" className={styles.inputField} />
                            </label>
                            <label>
                                Confirm New Password:
                                <input type="password" className={styles.inputField} />
                            </label>
                            <button type="submit" className={styles.submitButton}>
                                Change Password
                            </button>
                        </form>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <ul className={styles.menuList}>
                    <li
                        className={`${styles.menuItem} ${activeTab === 'personalDetails' ? styles.active : ''}`}
                        onClick={() => setActiveTab('personalDetails')}
                    >
                        Personal Details
                    </li>
                    <li
                        className={`${styles.menuItem} ${activeTab === 'myBlogs' ? styles.active : ''}`}
                        onClick={() => setActiveTab('myBlogs')}
                    >
                        My Blogs
                    </li>
                    <li
                        className={`${styles.menuItem} ${activeTab === 'changePassword' ? styles.active : ''}`}
                        onClick={() => setActiveTab('changePassword')}
                    >
                        Change Password
                    </li>
                </ul>
            </aside>
            <main className={styles.mainContent}>{renderContent()}</main>
        </div>
    );
}
