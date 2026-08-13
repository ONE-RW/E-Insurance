const { Op } = require('sequelize');
const { ActivityLog, User } = require('../models');

function formatLog(log) {
  return {
    id: log.id,
    user: log.user ? {
      id: log.user.id,
      full_name: log.user.full_name,
      email: log.user.email,
      role: log.user.role
    } : null,
    action: log.action,
    target_type: log.target_type,
    target_id: log.target_id,
    details: log.details,
    ip_address: log.ip_address,
    created_at: log.created_at
  };
}

// baseWhere carries filters the caller is forced into (e.g. { user_id } for the
// "my activity" endpoint). It is applied after the query-derived filters so it always
// takes precedence and can't be overridden by a matching query param.
async function findLogs(baseWhere, query) {
  const where = {};
  if (query.user_id) where.user_id = query.user_id;
  if (query.role) where.role = query.role;
  if (query.action) where.action = query.action;

  if (query.from || query.to) {
    where.created_at = {};
    if (query.from) where.created_at[Op.gte] = new Date(query.from);
    if (query.to) where.created_at[Op.lte] = new Date(query.to);
  }

  Object.assign(where, baseWhere);

  const page = parseInt(query.page, 10) > 0 ? parseInt(query.page, 10) : 1;
  const limit = parseInt(query.limit, 10) > 0 ? parseInt(query.limit, 10) : 50;
  const offset = (page - 1) * limit;

  const { rows, count } = await ActivityLog.findAndCountAll({
    where,
    include: [{ model: User, as: 'user' }],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  return {
    logs: rows.map(formatLog),
    total: count,
    page,
    limit
  };
}

async function listLogs(req, res, next) {
  try {
    const result = await findLogs({}, req.query);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listMyLogs(req, res, next) {
  try {
    // user_id/role are forced to the caller; any client-supplied values for those two
    // query params are dropped before filtering so this endpoint can only ever return
    // the caller's own logs.
    const { user_id, role, ...ownQuery } = req.query;
    const result = await findLogs({ user_id: req.user.id }, ownQuery);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listLogs, listMyLogs };
