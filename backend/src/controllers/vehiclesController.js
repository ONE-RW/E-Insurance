const { Vehicle } = require('../models');
const { logActivity } = require('../middleware/activityLogger');

function formatVehicle(vehicle) {
  return {
    id: vehicle.id,
    plate_number: vehicle.plate_number,
    chassis_number: vehicle.chassis_number,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    owner_name: vehicle.owner_name,
    owner_tin: vehicle.owner_tin,
    owner_national_id: vehicle.owner_national_id,
    created_at: vehicle.createdAt
  };
}

async function listVehicles(req, res, next) {
  try {
    const where = {};
    if (req.query.plate) where.plate_number = req.query.plate;
    if (req.query.owner_tin) where.owner_tin = req.query.owner_tin;

    const vehicles = await Vehicle.findAll({ where, order: [['createdAt', 'DESC']] });
    return res.status(200).json({ vehicles: vehicles.map(formatVehicle) });
  } catch (err) {
    return next(err);
  }
}

async function getVehicleByPlate(req, res, next) {
  try {
    const vehicle = await Vehicle.findOne({ where: { plate_number: req.params.plate } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.status(200).json({ vehicle: formatVehicle(vehicle) });
  } catch (err) {
    return next(err);
  }
}

async function createVehicle(req, res, next) {
  try {
    const {
      plate_number, chassis_number, make, model, year, owner_name, owner_tin, owner_national_id
    } = req.body;

    const existing = await Vehicle.findOne({ where: { plate_number } });
    if (existing) {
      return res.status(409).json({ error: 'A vehicle with this plate number already exists' });
    }

    const vehicle = await Vehicle.create({
      plate_number, chassis_number, make, model, year, owner_name, owner_tin, owner_national_id
    });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'create_vehicle',
      targetType: 'vehicle',
      targetId: vehicle.id,
      details: { plate_number },
      ipAddress: req.ip
    });

    return res.status(201).json({ vehicle: formatVehicle(vehicle) });
  } catch (err) {
    return next(err);
  }
}

async function getVehicle(req, res, next) {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.status(200).json({ vehicle: formatVehicle(vehicle) });
  } catch (err) {
    return next(err);
  }
}

async function updateVehicle(req, res, next) {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const {
      plate_number, chassis_number, make, model, year, owner_name, owner_tin, owner_national_id
    } = req.body;

    if (plate_number && plate_number !== vehicle.plate_number) {
      const existing = await Vehicle.findOne({ where: { plate_number } });
      if (existing) {
        return res.status(409).json({ error: 'A vehicle with this plate number already exists' });
      }
    }

    const updates = {};
    if (plate_number !== undefined) updates.plate_number = plate_number;
    if (chassis_number !== undefined) updates.chassis_number = chassis_number;
    if (make !== undefined) updates.make = make;
    if (model !== undefined) updates.model = model;
    if (year !== undefined) updates.year = year;
    if (owner_name !== undefined) updates.owner_name = owner_name;
    if (owner_tin !== undefined) updates.owner_tin = owner_tin;
    if (owner_national_id !== undefined) updates.owner_national_id = owner_national_id;

    await vehicle.update(updates);

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'update_vehicle',
      targetType: 'vehicle',
      targetId: vehicle.id,
      details: updates,
      ipAddress: req.ip
    });

    return res.status(200).json({ vehicle: formatVehicle(vehicle) });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listVehicles,
  getVehicleByPlate,
  createVehicle,
  getVehicle,
  updateVehicle
};
