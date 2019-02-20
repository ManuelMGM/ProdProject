const { Sequelize, sequelize } = require('./db');
const SaleDetail = require('./SaleDetail');
const Entity = require('./Entity');
const Product = require('./Product');
const User = require('./User');
const PaymentMethod = require('./PaymentMethod');

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
  userId: {
    type: Sequelize.INTEGER,
    field: 'id_User',
    references: { model: 'users', key: 'id' },
  },
  paymentMethodId: {
    type: Sequelize.INTEGER,
    field: 'id_PaymentMethod',
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

        // Start transaction
        return (
          sequelize
            .transaction({ autocommit: false })
            .then(transaction => {
              // If transaction started OK, start creating Sale
              return (
                this.dbModel
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
                    // If Sale created OK, start iterating over sales details
                    return sequelize.Promise.each(details, item => {
                      // Create detail
                      return (
                        SaleDetail.dbModel
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
                            // Get product of sale detail to check stock
                            return Product.dbModel
                              .findByPk(id_Product, { transaction })
                              .then(product => {
                                // Checking stock is available
                                if (product.stock >= quantity) {
                                  const stock = product.stock - quantity;
                                  const productData = { id: id_Product, stock };
                                  // Update stock for product and save
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
                                  // Rolling transaction back for lacking of stock
                                  return transaction
                                    .rollback()
                                    .then(result => result);
                                }
                              });
                          })
                          // Returning result of iteration
                          .then(
                            result => result,
                            error => {
                              throw error;
                            }
                          )
                      );
                    });
                  })
                  // Returning result of sale creation
                  .then(
                    newSale => {
                      // If any of the stock updates is succesfull,
                      // sequelize will try to commit.
                      return transaction.commit(
                        () => newSale,
                        error => {
                          throw error;
                        }
                      );
                    },
                    error => {
                      throw error;
                    }
                  )
              );
            })
            // Returning result of transaction promise
            .then(
              res => res,
              err => {
                throw err;
              }
            )
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

  getAll() {
    try {
      User.dbModel.hasMany(dbSale);
      PaymentMethod.dbModel.hasMany(dbSale);
      this.dbModel.belongsTo(PaymentMethod.dbModel);
      this.dbModel.belongsTo(User.dbModel);

      return this.dbModel.findAll({
        include: [User.dbModel, PaymentMethod.dbModel],
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getEntity(number) {
    try {
      User.dbModel.hasMany(dbSale);
      PaymentMethod.dbModel.hasMany(dbSale);
      this.dbModel.belongsTo(PaymentMethod.dbModel);
      this.dbModel.belongsTo(User.dbModel);

      return await this.dbModel.findAll({
        include: [User.dbModel, PaymentMethod.dbModel],
        where: { number },
      });
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = new Sale();