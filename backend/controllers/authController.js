import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const [exists] = await pool.query(
            "SELECT * FROM users WHERE email = ?", [email]
        );

        if (exists.length > 0)
            return res.status(400).json({ message: "Email already in use" });

        const hash = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)",
            [name, email, hash, phone]
        );

        res.json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ?", [email]
        );

        if (rows.length === 0)
            return res.status(400).json({ message: "Invalid email" });

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match)
            return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign(
            { user_id: user.user_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY }
        );

        res.json({ token, user });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
