const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const PAN_REGEX = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/;
const MOBILE_REGEX = /^[6-9][0-9]{9}$/;
const PIN_REGEX = /^[0-9]{6}$/;

function validatePan(value) {
  return PAN_REGEX.test(String(value).trim().toUpperCase());
}
function validateMobile(value) {
  return MOBILE_REGEX.test(String(value).replace(/\D/g, ''));
}
function validatePin(value) {
  return PIN_REGEX.test(String(value).trim());
}

router.post('/register', async (req, res) => {
  try {
    const {
      userType,
      businessName,
      pan,
      gst,
      mobile,
      email,
      password,
      industryType,
      addressLine,
      city,
      state,
      pinCode,
      termsAccepted,
    } = req.body;

    const errors = [];
    if (!businessName || !String(businessName).trim()) errors.push('Business name is required.');
    if (!pan || !validatePan(pan)) errors.push('Valid PAN is required (e.g. AAAPD5055K).');
    if (!mobile || !validateMobile(mobile)) errors.push('Valid 10-digit Indian mobile number is required.');
    if (!email || !String(email).trim()) errors.push('Email is required.');
    const emailStr = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) errors.push('Valid email format is required.');
    if (!password || String(password).length < 6) errors.push('Password must be at least 6 characters.');
    if (!industryType || !String(industryType).trim()) errors.push('Industry type is required.');
    if (!addressLine || !String(addressLine).trim()) errors.push('Address line is required.');
    if (!city || !String(city).trim()) errors.push('City is required.');
    if (!state || !String(state).trim()) errors.push('State is required.');
    if (!pinCode || !validatePin(pinCode)) errors.push('Valid 6-digit PIN code is required.');
    if (!termsAccepted) errors.push('You must accept the terms and privacy policy.');

    const userTypeVal = ['msme', 'buyer', 'supplier', 'corporate'].includes(String(userType)) ? userType : 'msme';

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [emailStr]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const panUpper = String(pan).trim().toUpperCase();
    const gstVal = gst ? String(gst).trim() : null;

    await pool.query(
      `INSERT INTO users (
        user_type, business_name, pan, gst, mobile, email, password_hash,
        industry_type, address_line, city, state, pin_code, terms_accepted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        userTypeVal,
        String(businessName).trim(),
        panUpper,
        gstVal,
        String(mobile).replace(/\D/g, '').slice(-10),
        emailStr,
        passwordHash,
        String(industryType).trim(),
        String(addressLine).trim(),
        String(city).trim(),
        String(state).trim(),
        String(pinCode).trim(),
      ]
    );

    const [rows] = await pool.query('SELECT id, email, business_name FROM users WHERE email = ?', [emailStr]);
    const user = rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        businessName: user.business_name,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const emailStr = String(email).trim().toLowerCase();
    const [rows] = await pool.query(
      'SELECT id, email, password_hash, business_name, pan, gst, mobile, industry_type, address_line, city, state, pin_code, user_type, created_at FROM users WHERE email = ?',
      [emailStr]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(String(password), user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        businessName: user.business_name,
        pan: user.pan,
        gst: user.gst,
        mobile: user.mobile,
        industryType: user.industry_type,
        addressLine: user.address_line,
        city: user.city,
        state: user.state,
        pinCode: user.pin_code,
        userType: user.user_type,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
