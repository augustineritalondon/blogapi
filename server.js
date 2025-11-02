const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const { pool, initializeDb } = require("./db")

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json())

const PORT = process.env.PORT || 4000


initializeDb();

app.get("/", (req, res) => {
  res.send("🎉 Blog API is running! Use /posts to get data.");
});

// CREATE
app.post("/posts", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const date = new Date();
    const result = await pool.query(
      "INSERT INTO posts (title, content, author, date) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, author, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ one
app.get("/posts/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id=$1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Post not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put("/posts/:id", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    await pool.query(
      "UPDATE posts SET title=$1, content=$2, author=$3 WHERE id=$4",
      [title, content, author, req.params.id]
    );
    res.json({ message: "Post updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete("/posts/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM posts WHERE id=$1", [req.params.id]);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on POST ${PORT}`))