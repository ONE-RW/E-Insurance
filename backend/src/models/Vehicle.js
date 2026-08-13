module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define('Vehicle', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    plate_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    chassis_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    make: {
      type: DataTypes.STRING,
      allowNull: true
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    owner_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    owner_tin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    owner_national_id: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'vehicles',
    underscored: true
  });

  Vehicle.associate = (models) => {
    Vehicle.hasMany(models.Policy, { foreignKey: 'vehicle_id', as: 'policies' });
  };

  return Vehicle;
};
