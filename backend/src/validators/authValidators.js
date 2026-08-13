const { body } = require('express-validator');
const validate = require('./validate');

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

module.exports = { loginValidator };
