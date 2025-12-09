const pool = require("../config/db"); // ensure this uses mysql2/promise
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ACCESS_SECRET = "purewave_access_secret";   // short-lived token
const REFRESH_SECRET = "purewave_refresh_secret"; // long-lived token

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, email: user.email },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, email: user.email },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// Signup
exports.signup = async (req, res) => {
  const { fullname, email, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES (?, ?, ?, ?)`,
      [fullname || "Unknown", email, phone, hashedPassword]
    );

    const user = { user_id: result.insertId, email };
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await pool.execute(
      "INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)",
      [user.user_id, refreshToken]
    );

    res.json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error("Signup error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email);

  try {
    const [rows] = await pool.execute(
      "SELECT user_id, name, email, phone, password_hash, created_at FROM users WHERE email = ?",
      [email]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    const safeName = user.name || "Unknown";

    // Insert login record
    await pool.execute(
      "INSERT INTO user_logins (user_id, user_name, ip_address, user_agent) VALUES (?, ?, ?, ?)",
      [user.user_id, safeName, req.ip, req.get("User-Agent")]
    );

    // Update last_login
    await pool.execute(
      "UPDATE users SET last_login = NOW() WHERE user_id = ?",
      [user.user_id]
    );

    const userData = { user_id: user.user_id, email: user.email };
    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    await pool.execute(
      "INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)",
      [user.user_id, refreshToken]
    );

    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        user_id: user.user_id,
        name: safeName,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ success: false, message: "Refresh token missing" });

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM refresh_tokens WHERE token = ?",
      [token]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(403).json({ success: false, message: "Invalid refresh token" });
    }

    jwt.verify(token, REFRESH_SECRET, (err, user) => {
      if (err) return res.status(403).json({ success: false, message: "Invalid refresh token" });

      const accessToken = generateAccessToken({ user_id: user.user_id, email: user.email });
      res.json({ success: true, accessToken });
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Logout
exports.logout = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: "Token missing" });

  try {
    await pool.execute("DELETE FROM refresh_tokens WHERE token = ?", [token]);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
