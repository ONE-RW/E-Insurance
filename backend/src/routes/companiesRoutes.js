const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  listCompanies, createCompany, getCompany, updateCompany, updateCompanyStatus
} = require('../controllers/companiesController');
const {
  createCompanyValidator, updateCompanyValidator, statusValidator, idParamValidator
} = require('../validators/companiesValidators');

const router = express.Router();

router.use(requireAuth, requireRole(['admin']));

router.get('/', listCompanies);
router.post('/', createCompanyValidator, createCompany);
router.get('/:id', idParamValidator, getCompany);
router.put('/:id', updateCompanyValidator, updateCompany);
router.patch('/:id/status', statusValidator, updateCompanyStatus);

module.exports = router;
