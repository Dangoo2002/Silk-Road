import Footer from '../components/footer/page';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import styles from './about.module.css';

export default function AboutUs() {
  return (<>
    <div className={styles['about-us-div']}>
      <h1 id={styles.welcomeheading}>Welcome to Silk Road Blogs</h1>
      <p>At Silk Road Blogs, we are passionate about discussions on diverse topics ranging from technology, politics, travel, and fitness.</p>
      <h2>Our Mission</h2>
      <p>Our mission is to provide insightful articles, inspire adventure and simplify tech for everyone. We believe in authenticity, creativity, and inclusivity and we strive to create content that empowers, educates, and entertains our readers.</p>
      <h2>Our Story</h2>
      <p>Silk Road Blogs started in 2024 when Kennedy Wanakacha decided to impact the journeys of beginners in the tech space. Since then, we have grown to a community of tech enthusiasts, students, and auto fanatics.</p>
      <h2>Meet Our Team</h2>
      <div className={styles['team-members']}>
      <a href="https://ke.linkedin.com/in/rony-maruga-a7603b2a1"> <figure> <img src="./images/NOPROFILE.jpg" alt="Kennedy Wanakacha" /> <figcaption> Kennedy Wanakacha <br/><FontAwesomeIcon icon={faLinkedin} className={styles.icon} /> </figcaption> </figure> </a>
      <a href="https://ke.linkedin.com/in/rony-maruga-a7603b2a1"> <figure> <img src="./images/RONBLOG.jpg" alt="Rony Maruga" /> <figcaption> Rony Maruga <br/><FontAwesomeIcon icon={faLinkedin} className={styles.icon} /> </figcaption> </figure> </a>
      <a href="https://ke.linkedin.com/in/rony-maruga-a7603b2a1"> <figure> <img src="./images/NOPROFILE.jpg" alt="David Ngugi" /> <figcaption> David Ngugi <br/> <FontAwesomeIcon icon={faLinkedin} className={styles.icon} /> </figcaption> </figure> </a>
      <a href="https://ke.linkedin.com/in/rony-maruga-a7603b2a1"> <figure> <img src="./images/NOPROFILE.jpg" alt="Marc Tiro" /> <figcaption> Marc Tiro <br/> <FontAwesomeIcon icon={faLinkedin} className={styles.icon} /> </figcaption> </figure> </a>
      <a href="https://ke.linkedin.com/in/rony-maruga-a7603b2a1"> <figure> <img src="./images/NOPROFILE.jpg" alt="Fredrick Mbai" /> <figcaption> Fredrick Mbai <br/> <FontAwesomeIcon icon={faLinkedin} className={styles.icon} /> </figcaption> </figure> </a>
      <a href="https://ke.linkedin.com/in/rony-maruga-a7603b2a1"> <figure> <img src="./images/NOPROFILE.jpg" alt="Erick Kimani" /> <figcaption> Erick Kimani <br/> <FontAwesomeIcon icon={faLinkedin} className={styles.icon} /> </figcaption> </figure> </a>
      </div>
      <h2>Our Vision</h2>
      <p>We envision a world where everyone has access to reliable tech advice and technology empowers rather than complicates.</p>
      <h2>Get in Touch</h2>
      <p>We love hearing from our readers!<br/> Feel free to reach out to us at <a href="https://ke.linkedin.com/in/rony-maruga-a7603b2a1">Email Address</a></p>
      <h2>Testimonials</h2>
      <p>"I have learnt so much from Silk Road Blogs. The blogs are insightful and inspiring!"<br/> Antony Onyango</p>
    </div></>
  );
}
