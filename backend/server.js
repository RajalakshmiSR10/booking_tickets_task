require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// ----------------- CONFIG -----------------
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Check if running on Render (for SSL)
const isProduction = process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// ----------------- DB HELPER -----------------
async function dbQuery(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

// ----------------- MIDDLEWARE -----------------
function authMiddleware(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    console.error("JWT Error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ----------------- ROUTES -----------------

// DB test route
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "DB connected", time: result.rows[0] });
  } catch (err) {
    console.error("DB Test Error:", err);
    res.status(500).json({ message: "DB connection failed", error: err.message });
  }
});

// Register
app.post("/api/register", async (req, res) => {
  console.log("Register endpoint hit");
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const exists = await dbQuery("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rowCount > 0) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await dbQuery(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id, name, email",
      [name, email, hashed]
    );

    res.status(201).json({ message: "User created", user: result.rows[0] });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  console.log("Login endpoint hit");
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const q = await dbQuery("SELECT id, name, password FROM users WHERE email=$1", [email]);
    if (q.rowCount === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = q.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, name: user.name });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Available tickets
app.get("/api/available", async (req, res) => {
  try {
    const result = await dbQuery("SELECT id, type, name, price, available_tickets FROM available_tickets ORDER BY id");
    const buses = result.rows.filter((r) => r.type === "bus");
    const movies = result.rows.filter((r) => r.type === "movie");

    res.json({
      buses: buses.map((b) => ({ name: b.name, available: b.available_tickets, price: b.price })),
      movies: movies.map((m) => ({ name: m.name, available: m.available_tickets, price: m.price })),
    });
  } catch (err) {
    console.error("Available Error:", err);
    res.status(500).json({ message: "Failed to fetch available tickets", error: err.message });
  }
});

// Book tickets
app.post("/api/bookings", authMiddleware, async (req, res) => {
  try {
    const { type, item_name, date, tickets } = req.body;
    if (!type || !item_name || !date || !ti_
