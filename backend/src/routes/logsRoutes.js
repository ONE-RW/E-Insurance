const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { listLogs, listMyLogs } = require('../controllers/logsController');

const router = express.Router();

// Any authenticated user (not just admin) can see their own activity history.
router.get('/me', requireAuth, listMyLogs);
router.get('/', requireAuth, requireRole(['admin']), listLogs);

module.exports = router;
