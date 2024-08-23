const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// POST /api/mentor/add
router.post('/add', async (req, res) => {
  const { Name, Email, Password, Roles } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    const query = `INSERT INTO mentor (name, email, password, roles) VALUES (?, ?, ?, ?)`;

    const rolesString = Roles.join(',');

    db.query(query, [Name, Email, hashedPassword, rolesString], (err, result) => {
      if (err) {
        console.error("Failed to insert mentor:", err);
        return res.status(500).json({ message: "Registration failed" });
      }
      return res.status(201).json({ message: "Mentor added successfully" });
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
});

router.post('/login', async (req, res) => {
  const { Email, Password } = req.body;

  try {
    const query = `SELECT * FROM mentor WHERE email = ?`;
    db.query(query, [Email], async (err, result) => {
      if (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ message: "Login failed" });
      }

      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const mentor = result[0];
      const isMatch = await bcrypt.compare(Password, mentor.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT Token
      const token = jwt.sign({ email: mentor.email }, JWT_SECRET, { expiresIn: '1h' });

      // If login is successful
      return res.status(200).json({ message: "Login successful", mentor, token });
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Login failed" });
  }
});



router.get('/', (req, res) => {
  const query = 'SELECT Name, email FROM mentor';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching mentors:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json(results);
  });
});

router.get('/average-scores', (req, res) => {
  const query = `
    SELECT
      m.Name AS mentor_name,
      AVG(mi.mentor_score) AS average_score
    FROM
      mentor m
    LEFT JOIN
      mock_interviews mi ON m.email = mi.mentor_email
    GROUP BY
      m.Name
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log(results)
    res.json(results);
  });
});

module.exports = router;
