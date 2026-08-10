const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const ordersRouter = require("./routes/orders");
const usersRouter = require("./routes/users");
const contactRouter = require("./routes/contact");
const authRouter = require("./routes/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/users", usersRouter);
app.use("/api/contact", contactRouter);

// Test route
app.get("/", (req, res) => {
  res.send("Grand Slam Gear API is running");
});



// Get all active products
app.get("/api/products", async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT
        id,
        name,
        description,
        category,
        price,
        stock_quantity,
        image_url
       FROM products
       WHERE is_active = TRUE
       ORDER BY category, name`
    );

    res.json(products);
  } catch (error) {
    console.error("Product query failed:", error);

    res.status(500).json({
      message: "Unable to load products."
    });
  }
});

// Get one active product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Invalid product ID."
      });
    }

    const [rows] = await db.query(
      `SELECT
        id,
        name,
        description,
        category,
        price,
        stock_quantity,
        image_url
       FROM products
       WHERE id = ? AND is_active = TRUE`,
      [productId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Product lookup failed:", error);

    res.status(500).json({
      message: "Unable to load the product."
    });
  }
});

// Handle unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API route not found."
  });
});

// General Express error handler
app.use((error, req, res, next) => {
  console.error("Unexpected server error:", error);

  res.status(500).json({
    message: "An unexpected server error occurred."
  });
});

const PORT = Number(process.env.PORT) || 5001;

async function startServer() {
  try {
    await db.query("SELECT 1");

    console.log("Connected to MySQL");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();