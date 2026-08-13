const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { getDashboard } = require('../controllers/reportsController');

const router = express.Router();

router.get('/', requireAuth, requireRole(['admin']), getDashboard);
// Alias so /api/reports/dashboard also resolves to the same handler.
router.get('/dashboard', requireAuth, requireRole(['admin']), getDashboard);

module.exports = router;
