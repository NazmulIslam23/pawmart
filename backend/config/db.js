// backend/config/db.js
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const caCert = fs.readFileSync(path.join("config", "ca.pem"));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT), // important: convert to number
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { ca: caCert },
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
