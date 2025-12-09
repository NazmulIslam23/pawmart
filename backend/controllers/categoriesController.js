const pool = require("../config/db");

// ---------------- GET all categories ----------------
exports.getCategories = async (req, res) => {
  try {
    console.log("Fetching categories...");
    const [rows] = await pool.execute(`
      SELECT 
        c.category_id, 
        c.category_name, 
        c.thumbnail_url, 
        c.thumbnail_order,
        c.parent_id,
        p.category_name AS parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.category_id
      ORDER BY c.thumbnail_order ASC, c.category_id ASC
    `);
    console.log("Categories fetched:", rows.length);

    const formatted = rows.map(row => ({
      category_id: row.category_id,
      category_name: row.category_name,
      parent_id: row.parent_id,
      parent_name: row.parent_name,
      thumbnail_order: row.thumbnail_order,
      thumbnail: { url: row.thumbnail_url },
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching categories:", err); // <- this will show exact DB error
    res.status(500).json({ error: "Server error" });
  }
};

