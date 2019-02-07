const { Sequelize, sequelize } = require('./db');
const SaleDetail = require('./SaleDetail');
const Product = require('./Product');

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
  id_User: {
    type: Sequelize.INTEGER,
    references: { model: 'usersTypes', key: 'id' },
  },
});

class Sale {
  constructor() {
    this.create = async ({ type, amount, id_User, details }) => {
      if (this.validateCreate({ type, amount, id_User, details })) {
        await sequelize.sync();
        let number = await sequelize.query(
          'SELECT MAX("number") FROM sales WHERE type = ?',
          { replacements: [type], type: sequelize.QueryTypes.SELECT }
        );
        number =
          parseInt(number[0].max, 10) > 0 ? parseInt(number[0].max, 10) + 1 : 1;

        return sequelize
          .transaction()
          .then(transaction => {
            return dbSale
              .create(
                {
                  number,
                  type,
                  amount,
                  id_User,
                },
                { transaction }
              )
              .then(sale => {
                return sequelize.Promise.map(details, item => {
                  return SaleDetail.model
                    .create(
                      {
                        saleNumber: sale.number,
                        type: sale.type,
                        id_Product: item.id_Product,
                        price: item.price,
                        quantity: item.quantity,
                      },
                      { transaction }
                    )
                    .then(detail => {
                      const { id_Product, quantity } = detail;
                      return Product.model
                        .findByPk(id_Product, { transaction })
                        .then(product => {
                          if (product.stock > quantity) {
                            const stock = product.stock - quantity;
                            const productData = { id: id_Product, stock };
                            return Product.model
                              .update(
                                { ...productData, updateAt: Date.now() },
                                {
                                  returning: true,
                                  where: { id: id_Product },
                                  transaction,
                                }
                              )
                              .then(productUpdated => productUpdated);
                          } else {
                            throw new Error('Stock is not enough.');
                          }
                        });
                    })
                    .then(
                      result => result,
                      error => {
                        throw new Error(error);
                      }
                    );
                });
              })
              .then(
                newSale => {
                  transaction.commit();
                  return newSale;
                },
                error => console.log('error en new sale', error)
              );
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

  validateCreate({ type, amount, id_User, details }) {
    if (!type || !isString(type)) {
      return false;
    }

    if (!amount || !isNum(amount)) {
      return false;
    }

    if (!id_User || !isNum(id_User)) {
      return false;
    }

    if (!this.validateDetails(details)) {
      return false;
    }

    return true;
  }

  validateDetails(details) {
    if (details && details.length) {
      let res = true;
      details.some(element => {
        if (
          element.hasOwnProperty('id_Product') &&
          !isNum(element.id_Product)
        ) {
          res = false;
        }
      });

      return res;
    }

    return false;
  }
}

module.exports = new Sale();
