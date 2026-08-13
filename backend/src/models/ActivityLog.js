module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    target_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'activity_logs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  ActivityLog.associate = (models) => {
    ActivityLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return ActivityLog;
};
