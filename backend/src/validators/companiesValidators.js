const { body, param } = require('express-validator');
const validate = require('./validate');

const createCompanyValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('tin_number').notEmpty().withMessage('TIN number is required'),
  body('address').optional({ nullable: true }).isString().withMessage('Address must be a string'),
  body('phone').optional({ nullable: true }).isString().withMessage('Phone must be a string'),
  body('email').optional({ nullable: true }).isEmail().withMessage('Email must be valid'),
  validate
];

const updateCompanyValidator = [
  param('id').isInt().withMessage('Invalid company id'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('tin_number').optional().notEmpty().withMessage('TIN number cannot be empty'),
  body('address').optional({ nullable: true }).isString().withMessage('Address must be a string'),
  body('phone').optional({ nullable: true }).isString().withMessage('Phone must be a string'),
  body('email').optional({ nullable: true }).isEmail().withMessage('Email must be valid'),
  validate
];

const statusValidator = [
  param('id').isInt().withMessage('Invalid company id'),
  body('status').isIn(['active', 'disabled']).withMessage('Status must be active or disabled'),
  validate
];

const idParamValidator = [
  param('id').isInt().withMessage('Invalid company id'),
  validate
];

module.exports = {
  createCompanyValidator,
  updateCompanyValidator,
  statusValidator,
  idParamValidator
};
