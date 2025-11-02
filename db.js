const { Pool } = require("pg")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Render
  },
});

async function initializeDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        author TEXT,
        date TIMESTAMP
      )
    `);
    console.log("✅ PostgreSQL database and posts table ready");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
  }
}

module.exports = { pool, initializeDb };