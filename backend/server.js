const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer'); 


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
    const connection = await pool.getConnection();
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const sql = 'INSERT INTO sign (fullName, email, password) VALUES (?, ?, ?)';
      await connection.query(sql, [fullName, email, hashedPassword]);
      connection.release();
      return res.json({ success: true, message: 'Registration successful' });
    } catch (err) {
      connection.release();
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
    }
  } catch (error) {
    console.error('Connection error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Registration failed due to database connection error',
      error: error.message,
      code: error.code
    });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
      const connection = await pool.getConnection();
      try {
        const sql = 'SELECT * FROM sign WHERE email = ?';
        const [rows] = await connection.query(sql, [email]);

        if (rows.length === 0) {
          return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const user = rows[0];

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Here you might want to send a success response
        return res.json({ success: true, message: 'Login successful' });

      } catch (err) {
        console.error('Database error: ' + err.message);
        return res.status(500).json({ success: false, message: 'Login failed' });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error: ' + error.message);
      return res.status(500).json({ success: false, message: 'Login failed' });
    }
});

app.listen(3002, () => {
    console.log('Listening on port 3002');
  });