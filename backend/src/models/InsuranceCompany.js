module.exports = (sequelize, DataTypes) => {
  const InsuranceCompany = sequelize.define('InsuranceCompany', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tin_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'disabled'),
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    tableName: 'insurance_companies',
    underscored: true
  });

  InsuranceCompany.associate = (models) => {
    InsuranceCompany.hasMany(models.User, { foreignKey: 'insurance_company_id', as: 'users' });
    InsuranceCompany.hasMany(models.Policy, { foreignKey: 'insurance_company_id', as: 'policies' });
  };

  return InsuranceCompany;
};
