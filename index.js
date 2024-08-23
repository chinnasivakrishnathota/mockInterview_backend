require("dotenv").config();
const mysql = require("mysql");
const express = require("express");
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const student = require("./Routes/Student");
const mentor = require("./Routes/Mentor");
const mockInterviewRoutes = require('./Routes/mockInterviews');
require('./db');
const db = require('./db');

app.use("/api/student", student);
app.use("/api/mentor", mentor);
app.use('/api', mockInterviewRoutes);

// JWT Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Example usage of the middleware
app.get('/protected-route', authenticateToken, (req, res) => {
  res.send('This is a protected route');
});

app.listen(8080, () => {
  console.log("Server is running");
});
