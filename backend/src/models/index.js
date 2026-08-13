const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = require('./User')(sequelize, DataTypes);
const InsuranceCompany = require('./InsuranceCompany')(sequelize, DataTypes);
const Vehicle = require('./Vehicle')(sequelize, DataTypes);
const Policy = require('./Policy')(sequelize, DataTypes);
const ActivityLog = require('./ActivityLog')(sequelize, DataTypes);

const models = { User, InsuranceCompany, Vehicle, Policy, ActivityLog };

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
