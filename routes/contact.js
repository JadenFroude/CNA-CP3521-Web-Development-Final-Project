const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        message: "All contact fields are required."
      });
    }

    const [result] = await db.query(
      `INSERT INTO contact_messages (
        name,
        email,
        subject,
        message
      )
      VALUES (?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        subject.trim(),
        message.trim()
      ]
    );

    res.status(201).json({
      message: "Your message was sent successfully.",
      messageId: result.insertId
    });
  } catch (error) {
    console.error("Contact submission failed:", error);

    res.status(500).json({
      message: "Unable to send your message."
    });
  }
});

module.exports = router;