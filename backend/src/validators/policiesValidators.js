const { body, param } = require('express-validator');
const validate = require('./validate');

const createPolicyValidator = [
  body('vehicle_id').isInt().withMessage('vehicle_id is required and must be an integer'),
  body('policy_number').notEmpty().withMessage('policy_number is required'),
  body('coverage_type').notEmpty().withMessage('coverage_type is required'),
  body('start_date').isISO8601().withMessage('start_date must be a valid date'),
  body('end_date').isISO8601().withMessage('end_date must be a valid date'),
  body('insurance_company_id').optional({ nullable: true }).isInt().withMessage('insurance_company_id must be an integer'),
  validate
];

const updatePolicyValidator = [
  param('id').isInt().withMessage('Invalid policy id'),
  body('policy_number').optional().notEmpty().withMessage('policy_number cannot be empty'),
  body('coverage_type').optional().notEmpty().withMessage('coverage_type cannot be empty'),
  body('start_date').optional().isISO8601().withMessage('start_date must be a valid date'),
  body('end_date').optional().isISO8601().withMessage('end_date must be a valid date'),
  validate
];

const idParamValidator = [
  param('id').isInt().withMessage('Invalid policy id'),
  validate
];

module.exports = {
  createPolicyValidator,
  updatePolicyValidator,
  idParamValidator
};
