const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  listVehicles, getVehicleByPlate, createVehicle, getVehicle, updateVehicle
} = require('../controllers/vehiclesController');
const {
  createVehicleValidator, updateVehicleValidator, idParamValidator, plateParamValidator
} = require('../validators/vehiclesValidators');

const router = express.Router();

router.use(requireAuth);

router.get('/', requireRole(['admin', 'insurer']), listVehicles);
router.get('/by-plate/:plate', requireRole(['admin', 'insurer']), plateParamValidator, getVehicleByPlate);
router.post('/', requireRole(['admin', 'insurer']), createVehicleValidator, createVehicle);
router.get('/:id', requireRole(['admin', 'insurer']), idParamValidator, getVehicle);
router.put('/:id', requireRole(['admin']), updateVehicleValidator, updateVehicle);

module.exports = router;
