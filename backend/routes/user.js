const express = require('express');
const { pool } = require('../config/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, email, business_name, pan, gst, mobile, industry_type, address_line, city, state, pin_code, user_type, created_at
       FROM users WHERE id = ?`,
      [req.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const u = rows[0];
    res.json({
      success: true,
      user: {
        id: u.id,
        email: u.email,
        businessName: u.business_name,
        pan: u.pan,
        gst: u.gst,
        mobile: u.mobile,
        industryType: u.industry_type,
        addressLine: u.address_line,
        city: u.city,
        state: u.state,
        pinCode: u.pin_code,
        userType: u.user_type,
        createdAt: u.created_at,
      },
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
