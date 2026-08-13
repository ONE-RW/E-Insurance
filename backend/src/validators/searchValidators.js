const { query } = require('express-validator');
const validate = require('./validate');

const searchValidator = [
  query('plate').optional().isString(),
  query('tin').optional().isString(),
  (req, res, next) => {
    const { plate, tin } = req.query;
    if ((!plate && !tin) || (plate && tin)) {
      return res.status(400).json({ error: 'Provide exactly one of plate or tin' });
    }
    return next();
  },
  validate
];

module.exports = { searchValidator };
