import pool from "../config/db.js";

export const getAllProducts = async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT p.*, i.image_url
            FROM products p
            LEFT JOIN images i ON p.product_id = i.product_id
            GROUP BY p.product_id
            ORDER BY p.product_id ASC
        `);

        res.json(products);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getProductById = async (req, res) => {
    try {
        const id = req.params.id;

        const [rows] = await pool.query(`
            SELECT p.*, i.image_url
            FROM products p
            LEFT JOIN images i ON p.product_id = i.product_id
            WHERE p.product_id = ?
        `, [id]);

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
