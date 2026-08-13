const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const { User, InsuranceCompany } = require('../models');
const { logActivity } = require('../middleware/activityLogger');

const SALT_ROUNDS = 10;

function formatUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    insurance_company_id: user.insurance_company_id,
    insurance_company_name: user.insurance_company ? user.insurance_company.name : null,
    status: user.status,
    created_at: user.createdAt,
    avatar_url: user.avatar_url ? `${env.publicUrl}${user.avatar_url}` : null
  };
}

async function listUsers(req, res, next) {
  try {
    const where = {};
    if (req.query.role) where.role = req.query.role;
    if (req.query.insurance_company_id) where.insurance_company_id = req.query.insurance_company_id;

    const users = await User.findAll({
      where,
      include: [{ model: InsuranceCompany, as: 'insurance_company' }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ users: users.map(formatUser) });
  } catch (err) {
    return next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { full_name, email, password, role } = req.body;
    let { insurance_company_id } = req.body;

    if (role === 'insurer') {
      if (!insurance_company_id) {
        return res.status(400).json({ error: 'insurance_company_id is required for insurer role' });
      }
      const company = await InsuranceCompany.findByPk(insurance_company_id);
      if (!company) {
        return res.status(400).json({ error: 'insurance_company_id does not exist' });
      }
    } else {
      if (insurance_company_id) {
        return res.status(400).json({ error: 'insurance_company_id must not be set unless role is insurer' });
      }
      insurance_company_id = null;
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      full_name,
      email,
      password_hash,
      role,
      insurance_company_id
    });

    const created = await User.findByPk(user.id, {
      include: [{ model: InsuranceCompany, as: 'insurance_company' }]
    });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'create_user',
      targetType: 'user',
      targetId: user.id,
      details: { email, role },
      ipAddress: req.ip
    });

    return res.status(201).json({ user: formatUser(created) });
  } catch (err) {
    return next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { full_name, email, role, insurance_company_id } = req.body;
    const updates = {};

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'A user with this email already exists' });
      }
      updates.email = email;
    }

    if (full_name !== undefined) updates.full_name = full_name;
    if (role !== undefined) updates.role = role;

    const nextRole = role !== undefined ? role : user.role;
    const nextCompanyId = insurance_company_id !== undefined ? insurance_company_id : user.insurance_company_id;

    if (nextRole === 'insurer') {
      if (!nextCompanyId) {
        return res.status(400).json({ error: 'insurance_company_id is required for insurer role' });
      }
      const company = await InsuranceCompany.findByPk(nextCompanyId);
      if (!company) {
        return res.status(400).json({ error: 'insurance_company_id does not exist' });
      }
      updates.insurance_company_id = nextCompanyId;
    } else {
      updates.insurance_company_id = null;
    }

    await user.update(updates);

    const updated = await User.findByPk(user.id, {
      include: [{ model: InsuranceCompany, as: 'insurance_company' }]
    });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'update_user',
      targetType: 'user',
      targetId: user.id,
      details: updates,
      ipAddress: req.ip
    });

    return res.status(200).json({ user: formatUser(updated) });
  } catch (err) {
    return next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { status } = req.body;
    await user.update({ status });

    const updated = await User.findByPk(user.id, {
      include: [{ model: InsuranceCompany, as: 'insurance_company' }]
    });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'disable_user',
      targetType: 'user',
      targetId: user.id,
      details: { status },
      ipAddress: req.ip
    });

    return res.status(200).json({ user: formatUser(updated) });
  } catch (err) {
    return next(err);
  }
}

async function updateUserPassword(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password } = req.body;
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    await user.update({ password_hash });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'update_user',
      targetType: 'user',
      targetId: user.id,
      details: { password_changed: true },
      ipAddress: req.ip
    });

    return res.status(200).json({ message: 'Password updated' });
  } catch (err) {
    return next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { full_name, email } = req.body;
    const updates = {};

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      updates.email = email;
    }

    if (full_name !== undefined) updates.full_name = full_name;

    await user.update(updates);

    const updated = await User.findByPk(user.id, {
      include: [{ model: InsuranceCompany, as: 'insurance_company' }]
    });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'update_profile',
      targetType: 'user',
      targetId: req.user.id,
      details: updates,
      ipAddress: req.ip
    });

    return res.status(200).json({ user: formatUser(updated) });
  } catch (err) {
    return next(err);
  }
}

async function updateMyPassword(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { current_password, new_password } = req.body;

    const passwordMatches = await bcrypt.compare(current_password, user.password_hash);
    if (!passwordMatches) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
    await user.update({ password_hash });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'change_password',
      targetType: 'user',
      targetId: req.user.id,
      details: {},
      ipAddress: req.ip
    });

    return res.status(200).json({ message: 'Password updated' });
  } catch (err) {
    return next(err);
  }
}

async function updateMyAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.avatar_url) {
      const oldPath = path.resolve(__dirname, '../../', user.avatar_url.replace(/^\//, ''));
      fs.unlink(oldPath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Failed to delete old avatar:', err.message);
        }
      });
    }

    const avatar_url = `/uploads/avatars/${req.file.filename}`;
    await user.update({ avatar_url });

    const updated = await User.findByPk(user.id, {
      include: [{ model: InsuranceCompany, as: 'insurance_company' }]
    });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'update_avatar',
      targetType: 'user',
      targetId: req.user.id,
      details: {},
      ipAddress: req.ip
    });

    return res.status(200).json({ user: formatUser(updated) });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserPassword,
  updateMe,
  updateMyPassword,
  updateMyAvatar
};
