const { Session } = require('../models');
const { logActivity } = require('../middleware/activityLogger');

function formatSession(session, currentSessionId) {
  return {
    id: session.id,
    ip_address: session.ip_address,
    user_agent: session.user_agent,
    created_at: session.createdAt,
    last_active_at: session.last_active_at,
    is_current: session.id === currentSessionId
  };
}

async function listMySessions(req, res, next) {
  try {
    const sessions = await Session.findAll({
      where: { user_id: req.user.id, revoked_at: null },
      order: [['last_active_at', 'DESC']]
    });

    return res.status(200).json({
      sessions: sessions.map((session) => formatSession(session, req.sessionId))
    });
  } catch (err) {
    return next(err);
  }
}

async function revokeMySession(req, res, next) {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session || session.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await session.update({ revoked_at: new Date() });

    await logActivity({
      userId: req.user.id,
      role: req.user.role,
      action: 'revoke_session',
      targetType: 'session',
      targetId: req.params.id,
      details: null,
      ipAddress: req.ip
    });

    return res.status(200).json({ message: 'Session revoked' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listMySessions, revokeMySession };
