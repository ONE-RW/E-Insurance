const { Policy, Vehicle, InsuranceCompany } = require('../models');
const { logActivity } = require('../middleware/activityLogger');

const includeOpts = [
  { model: Vehicle, as: 'vehicle' },
  { model: InsuranceCompany, as: 'insurance_company' }
];

function formatPolicy(policy) {
  return {
    id: policy.id,
    vehicle: policy.vehicle ? {
      id: policy.vehicle.id,
      plate_number: policy.vehicle.plate_number,
      make: policy.vehicle.make,
      model: policy.vehicle.model,
      owner_name: policy.vehicle.owner_name
    } : null,
    insurance_company: policy.insurance_company ? {
      id: policy.insurance_company.id,
      name: policy.insurance_company.name
    } : null,
    policy_number: policy.policy_number,
    coverage_type: policy.coverage_type,
    start_date: policy.start_date,
    end_date: policy.end_date,
    status: policy.status,
    created_at: policy.createdAt
  };
}

async function listPolicies(req, res, next) {
  try {
    const where = {};
    if (req.query.vehicle_id) where.vehicle_id = req.query.vehicle_id;

    if (req.user.role === 'insurer') {
      where.insurance_company_id = req.user.insurance_company_id;
    } else if (req.query.insurance_company_id) {
      where.insurance_company_id = req.query.insurance_company_id;
    }

    const policies = await Policy.findAll({
      where,
      include: includeOpts,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ policies: policies.map(formatPolicy) });
  } catch (err) {
    return next(err);
  }
}

async function createPolicy(req, res, next) {
  try {
    const {
      vehicle_id, policy_number, coverage_type, start_date, end_date
    } = req.body;

    let insurance_company_id;

    if (req.user.role === 'insurer') {
      insurance_company_id = req.user.insurance_company_id;
    } else {
      insurance_company_id = req.body.insurance_company_id;
      if (!insurance_company_id) {
        return res.status(400).json({ error: 'insurance_company_id is required' });
      }
      const company = await InsuranceCompany.findByPk(insurance_company_id);
      if (!company) {
        return res.status(400).json({ error: 'insurance_company_id does not exist' });
      }
    }

    const vehicle = await Vehicle.findByPk(vehicle_id);
    if (!vehicle) {
      return res.status(400).json({ error: 'vehicle_id does not exist' });
    }

    const existing = await Policy.findOne({ where: { policy_number } });
    if (existing) {
      return res.status(409).json({ error: 'A policy with this policy number already exists' });
    }

    const policy = await Policy.create({
      vehicle_id,
      insurance_company_id,
      policy_number,
      coverage_type,
      start_date,
      end_date,
      created_by: req.user.id
    });

    const created = await Policy.findByPk(policy.id, { include: includeOpts });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'create_policy',
      targetType: 'policy',
      targetId: policy.id,
      details: { policy_number, vehicle_id, insurance_company_id },
      ipAddress: req.ip
    });

    return res.status(201).json({ policy: formatPolicy(created) });
  } catch (err) {
    return next(err);
  }
}

async function updatePolicy(req, res, next) {
  try {
    const policy = await Policy.findByPk(req.params.id, { include: includeOpts });
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    if (req.user.role === 'insurer' && policy.insurance_company_id !== req.user.insurance_company_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const {
      policy_number, coverage_type, start_date, end_date
    } = req.body;

    if (policy_number && policy_number !== policy.policy_number) {
      const existing = await Policy.findOne({ where: { policy_number } });
      if (existing) {
        return res.status(409).json({ error: 'A policy with this policy number already exists' });
      }
    }

    const updates = {};
    if (policy_number !== undefined) updates.policy_number = policy_number;
    if (coverage_type !== undefined) updates.coverage_type = coverage_type;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;

    await policy.update(updates);

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'update_policy',
      targetType: 'policy',
      targetId: policy.id,
      details: updates,
      ipAddress: req.ip
    });

    return res.status(200).json({ policy: formatPolicy(policy) });
  } catch (err) {
    return next(err);
  }
}

async function cancelPolicy(req, res, next) {
  try {
    const policy = await Policy.findByPk(req.params.id, { include: includeOpts });
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    if (req.user.role === 'insurer' && policy.insurance_company_id !== req.user.insurance_company_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await policy.update({ status: 'cancelled' });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'cancel_policy',
      targetType: 'policy',
      targetId: policy.id,
      details: null,
      ipAddress: req.ip
    });

    return res.status(200).json({ policy: formatPolicy(policy) });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listPolicies,
  createPolicy,
  updatePolicy,
  cancelPolicy
};
