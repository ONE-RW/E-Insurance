const { body, param } = require('express-validator');
const validate = require('./validate');

const createVehicleValidator = [
  body('plate_number').notEmpty().withMessage('Plate number is required'),
  body('chassis_number').optional({ nullable: true }).isString(),
  body('make').optional({ nullable: true }).isString(),
  body('model').optional({ nullable: true }).isString(),
  body('year').optional({ nullable: true }).isInt().withMessage('Year must be an integer'),
  body('owner_name').optional({ nullable: true }).isString(),
  body('owner_tin').optional({ nullable: true }).isString(),
  body('owner_national_id').optional({ nullable: true }).isString(),
  validate
];

const updateVehicleValidator = [
  param('id').isInt().withMessage('Invalid vehicle id'),
  body('plate_number').optional().notEmpty().withMessage('Plate number cannot be empty'),
  body('year').optional({ nullable: true }).isInt().withMessage('Year must be an integer'),
  validate
];

const idParamValidator = [
  param('id').isInt().withMessage('Invalid vehicle id'),
  validate
];

const plateParamValidator = [
  param('plate').notEmpty().withMessage('Plate is required'),
  validate
];

module.exports = {
  createVehicleValidator,
  updateVehicleValidator,
  idParamValidator,
  plateParamValidator
};
