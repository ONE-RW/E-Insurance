const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  listPolicies, createPolicy, updatePolicy, cancelPolicy
} = require('../controllers/policiesController');
const {
  createPolicyValidator, updatePolicyValidator, idParamValidator
} = require('../validators/policiesValidators');

const router = express.Router();

// Policies are managed by insurers (their own company only) and admins.
// Officers are read-only and only interact with vehicle/policy data via /api/search.
router.use(requireAuth, requireRole(['admin', 'insurer']));

router.get('/', listPolicies);
router.post('/', createPolicyValidator, createPolicy);
router.put('/:id', updatePolicyValidator, updatePolicy);
router.patch('/:id/cancel', idParamValidator, cancelPolicy);

module.exports = router;
