import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = rows[0];

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Send user info & token
        res.json({
            token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
