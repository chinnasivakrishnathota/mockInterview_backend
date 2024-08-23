const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// POST /api/student/add
router.post('/add', async (req, res) => {
  const { Name, Email, Password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    const query = `INSERT INTO student (name, email, password) VALUES (?, ?, ?)`;

    db.query(query, [Name, Email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Failed to insert student:", err);
        return res.status(500).json({ message: "Registration failed" });
      }
      return res.status(201).json({ message: "Student added successfully" });
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
});

router.post('/login', async (req, res) => {
  const { Email, Password } = req.body;

  try {
    const query = `SELECT * FROM student WHERE email = ?`;
    db.query(query, [Email], async (err, result) => {
      if (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ message: "Login failed" });
      }

      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const student = result[0];
      const isMatch = await bcrypt.compare(Password, student.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT Token
      const token = jwt.sign({ email: student.email }, JWT_SECRET, { expiresIn: '1h' });

      // If login is successful
      return res.status(200).json({ message: "Login successful", student, token });
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Login failed" });
  }
});




router.post('/update-premium', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const query = 'UPDATE student SET ispremium = 1 WHERE email = ?';
  
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Error updating premium status:', err);
      return res.status(500).json({ error: 'Failed to update premium status' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Premium status updated successfully' });
  });
});

router.get('/:email', (req, res) => {
  const email = req.params.email;
  const query = 'SELECT * FROM student WHERE email = ?';
  
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching student:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  });
});
module.exports = router;
