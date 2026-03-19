require('dotenv').config();
const express = require('express');
const path = require('path');
const { pool } = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'MSME Helpline API' });
});


const projectRoot = path.join(__dirname, '..');
app.use(express.static(projectRoot));


app.get('*', (req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(projectRoot, 'index.html'), (err) => {
      if (err) next(err);
    });
  } else {
    next();
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') console.error(err);
  else console.error(err.message);
  res.status(500).json({ success: false, message: 'Server error' });
});

async function start() {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`MSME Helpline API running on port ${PORT}`);
  });
}
start();
