const pool = require("../config/db");

// ---------------- GET Cart ----------------
exports.getCart = async (req, res) => {
  const userId = req.user?.user_id;
  const guestId = req.query.guest_id;

  if (!userId && !guestId)
    return res.status(400).json({ success: false, message: "Missing user or guest ID" });

  try {
    const [rows] = await pool.execute(
      `SELECT c.cart_id, c.quantity, c.size,
              p.product_id, p.name, p.price,
              COALESCE(i.image_url, 'Products/default.jpg') AS image
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       LEFT JOIN images i ON p.product_id = i.product_id
       WHERE ${userId ? "c.user_id = ?" : "c.guest_id = ?"}
       GROUP BY c.cart_id`,
      [userId || guestId]
    );
    res.json({ success: true, cart: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
};

// ---------------- ADD to Cart ----------------
exports.addToCart = async (req, res) => {
  const userId = req.user?.user_id;
  const guestId = req.body.guest_id;
  const { product_id, quantity, size = "" } = req.body;

  if (!product_id || !quantity)
    return res.status(400).json({ success: false, message: "Product and quantity required" });

  const qty = parseInt(quantity);
  if (isNaN(qty) || qty < 1)
    return res.status(400).json({ success: false, message: "Invalid quantity" });

  try {
    // Using INSERT ... ON DUPLICATE KEY UPDATE for atomic add
    await pool.execute(
      `INSERT INTO cart (user_id, guest_id, product_id, quantity, size, added_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userId || null, userId ? null : guestId, product_id, qty, size]
    );

    res.json({ success: true, message: "Product added to cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add to cart" });
  }
};

// ---------------- UPDATE Quantity ----------------
exports.updateCart = async (req, res) => {
  const { cartId } = req.params;
  const { quantity, guest_id } = req.body;
  const userId = req.user?.user_id;

  const qty = parseInt(quantity);
  if (isNaN(qty) || qty < 1)
    return res.status(400).json({ success: false, message: "Invalid quantity" });

  if (!userId && !guest_id)
    return res.status(400).json({ success: false, message: "Missing user or guest ID" });

  try {
    const [result] = await pool.execute(
      `UPDATE cart SET quantity=? WHERE cart_id=? AND ${userId ? "user_id=?" : "guest_id=?"}`,
      [qty, cartId, userId || guest_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Cart item not found" });

    res.json({ success: true, message: "Cart updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update cart" });
  }
};

// ---------------- DELETE Cart Item ----------------
exports.deleteCartItem = async (req, res) => {
  const { cartId } = req.params;
  const { guest_id } = req.body;
  const userId = req.user?.user_id;

  if (!userId && !guest_id)
    return res.status(400).json({ success: false, message: "Missing user or guest ID" });

  try {
    const [result] = await pool.execute(
      `DELETE FROM cart WHERE cart_id=? AND ${userId ? "user_id=?" : "guest_id=?"}`,
      [cartId, userId || guest_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Cart item not found" });

    res.json({ success: true, message: "Item removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to remove item" });
  }
};
