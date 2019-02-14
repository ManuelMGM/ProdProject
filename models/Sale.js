const { Sequelize, sequelize } = require('./db');
const SaleDetail = require('./SaleDetail');
const Entity = require('./Entity');
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
  type: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  amount: { type: Sequelize.FLOAT },
  id_User: {
    type: Sequelize.INTEGER,
    references: { model: 'users', key: 'id' },
  },
  id_PaymentMethod: {
    type: Sequelize.INTEGER,
    references: { model: 'paymentMethods', key: 'id' },
  },
});

class Sale extends Entity {
  constructor() {
    super(dbSale);

    this.create = async ({
      type,
      amount,
      id_User,
      details,
      id_PaymentMethod,
    }) => {
      if (
        this.validateCreate({
          type,
          amount,
          id_User,
          details,
          id_PaymentMethod,
        })
      ) {
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
            return this.dbModel
              .create(
                {
                  number,
                  type,
                  amount,
                  id_User,
                  id_PaymentMethod,
                },
                { transaction }
              )
              .then(sale => {
                return sequelize.Promise.map(details, item => {
                  return SaleDetail.dbModel
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

                      return Product.dbModel
                        .findByPk(id_Product, { transaction })
                        .then(product => {
                          if (product.stock >= quantity) {
                            const stock = product.stock - quantity;
                            const productData = { id: id_Product, stock };

                            return Product.dbModel
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
  }

  validateCreate({ type, amount, id_User, details, id_PaymentMethod }) {
    if (!type || !isString(type)) {
      return false;
    }

    if (!isNum(amount) || !(amount > 0)) {
      return false;
    }

    if (!isNum(id_User)) {
      return false;
    }

    if (!this.validateDetails(details)) {
      return false;
    }

    if (!isNum(id_PaymentMethod)) {
      return false;
    }

    return true;
  }

  validateDetails(details) {
    if (details && details.length) {
      let res = true;
      details.some(element => {
        if (!isNum(element.id_Product)) {
          res = false;
        }
        if (!isNum(element.price) || !(element.price > 0)) {
          res = false;
        }
        if (!isNum(element.quantity) || !(element.quantity > 0)) {
          res = false;
        }
      });

      return res;
    }

    return false;
  }

  async getCashSalesSum(from, to) {
    try {
      const [response] = await sequelize.query(
        'SELECT SUM("amount") FROM sales WHERE "createdAt" BETWEEN :from AND :to AND "id_PaymentMethod"=1',
        { replacements: { from, to }, type: sequelize.QueryTypes.SELECT }
      );

      return response.sum || 0;
    } catch (e) {
      console.error(e);
      throw e;
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
      throw e;
    }
  }

  async getSaleWithProduct(idProduct) {
    try {
      if (isNum(idProduct)) {
        const query =
          'SELECT s."number", s.type, s.amount, p."codProduct", p.description, s."id_User"' +
          ' FROM public.sales s INNER JOIN public."salesDetails" sd ON (s."number" = sd."saleNumber" AND s.type = sd.type)' +
          ' INNER JOIN public.products p ON (sd."id_Product" = p.id)' +
          ' WHERE p.id = ?';

        return await sequelize.query(query, {
          replacements: [idProduct],
          type: sequelize.QueryTypes.SELECT,
        });
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async getSaleWithProductByDates(idProduct, from, to) {
    try {
      if (isNum(idProduct)) {
        const query =
          'SELECT s."number", s.type, s.amount, p."codProduct", p.description, s."id_User"' +
          ' FROM public.sales s INNER JOIN public."salesDetails" sd ON (s."number" = sd."saleNumber" AND s.type = sd.type)' +
          ' INNER JOIN public.products p ON (sd."id_Product" = p.id)' +
          ' WHERE p.id = :idProduct AND s."createdAt" BETWEEN :from AND :to';

        return await sequelize.query(query, {
          replacements: { idProduct, from, to },
          type: sequelize.QueryTypes.SELECT,
        });
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = new Sale();
