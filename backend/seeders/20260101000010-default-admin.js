'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const email = process.env.ADMIN_EMAIL || 'admin@rnp.gov.rw';
    const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const password_hash = await bcrypt.hash(password, 10);

    const existing = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email',
      {
        replacements: { email },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    if (existing.length > 0) {
      return;
    }

    await queryInterface.bulkInsert('users', [{
      full_name: 'System Administrator',
      email,
      password_hash,
      role: 'admin',
      insurance_company_id: null,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface) => {
    const email = process.env.ADMIN_EMAIL || 'admin@rnp.gov.rw';
    await queryInterface.bulkDelete('users', { email });
  }
};
