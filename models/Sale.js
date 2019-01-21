const { Sequelize, sequelize } = require('./db');
const SaleDetail = require('./SaleDetail');

const dbSale = sequelize.define('sales', {
  // Could fail when persisting for first time. Should add unique prop to avoid
  number: {
    type: Sequelize.BIGINT,
    allowNull: false,
    primaryKey: true,
    validate: { isNumeric: true },
  },
  type: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
  amount: { type: Sequelize.FLOAT },
});

class Sale {
  constructor() {
    this.create = async ({ type, amount, details }) => {
      let transaction;
      try {
        await sequelize.sync();
        let number = await sequelize.query(
          'SELECT MAX("number") FROM sales WHERE type = ?',
          { replacements: [type], type: sequelize.QueryTypes.SELECT }
        );
        number =
          parseInt(number[0].max, 10) > 0 ? parseInt(number[0].max, 10) + 1 : 1;

        transaction = await sequelize.transaction();
        const sale = await dbSale.create(
          {
            number,
            type,
            amount,
          },
          { transaction }
        );

        details.forEach(async item => {
          await SaleDetail.create(
            {
              saleNumber: number,
              type,
              id_Product: item.id_Product,
              price: item.price,
              quantity: item.quantity,
            },
            { transaction }
          );
        });

        await transaction.commit();

        return sale.get({ plain: true });
      } catch (e) {
        transaction.rollback();
        console.error(e);
      }
    };

    this.getAll = () => {
      return dbSale.findAll({
        attributes: ['number', 'type', 'amount'],
      });
    };

    this.getSale = number => {
      return dbSale.findAll({
        where: { number },
        attributes: ['number', 'type', 'amount'],
      });
    };
  }
}

module.exports = new Sale();
