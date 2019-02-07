const { Sequelize, sequelize } = require('./db');

const dbSaleDetail = sequelize.define('salesDetails', {
  saleNumber: {
    type: Sequelize.BIGINT,
    allowNull: false,
    references: { model: 'sales', key: 'number' },
  },
  type: {
    type: Sequelize.CHAR,
    allowNull: false,
    references: { model: 'sales', key: 'type' },
  },
  id_Product: {
    type: Sequelize.INTEGER,
    references: { model: 'products', key: 'id' },
  },
  quantity: { type: Sequelize.FLOAT, validate: { isNumeric: true } },
  price: { type: Sequelize.FLOAT },
});

class SaleDetail {
  constructor() {
    this.model = dbSaleDetail;
    this.create = async ({ saleNumber, type, id_Product, quantity, price }) => {
      try {
        await sequelize.sync();
        const result = await dbSaleDetail.create({
          saleNumber,
          type,
          id_Product,
          quantity,
          price,
        });

        return result;
      } catch (e) {
        console.error(e);
      }
    };

    this.getAll = saleNumber => {
      return dbSaleDetail.findAll({
        where: { saleNumber },
        attributes: ['item', 'saleNumber', 'type', 'id_Product', 'quantity'],
      });
    };
  }
}

module.exports = new SaleDetail();
