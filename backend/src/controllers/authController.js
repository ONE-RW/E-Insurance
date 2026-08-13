const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const env = require('../config/env');
const { User, InsuranceCompany } = require('../models');
const { logActivity } = require('../middleware/activityLogger');

const COOKIE_NAME = 'eassurance_token';
const COOKIE_MAX_AGE = 8 * 60 * 60 * 1000; // 8 hours

function formatUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    insurance_company_id: user.insurance_company_id,
    insurance_company_name: user.insurance_company ? user.insurance_company.name : null,
    avatar_url: user.avatar_url ? `${env.publicUrl}${user.avatar_url}` : null
  };
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: COOKIE_MAX_AGE
  });
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;

    const user = await User.findOne({
      where: { email },
      include: [{ model: InsuranceCompany, as: 'insurance_company' }]
    });

    if (!user) {
      await logActivity({
        userId: null,
        role: null,
        action: 'login_failed',
        targetType: 'user',
        targetId: null,
        details: { email },
        ipAddress
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      await logActivity({
        userId: user.id,
        role: user.role,
        action: 'login_failed',
        targetType: 'user',
        targetId: user.id,
        details: { email },
        ipAddress
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      await logActivity({
        userId: user.id,
        role: user.role,
        action: 'login_failed',
        targetType: 'user',
        targetId: user.id,
        details: { email, reason: 'disabled' },
        ipAddress
      });
      return res.status(403).json({ error: 'Account is disabled' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, insurance_company_id: user.insurance_company_id },
      env.jwtSecret,
      { expiresIn: '8h' }
    );

    setAuthCookie(res, token);

    await logActivity({
      userId: user.id,
      role: user.role,
      action: 'login',
      targetType: 'user',
      targetId: user.id,
      details: { email },
      ipAddress
    });

    return res.status(200).json({ user: formatUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie(COOKIE_NAME);

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'logout',
      targetType: 'user',
      targetId: req.user.id,
      details: null,
      ipAddress: req.ip
    });

    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: InsuranceCompany, as: 'insurance_company' }]
    });
    return res.status(200).json({ user: formatUser(user) });
  } catch (err) {
    return next(err);
  }
}

module.exports = { login, logout, me };
