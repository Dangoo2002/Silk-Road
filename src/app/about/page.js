import styles from './about.module.css';

export default function AboutUs() {
  return (
    <div className={styles['about-us-div']}>
      <h1 id={styles.welcomeheading}>Welcome to Silk Road Blogs</h1>
      <p>At Silk Road Blogs, we are passionate about discussions on diverse topics ranging from technology, politics, travel, and fitness.</p>
      <h2>Our Mission</h2>
      <p>Our mission is to provide insightful articles, inspire adventure and simplify tech for everyone. We believe in authenticity, creativity, and inclusivity and we strive to create content that empowers, educates, and entertains our readers.</p>
      <h2>Our Story</h2>
      <p>Silk Road Blogs started in 2024 when Kennedy Wanakacha decided to impact the journeys of beginners in the tech space. Since then, we have grown to a community of tech enthusiasts, students, and travel adventurers.</p>
      <h2>Meet Our Team</h2>
      <div className={styles['team-members']}>
        <figure>
          <img src="/" alt="Kennedy Wanakacha" />
          <figcaption>Kennedy Wanakacha - C.E.O</figcaption>
        </figure>
        <a href="https://ke.linkedin.com/in/rony-maruga-a7603b2a1">
          <figure>
            <img src="/" alt="Rony Maruga" />
            <figcaption>Rony Maruga - C.T.O</figcaption>
          </figure>
        </a>
        <figure>
          <img src="/" alt="David Ngugi" />
          <figcaption>David Ngugi</figcaption>
        </figure>
        <figure>
          <img src="/" alt="Erick Kimani" />
          <figcaption>Erick Kimani</figcaption>
        </figure>
        <figure>
          <img src="/" alt="Fredrick Mbai" />
          <figcaption>Fredrick Mbai</figcaption>
        </figure>
        <figure>
          <img src="/" alt="Mark Tiro" />
          <figcaption>Mark Tiro</figcaption>
        </figure>
      </div>
      <h2>Our Vision</h2>
      <p>We envision a world where everyone has access to reliable tech advice and technology empowers rather than complicates.</p>
      <h2>Get in Touch</h2>
      <p>We love hearing from our readers! Feel free to reach out to us at <a href="https://ke.linkedin.com/in/rony-maruga-a7603b2a1">Email Address</a></p>
      <h2>Testimonials</h2>
      <p>"I have learnt so much from Silk Road Blogs. The blogs are insightful and inspiring! - Antony Onyango"</p>
    </div>
  );
}
