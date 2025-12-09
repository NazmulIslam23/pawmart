const express = require('express');
const router = express.Router();
const db = require('../config/db'); // promise-based pool
const bcrypt = require('bcrypt');

// Auto columns to skip in forms
const autoColumns = ['created_at','updated_at','added_at','last_login','login_count','current_stock','earned_at','redeemed_at','order_date','payment_date','activity_time','processed_at','requested_at','force_reset'];

// ==========================
// 🔹 Schema Endpoints
// ==========================

// Get all tables
router.get('/schema/tables', async (req, res) => {
  try {
    const [rows] = await db.query("SHOW TABLES");
    const tables = rows.map(row => Object.values(row)[0]);
    res.json({ success: true, tables });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get columns of a table
router.get('/schema/columns/:table', async (req, res) => {
  const table = req.params.table;
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM ??", [table]);
    res.json({ success: true, columns: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================
// 🔹 CRUD Endpoints
// ==========================

// GET all records
router.get('/:table', async (req, res) => {
  const table = req.params.table;
  try {
    const [rows] = await db.query("SELECT * FROM ??", [table]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new record
router.post('/:table', async (req, res) => {
  const table = req.params.table;
  const data = { ...req.body };

  try {
    // Hash password if needed
    if ((table === 'admin' || table === 'users') && data.password_hash) {
      data.password_hash = await bcrypt.hash(data.password_hash, 10);
      if (!data.force_reset) data.force_reset = 1;
    }

    const [result] = await db.query("INSERT INTO ?? SET ?", [table, data]);
    res.json({ success: true, message: 'Record added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update record
router.put('/:table/:id', async (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  const data = { ...req.body };

  try {
    // Find primary key
    const [pkRows] = await db.query("SHOW KEYS FROM ?? WHERE Key_name = 'PRIMARY'", [table]);
    if (!pkRows.length) return res.status(400).json({ success: false, message: 'Primary key not found' });
    const pk = pkRows[0].Column_name;

    // Hash password if updating
    if ((table === 'admin' || table === 'users') && data.password_hash) {
      data.password_hash = await bcrypt.hash(data.password_hash, 10);
    }

    await db.query("UPDATE ?? SET ? WHERE ?? = ?", [table, data, pk, id]);
    res.json({ success: true, message: 'Record updated' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE record
router.delete('/:table/:id', async (req, res) => {
  const table = req.params.table;
  const id = req.params.id;

  try {
    const [pkRows] = await db.query("SHOW KEYS FROM ?? WHERE Key_name = 'PRIMARY'", [table]);
    if (!pkRows.length) return res.status(400).json({ success: false, message: 'Primary key not found' });
    const pk = pkRows[0].Column_name;

    await db.query("DELETE FROM ?? WHERE ?? = ?", [table, pk, id]);
    res.json({ success: true, message: 'Record deleted' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
