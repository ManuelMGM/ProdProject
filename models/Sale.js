const { Sequelize, sequelize } = require('./db');
const SaleDetail = require('./SaleDetail');
const { isString, isNum } = require('../utils/validate');

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
      if (this.validateCreate({ type, amount, details })) {
        await sequelize.sync();
        let number = await sequelize.query(
          'SELECT MAX("number") FROM sales WHERE type = ?',
          { replacements: [type], type: sequelize.QueryTypes.SELECT }
        );
        number =
          parseInt(number[0].max, 10) > 0 ? parseInt(number[0].max, 10) + 1 : 1;

        return sequelize
          .transaction()
          .then(t => {
            return dbSale
              .create(
                {
                  number,
                  type,
                  amount,
                },
                { transaction: t }
              )
              .then(newSale => {
                return sequelize.Promise.map(details, item => {
                  return SaleDetail.create(
                    {
                      saleNumber: newSale.number,
                      type: newSale.type,
                      id_Product: item.id_Product,
                      price: item.price,
                      quantity: item.quantity,
                    },
                    { transaction: t }
                  ).then(newSale => {
                    return newSale;
                  });
                });
              })
              .then(result => {
                t.commit();
                return result;
              });
          })
          .then(
            res => res,
            err => {
              console.error(err);
            }
          );
      } else {
        return false;
      }
    };

    this.getAll = async () => {
      try {
        return await dbSale.findAll({
          attributes: ['number', 'type', 'amount'],
        });
      } catch (e) {
        console.error(e);
      }
    };

    this.getSale = async number => {
      try {
        return await dbSale.findAll({
          where: { number },
          attributes: ['number', 'type', 'amount'],
        });
      } catch (e) {
        console.error(e);
      }
    };
  }

  async getSalesByRangeDates(from, to) {
    const Op = Sequelize.Op;
    try {
      return await dbSale.findAll({
        where: {
          createdAt: {
            [Op.between]: [from, to],
          },
        },
        attributes: ['number', 'type', 'amount'],
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getSalesSum(from, to) {
    try {
      return await sequelize.query(
        'SELECT SUM("amount") FROM sales WHERE "createdAt" BETWEEN :from AND :to',
        { replacements: { from, to }, type: sequelize.QueryTypes.SELECT }
      );
    } catch (e) {
      console.error(e);
    }
  }

  validateCreate({ type, amount, details }) {
    if (!type || !isString(type)) {
      return false;
    }

    if (!amount || !isNum(amount)) {
      return false;
    }

    if (!this.validateDetails(details)) {
      return false;
    }

    return true;
  }

  validateDetails(details) {
    if (details && details.length) {
      for (let i = 0; i < details.length; i++) {
        if (
          details[i].hasOwnProperty('id_Product') &&
          !isNum(details[i].id_Product)
        ) {
          return false;
        }
      }

      return true;
    }

    return false;
  }
}

module.exports = new Sale();
