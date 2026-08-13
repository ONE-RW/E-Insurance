'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('policies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      vehicle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vehicles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      insurance_company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'insurance_companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      policy_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      coverage_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'cancelled'),
        allowNull: false,
        defaultValue: 'active'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    await queryInterface.addIndex('policies', ['policy_number'], {
      unique: true,
      name: 'policies_policy_number_unique'
    });
    await queryInterface.addIndex('policies', ['vehicle_id'], {
      name: 'policies_vehicle_id_idx'
    });
    await queryInterface.addIndex('policies', ['insurance_company_id'], {
      name: 'policies_insurance_company_id_idx'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('policies');
  }
};
