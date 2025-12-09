import pool from "../config/db.js";

export const getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM categories ORDER BY category_id ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

