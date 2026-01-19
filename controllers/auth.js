const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const e = require('express');
const pool = require('../config/db').client;

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    console.log(email);
    const result = await pool.query('SELECT * FROM app_data.users WHERE email = $1', [email]);
    const user = result.rows[0];
    console.log(user);

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // 2. Compare incoming password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }


    // 3. Create JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role}, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log(token);

    // 4. Send token in an HttpOnly Cookie
    res.cookie('token', token, {
      httpOnly: true, // Prevents XSS (JavaScript cannot access this)
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'None'
    });
    console.log(res.cookie);
    res.json({ 
      message: "Login successful", 
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
    console.log(res.json);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await pool.query('SELECT * FROM app_data.users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert into database (Save the HASH, never the plain password)
    const newUser = await pool.query(
      'INSERT INTO app_data.users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    // 4. Create JWT Token
    const token = jwt.sign(
      { id: newUser.rows[0].id, email: newUser.rows[0].email}, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // 5. Send token in an HttpOnly Cookie
    res.cookie('token', token, {
      httpOnly: true, // Prevents XSS (JavaScript cannot access this)
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'None', 
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const logout = (req, res) => {
  res.clearCookie('token',
    {
      httpOnly: true, // Prevents XSS (JavaScript cannot access this)
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'None', // Protects against CSRF
    }
   );
  res.json({ message: "Logged out successfully" });
};

// controllers/authController.js

const getMe = async (req, res) => {
  try {
    // req.user was populated by your verifyToken middleware
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Send back safe user details (No passwords!)
    res.status(200).json({
      isAuthenticated: true,
      user: req.user
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login, signup, logout, getMe };