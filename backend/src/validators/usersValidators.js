const { body, param } = require('express-validator');
const validate = require('./validate');

const createUserValidator = [
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'insurer', 'officer']).withMessage('Role must be admin, insurer, or officer'),
  body('insurance_company_id')
    .optional({ nullable: true })
    .isInt().withMessage('insurance_company_id must be an integer'),
  validate
];

const updateUserValidator = [
  param('id').isInt().withMessage('Invalid user id'),
  body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'insurer', 'officer']).withMessage('Role must be admin, insurer, or officer'),
  body('insurance_company_id')
    .optional({ nullable: true })
    .isInt().withMessage('insurance_company_id must be an integer'),
  validate
];

const statusValidator = [
  param('id').isInt().withMessage('Invalid user id'),
  body('status').isIn(['active', 'disabled']).withMessage('Status must be active or disabled'),
  validate
];

const passwordValidator = [
  param('id').isInt().withMessage('Invalid user id'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const updateMeValidator = [
  body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  validate
];

const changeMyPasswordValidator = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  statusValidator,
  passwordValidator,
  updateMeValidator,
  changeMyPasswordValidator
};
