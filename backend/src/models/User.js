module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'insurer', 'officer'),
      allowNull: false
    },
    insurance_company_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'disabled'),
      allowNull: false,
      defaultValue: 'active'
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'users',
    underscored: true
  });

  User.associate = (models) => {
    User.belongsTo(models.InsuranceCompany, { foreignKey: 'insurance_company_id', as: 'insurance_company' });
    User.hasMany(models.Policy, { foreignKey: 'created_by', as: 'created_policies' });
    User.hasMany(models.ActivityLog, { foreignKey: 'user_id', as: 'activity_logs' });
  };

  return User;
};
