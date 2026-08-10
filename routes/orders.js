const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    userId,
    shippingAddress,
    shippingCity,
    shippingProvince,
    shippingPostalCode,
    items
  } = req.body;

  if (
    !Number.isInteger(Number(userId)) ||
    !shippingAddress?.trim() ||
    !shippingCity?.trim() ||
    !shippingProvince?.trim() ||
    !shippingPostalCode?.trim() ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      message: "Missing or invalid checkout information."
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let totalAmount = 0;
    const verifiedItems = [];

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error("Invalid cart item.");
      }

      const [productRows] = await connection.query(
        `SELECT
          id,
          name,
          price,
          stock_quantity
         FROM products
         WHERE id = ? AND is_active = TRUE
         FOR UPDATE`,
        [productId]
      );

      if (productRows.length === 0) {
        throw new Error("A product in your cart is unavailable.");
      }

      const product = productRows[0];

      if (quantity > Number(product.stock_quantity)) {
        throw new Error(
          `${product.name} does not have enough inventory.`
        );
      }

      const price = Number(product.price);

      totalAmount += price * quantity;

      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        quantity,
        price
      });
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        user_id,
        total_amount,
        status,
        shipping_address,
        shipping_city,
        shipping_province,
        shipping_postal_code
      )
      VALUES (?, ?, 'Submitted', ?, ?, ?, ?)`,
      [
        Number(userId),
        totalAmount,
        shippingAddress.trim(),
        shippingCity.trim(),
        shippingProvince.trim(),
        shippingPostalCode.trim()
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of verifiedItems) {
      await connection.query(
        `INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          quantity,
          price_at_purchase
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.productName,
          item.quantity,
          item.price
        ]
      );

      await connection.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - ?
         WHERE id = ?`,
        [item.quantity, item.productId]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "Order submitted successfully.",
      orderId,
      totalAmount: totalAmount.toFixed(2)
    });
  } catch (error) {
    await connection.rollback();

    console.error("Order submission failed:", error);

    res.status(400).json({
      message: error.message || "Unable to submit the order."
    });
  } finally {
    connection.release();
  }
});

router.get("/history", authenticateToken, async (req, res) => {
  try {
    const userId = Number(req.user.userId);

    const [orders] = await db.query(
      `SELECT
        id,
        total_amount,
        status,
        shipping_address,
        shipping_city,
        shipping_province,
        shipping_postal_code,
        created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    for (const order of orders) {
      const [items] = await db.query(
        `SELECT
          product_name,
          quantity,
          price_at_purchase
         FROM order_items
         WHERE order_id = ?
         ORDER BY id`,
        [order.id]
      );

      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error("Purchase history failed:", error);

    res.status(500).json({
      message: "Unable to load purchase history."
    });
  }
});

module.exports = router;