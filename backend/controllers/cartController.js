import pool from "../config/db.js";

export const addToCart = async (req, res) => {
    try {
        const { product_id, quantity, size } = req.body;
        const user_id = req.user.user_id;

        await pool.query(`
            INSERT INTO cart (user_id, product_id, quantity, size)
            VALUES (?, ?, ?, ?)
        `, [user_id, product_id, quantity, size]);

        res.json({ message: "Added to cart" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const getCart = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const [rows] = await pool.query(`
            SELECT c.*, p.name, p.price, i.image_url
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            LEFT JOIN images i ON c.product_id = i.product_id
            WHERE c.user_id = ?
        `, [user_id]);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
