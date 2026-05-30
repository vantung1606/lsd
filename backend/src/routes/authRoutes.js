const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDatabase } = require("../config/db");

const router = express.Router();

router.post("/register", async (request, response) => {
  try {
    const { username, password } = request.body;

    if (!username || !password) {
      return response.status(400).json({ message: "Username and password are required." });
    }

    const database = getDatabase();
    const cleanUsername = username.trim();
    const [existingUsers] = await database.query(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [cleanUsername]
    );

    if (existingUsers.length > 0) {
      return response.status(409).json({ message: "Username already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await database.query(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [cleanUsername, passwordHash]
    );

    return response.status(201).json({
      message: "Register success.",
      user: {
        id: result.insertId,
        username: cleanUsername
      }
    });
  } catch (error) {
    return response.status(500).json({ message: "Register failed.", error: error.message });
  }
});

router.post("/login", async (request, response) => {
  try {
    const { username, password } = request.body;

    if (!username || !password) {
      return response.status(400).json({ message: "Username and password are required." });
    }

    const database = getDatabase();
    const cleanUsername = username.trim();
    const [users] = await database.query(
      "SELECT * FROM users WHERE username = ? LIMIT 1",
      [cleanUsername]
    );

    if (users.length === 0) {
      return response.status(401).json({ message: "Invalid username or password." });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return response.status(401).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return response.status(200).json({
      message: "Login success.",
      token,
      user: {
        id: user.id,
        username: user.username,
        totalScore: user.total_score,
        totalCorrectAnswers: user.total_correct_answers,
        totalAttempts: user.total_attempts
      }
    });
  } catch (error) {
    return response.status(500).json({ message: "Login failed.", error: error.message });
  }
});

module.exports = router;
