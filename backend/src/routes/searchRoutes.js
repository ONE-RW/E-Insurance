const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { search } = require('../controllers/searchController');
const { searchValidator } = require('../validators/searchValidators');

const router = express.Router();

router.get('/', requireAuth, requireRole(['officer', 'admin']), searchValidator, search);

module.exports = router;
