'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('insurance_companies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tin_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'disabled'),
        allowNull: false,
        defaultValue: 'active'
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

    await queryInterface.addIndex('insurance_companies', ['tin_number'], {
      unique: true,
      name: 'insurance_companies_tin_number_unique'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('insurance_companies');
  }
};
