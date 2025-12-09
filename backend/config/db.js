const mysql = require('mysql2/promise');
require('dotenv').config(); // load .env

// // ----------------- Localhost DB -----------------
// const localDB = mysql.createPool({
//   host: process.env.LOCAL_HOST || '127.0.0.1',
//   user: process.env.LOCAL_USER || 'root',
//   password: process.env.LOCAL_PASSWORD || '',
//   database: process.env.LOCAL_NAME || 'localdb',
//   port: process.env.LOCAL_PORT || 3306,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // ----------------- Railway DB -----------------
// const railwayDB = mysql.createPool({
//   host: process.env.RAILWAY_HOST,
//   user: process.env.RAILWAY_USER,
//   password: process.env.RAILWAY_PASSWORD,
//   database: process.env.RAILWAY_NAME,
//   port: process.env.RAILWAY_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// ----------------- Aiven DB -----------------
const fs = require('fs');
const path = require('path');

const aivenDB = mysql.createPool({
  host: process.env.AIVEN_HOST,
  user: process.env.AIVEN_USER,
  password: process.env.AIVEN_PASSWORD,
  database: process.env.AIVEN_NAME,
  port: process.env.AIVEN_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, 'ca.crt')) // path must match filename
  }
});

// ----------------- Test all connections -----------------
(async () => {
  // try {
  //   await localDB.getConnection();
  //   console.log("✅ Connected to Localhost MySQL");
  // } catch (err) {
  //   console.warn("⚠️ Localhost MySQL connection failed:", err.message);
  // }

  // try {
  //   await railwayDB.getConnection();
  //   console.log("✅ Connected to Railway MySQL");
  // } catch (err) {
  //   console.warn("⚠️ Railway MySQL connection failed:", err.message);
  // }

  try {
    await aivenDB.getConnection();
    console.log("✅ Connected to Aiven MySQL");
  } catch (err) {
    console.error("❌ Aiven MySQL connection failed:", err.message);
  }
})();

// ----------------- Export all pools -----------------
// module.exports = { localDB, railwayDB, aivenDB };
module.exports = aivenDB ;
