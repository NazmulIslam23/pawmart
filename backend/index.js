require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("./config/db");

const app = express();

// ---------------- Middleware ----------------
app.use(cors({ origin: "*", credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/Products", express.static(path.join(__dirname, "../frontend/Products")));
app.use("/Thumbnails", express.static(path.join(__dirname, "../frontend/Thumbnails")));

// ---------------- Routes ----------------
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/cart", require("./routes/cart"));
app.use("/auth", require("./routes/auth"));
app.use("/api/db", require("./routes/db"));

// ---------------- Login ----------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [results] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (!results.length) return res.status(401).json({ message: "Invalid email or password" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// ---------------- Frontend Routes ----------------
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/index.html")));
app.get("/:page", (req, res) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, "../frontend", page), err => {
    if (err) res.status(404).send("Page not found");
  });
});

// ---------------- Error Handling ----------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
