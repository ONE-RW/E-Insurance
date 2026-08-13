module.exports = (sequelize, DataTypes) => {
  const Policy = sequelize.define('Policy', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    insurance_company_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    policy_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    coverage_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled'),
      allowNull: false,
      defaultValue: 'active'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'policies',
    underscored: true
  });

  Policy.associate = (models) => {
    Policy.belongsTo(models.Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });
    Policy.belongsTo(models.InsuranceCompany, { foreignKey: 'insurance_company_id', as: 'insurance_company' });
    Policy.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
  };

  return Policy;
};
