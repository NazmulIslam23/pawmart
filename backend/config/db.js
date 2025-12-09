import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const caCert = fs.readFileSync(path.join("config", "ca.pem"));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        ca: caCert
    },
    waitForConnections: true,
    connectionLimit: 10,
});

export default pool;
