const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const bcrypt = require('bcrypt'); 

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'silkroad',
});

db.connect((err) => {
  if (err) {
    console.error('Failed to connect to the database: ' + err.message);
  } else {
    console.log('Connected to the database');
  }
});



app.post('/signup', async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  
  if (!fullName || !email || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
  }

  if (/^[0-9]+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
    return res.status(400).json({ success: false, message: 'Password must contain both letters and numbers' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  try {

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);


    const sql = 'INSERT INTO sign (fullName, email, password) VALUES (?, ?, ?)';
    db.query(sql, [fullName, email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
      }
      
      return res.status(200).json({ success: true, message: 'Registration successful' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    return res.status(500).json({ success: false, message: 'Registration failed due to server error' });
  }
});




app.post('/login', async (req, res) => {
  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM sign WHERE email = ?';
  db.query(sql, [email], async (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ success: false, message: 'Login failed' });
    }

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];

  
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

 
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
       
      }
    });
  });
});



app.post('/write', async (req, res) => {
  const { title, description, imageUrl, link, userId } = req.body; 
  if (!userId) {
    return res.status(403).json({ success: false, message: 'User not authenticated' });
  }

  if (!title || !description || !imageUrl || !link) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const sql = 'INSERT INTO posts (title, description, imageUrl, link, user_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [title, description, imageUrl, link, userId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Error saving post', error: err.message });
      }

      return res.status(200).json({ success: true, message: 'Post saved successfully' });
    });
  } catch (error) {
    console.error('Error saving post:', error);
    return res.status(500).json({ success: false, message: 'Failed to save post due to server error' });
  }
});




app.get('/posts', (req, res) => {

  const sql = `
    SELECT posts.*, sign.fullName 
    FROM posts 
    JOIN sign ON posts.user_id = sign.id`; 

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Error fetching posts', error: err.message });
    }

    return res.status(200).json({
      success: true,
      posts: results, 
    });
  });
});




app.get('/posts/:id', (req, res) => {
  const postId = req.params.id; 

  const sql = `
    SELECT posts.*, sign.fullName 
    FROM posts 
    JOIN sign ON posts.user_id = sign.id 
    WHERE posts.id = ?`; 

  db.query(sql, [postId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Error fetching post', error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    return res.status(200).json({
      success: true,
      post: results[0], 
    });
  });
});







app.listen(3002, () => {
  console.log('Listening on port 3002');
});

