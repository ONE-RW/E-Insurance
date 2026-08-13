const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User, InsuranceCompany } = require('../models');

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies.eassurance_token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch (err) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findByPk(payload.id, {
      include: [{ model: InsuranceCompany, as: 'insurance_company' }]
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
