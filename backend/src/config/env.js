require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  jwtSecret: process.env.JWT_SECRET,
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  publicUrl: process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`
};
