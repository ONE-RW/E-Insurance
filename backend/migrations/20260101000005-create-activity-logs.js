'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activity_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      role: {
        type: Sequelize.STRING,
        allowNull: true
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      target_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      target_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      details: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('activity_logs', ['user_id'], {
      name: 'activity_logs_user_id_idx'
    });
    await queryInterface.addIndex('activity_logs', ['action'], {
      name: 'activity_logs_action_idx'
    });
    await queryInterface.addIndex('activity_logs', ['created_at'], {
      name: 'activity_logs_created_at_idx'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('activity_logs');
  }
};
