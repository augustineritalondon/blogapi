const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const { openDb } = require("./db")

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json())

const PORT = process.env.PORT || 4000

// initialize table


let db;
async function initializeDb() {
  try {
    db = await openDb();
    await db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        author TEXT,
        date TEXT
      )
    `);
    console.log("✅ Database and posts table ready");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
}

initializeDb();

// CREATE post
app.post("/posts", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const date = new Date().toISOString();
    const result = await db.run(
      "INSERT INTO posts (title, content, author, date) VALUES (?, ?, ?, ?)",
      [title, content, author, date]
    );
    res.json({ id: result.lastID, title, content, author, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await db.all("SELECT * FROM posts");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single post
app.get("/posts/:id", async (req, res) => {
  try {
    const post = await db.get("SELECT * FROM posts WHERE id = ?", [req.params.id]);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE post
app.put("/posts/:id", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    await db.run(
      "UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?",
      [title, content, author, req.params.id]
    );
    res.json({ message: "Post updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE post
app.delete("/posts/:id", async (req, res) => {
  try {
    await db.run("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on POST ${PORT}`))