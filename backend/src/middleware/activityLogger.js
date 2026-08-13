const { ActivityLog } = require('../models');

async function logActivity({
  userId = null,
  role = null,
  action,
  targetType = null,
  targetId = null,
  details = null,
  ipAddress = null
}) {
  try {
    await ActivityLog.create({
      user_id: userId,
      role,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: ipAddress
    });
  } catch (err) {
    // Activity logging must never break the primary request flow.
    console.error('Failed to write activity log:', err.message);
  }
}

module.exports = { logActivity };
