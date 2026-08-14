const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const env = require('./config/env');
const logger = require('./config/logger');

const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const companiesRoutes = require('./routes/companiesRoutes');
const vehiclesRoutes = require('./routes/vehiclesRoutes');
const policiesRoutes = require('./routes/policiesRoutes');
const searchRoutes = require('./routes/searchRoutes');
const logsRoutes = require('./routes/logsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const sessionsRoutes = require('./routes/sessionsRoutes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

const uploadsDir = path.resolve(__dirname, '../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use('/uploads', helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }), express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/policies', policiesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/sessions', sessionsRoutes);

if (env.nodeEnv === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

module.exports = app;
