const { Sequelize, sequelize } = require('./db');
const Entity = require('./Entity');

const dbProductType = sequelize.define('productsTypes', {
  description: { type: Sequelize.STRING, allowNull: false, unique: true },
});

class ProductType extends Entity {
  constructor() {
    super(dbProductType);

    this.getProductType = description => {
      return dbProductType.findAll({
        where: { description },
        attributes: ['id', 'description'],
      });
    };
  }
}

module.exports = new ProductType();
