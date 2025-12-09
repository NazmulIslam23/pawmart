const pool = require("../config/db");

exports.getAllProducts = async (req, res) => {
  const categoryId = req.query.category_id;

  try {
    let query = `
      SELECT product_id, name, price, description, category_id
      FROM products
    `;
    const params = [];
    if (categoryId) {
      query += " WHERE category_id = ?";
      params.push(categoryId);
    }
    query += " ORDER BY product_id ASC";

    const [productsRows] = await pool.execute(query, params);

    const productIds = productsRows.map(p => p.product_id);
    let imagesMap = {};

    if (productIds.length) {
      const [imagesRows] = await pool.query(
        `SELECT product_id, image_url FROM images WHERE product_id IN (?)`,
        [productIds]
      );

      imagesRows.forEach(img => {
        if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
        // Prepend /Products/ to the image filename
        imagesMap[img.product_id].push(`${img.image_url}`);
      });
    }

    const products = productsRows.map(p => ({
      ...p,
      images: imagesMap[p.product_id] || [`https://purewave.onrender.com/default.jpg`]
    }));

    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};
