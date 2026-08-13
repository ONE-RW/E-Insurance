'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vehicles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      plate_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      chassis_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      make: {
        type: Sequelize.STRING,
        allowNull: true
      },
      model: {
        type: Sequelize.STRING,
        allowNull: true
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      owner_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      owner_tin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      owner_national_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('vehicles', ['plate_number'], {
      unique: true,
      name: 'vehicles_plate_number_unique'
    });
    await queryInterface.addIndex('vehicles', ['owner_tin'], {
      name: 'vehicles_owner_tin_idx'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('vehicles');
  }
};
