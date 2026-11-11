require("dotenv").config();
const db = require("./src/config/db");

async function testDB() {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ DB Error:", err.message);
  }
}

testDB();
