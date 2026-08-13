const { Vehicle, Policy, InsuranceCompany } = require('../models');
const { logActivity } = require('../middleware/activityLogger');

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(fromDate, toDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(toDate) - startOfDay(fromDate)) / msPerDay);
}

async function buildResultForVehicle(vehicle) {
  if (!vehicle) {
    return { vehicle: null, insured: false, policy: null };
  }

  const policies = await Policy.findAll({
    where: { vehicle_id: vehicle.id },
    include: [{ model: InsuranceCompany, as: 'insurance_company' }],
    order: [['end_date', 'DESC']]
  });

  const today = new Date();
  const todayStart = startOfDay(today);

  const activePolicy = policies.find(
    (p) => p.status === 'active' && p.end_date && startOfDay(new Date(p.end_date)) >= todayStart
  );

  let chosen = null;
  let insured = false;

  if (activePolicy) {
    chosen = activePolicy;
    insured = true;
  } else if (policies.length > 0) {
    chosen = policies[0];
    insured = false;
  }

  const vehiclePayload = {
    id: vehicle.id,
    plate_number: vehicle.plate_number,
    chassis_number: vehicle.chassis_number,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    owner_name: vehicle.owner_name,
    owner_tin: vehicle.owner_tin
  };

  let policyPayload = null;
  if (chosen) {
    policyPayload = {
      insurance_company: chosen.insurance_company
        ? { id: chosen.insurance_company.id, name: chosen.insurance_company.name }
        : null,
      policy_number: chosen.policy_number,
      coverage_type: chosen.coverage_type,
      start_date: chosen.start_date,
      end_date: chosen.end_date,
      days_remaining: daysBetween(today, new Date(chosen.end_date))
    };
  }

  return { vehicle: vehiclePayload, insured, policy: policyPayload };
}

async function search(req, res, next) {
  try {
    const { plate, tin } = req.query;
    const ipAddress = req.ip;

    if (plate) {
      const vehicle = await Vehicle.findOne({ where: { plate_number: plate } });
      const result = await buildResultForVehicle(vehicle);

      await logActivity({
        userId: req.user.id,
        role: req.user.role,
        action: 'search',
        targetType: 'vehicle',
        targetId: vehicle ? vehicle.id : null,
        details: { query_type: 'plate', query_value: plate, found: !!vehicle, insured: result.insured },
        ipAddress
      });

      return res.status(200).json(result);
    }

    const vehicles = await Vehicle.findAll({ where: { owner_tin: tin } });
    const results = await Promise.all(vehicles.map((v) => buildResultForVehicle(v)));

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'search',
      targetType: 'vehicle',
      targetId: vehicles.length > 0 ? vehicles[0].id : null,
      details: { query_type: 'tin', query_value: tin, found: vehicles.length > 0, insured: results.some((r) => r.insured) },
      ipAddress
    });

    return res.status(200).json({ vehicles: results });
  } catch (err) {
    return next(err);
  }
}

module.exports = { search };
