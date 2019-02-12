const { Sequelize, sequelize } = require('./db');
const Entity = require('./Entity');

const dbPaymentMethod = sequelize.define('paymentMethod', {
  description: { type: Sequelize.STRING, allowNull: false, unique: true },
});

class PaymentMethod extends Entity {
  constructor() {
    super(dbPaymentMethod);
  }
}

module.exports = new PaymentMethod();
