const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, logout, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { loginValidator } = require('../validators/authValidators');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many login attempts, try again later' });
  }
});

router.post('/login', loginLimiter, loginValidator, login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

module.exports = router;
