const logger = require('../config/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error({ err, reqId: req.id }, err.message);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : (err.message || 'Request failed');

  return res.status(status).json({ error: message });
}

module.exports = errorHandler;
