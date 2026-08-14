const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { listMySessions, revokeMySession } = require('../controllers/sessionsController');

const router = express.Router();

// Self-service routes: any authenticated user manages their own sessions only.
router.get('/me', requireAuth, listMySessions);
router.delete('/me/:id', requireAuth, revokeMySession);

module.exports = router;
