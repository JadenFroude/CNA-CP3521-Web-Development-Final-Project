const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = Number(req.user.userId);

    const [rows] = await db.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        province,
        postal_code
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User account not found."
      });
    }

    const user = rows[0];

    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      province: user.province || "",
      postalCode: user.postal_code || ""
    });
  } catch (error) {
    console.error("Profile lookup failed:", error);

    res.status(500).json({
      message: "Unable to load account information."
    });
  }
});

router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = Number(req.user.userId);

    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      province,
      postalCode
    } = req.body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({
        message: "First name and last name are required."
      });
    }

    await db.query(
      `UPDATE users
       SET
        first_name = ?,
        last_name = ?,
        phone = ?,
        address = ?,
        city = ?,
        province = ?,
        postal_code = ?
       WHERE id = ?`,
      [
        firstName.trim(),
        lastName.trim(),
        phone?.trim() || null,
        address?.trim() || null,
        city?.trim() || null,
        province?.trim() || null,
        postalCode?.trim() || null,
        userId
      ]
    );

    res.json({
      message: "Account updated successfully.",
      user: {
        id: userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: req.user.email,
        phone: phone?.trim() || "",
        address: address?.trim() || "",
        city: city?.trim() || "",
        province: province?.trim() || "",
        postalCode: postalCode?.trim() || ""
      }
    });
  } catch (error) {
    console.error("Profile update failed:", error);

    res.status(500).json({
      message: "Unable to update account information."
    });
  }
});

module.exports = router;