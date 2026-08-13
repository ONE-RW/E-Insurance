const { InsuranceCompany } = require('../models');
const { logActivity } = require('../middleware/activityLogger');

function formatCompany(company) {
  return {
    id: company.id,
    name: company.name,
    tin_number: company.tin_number,
    address: company.address,
    phone: company.phone,
    email: company.email,
    status: company.status,
    created_at: company.createdAt
  };
}

async function listCompanies(req, res, next) {
  try {
    const companies = await InsuranceCompany.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).json({ companies: companies.map(formatCompany) });
  } catch (err) {
    return next(err);
  }
}

async function createCompany(req, res, next) {
  try {
    const { name, tin_number, address, phone, email } = req.body;

    const existing = await InsuranceCompany.findOne({ where: { tin_number } });
    if (existing) {
      return res.status(409).json({ error: 'A company with this TIN number already exists' });
    }

    const company = await InsuranceCompany.create({ name, tin_number, address, phone, email });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'create_company',
      targetType: 'insurance_company',
      targetId: company.id,
      details: { name, tin_number },
      ipAddress: req.ip
    });

    return res.status(201).json({ company: formatCompany(company) });
  } catch (err) {
    return next(err);
  }
}

async function getCompany(req, res, next) {
  try {
    const company = await InsuranceCompany.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    return res.status(200).json({ company: formatCompany(company) });
  } catch (err) {
    return next(err);
  }
}

async function updateCompany(req, res, next) {
  try {
    const company = await InsuranceCompany.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const { name, tin_number, address, phone, email } = req.body;

    if (tin_number && tin_number !== company.tin_number) {
      const existing = await InsuranceCompany.findOne({ where: { tin_number } });
      if (existing) {
        return res.status(409).json({ error: 'A company with this TIN number already exists' });
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (tin_number !== undefined) updates.tin_number = tin_number;
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;

    await company.update(updates);

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'update_company',
      targetType: 'insurance_company',
      targetId: company.id,
      details: updates,
      ipAddress: req.ip
    });

    return res.status(200).json({ company: formatCompany(company) });
  } catch (err) {
    return next(err);
  }
}

async function updateCompanyStatus(req, res, next) {
  try {
    const company = await InsuranceCompany.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const { status } = req.body;
    await company.update({ status });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'update_company',
      targetType: 'insurance_company',
      targetId: company.id,
      details: { status },
      ipAddress: req.ip
    });

    return res.status(200).json({ company: formatCompany(company) });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listCompanies,
  createCompany,
  getCompany,
  updateCompany,
  updateCompanyStatus
};
