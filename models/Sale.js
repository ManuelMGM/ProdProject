const { Sequelize, sequelize } = require('./db');
const Entity = require('./Entity');
const Product = require('./Product');
const User = require('./User');
const PaymentMethod = require('./PaymentMethod');

const { isString, isNum } = require('../utils/validate');
const Op = Sequelize.Op;

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
                      userId: id_User,
                      paymentMethodId: id_PaymentMethod,
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
                              productId: item.id_Product,
                              price: item.price,
                              quantity: item.quantity,
                            },
                            { transaction }
                          )
                          .then(detail => {
                            const { productId, quantity } = detail;
                            // Get product of sale detail to check stock
                            return Product.dbModel
                              .findByPk(productId, { transaction })
                              .then(product => {
                                // Checking stock is available
                                if (product.stock >= quantity) {
                                  const stock = product.stock - quantity;
                                  const productData = { id: productId, stock };
                                  // Update stock for product and save
                                  return Product.dbModel
                                    .update(
                                      { ...productData, updateAt: Date.now() },
                                      {
                                        returning: true,
                                        where: { id: productId },
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

  getAll() {
    try {
      return this.dbModel.findAll({
        include: [User.dbModel, PaymentMethod.dbModel],
        order: [['createdAt', 'DESC']],
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getEntity(number, type) {
    try {
      if (isNum(number) & !!isString(type)) {
        return await this.dbModel.findOne({
          include: [User.dbModel, PaymentMethod.dbModel],
          where: { number, type },
        });
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  async getEntitiesByRangeDates(from, to) {
    try {
      return await this.dbModel.findAll({
        include: [User.dbModel, PaymentMethod.dbModel],
        where: {
          createdAt: {
            [Op.between]: [from, to],
          },
        },
        order: [['createdAt', 'DESC']],
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async getEntitiesByRangeDates(from, to) {
    try {
      return await this.dbModel.findAll({
        include: [User.dbModel, PaymentMethod.dbModel],
        where: {
          createdAt: {
            [Op.between]: [from, to],
          },
        },
        order: [['createdAt', 'DESC']],
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async getSalesSum(from, to) {
    try {
      return await dbSale.sum('amount', {
        where: { createdAt: { [Op.between]: [from, to] } },
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getCashSalesSum(from, to) {
    try {
      return await dbSale.sum('amount', {
        includeIgnoreAttributes: false,
        include: [{ model: PaymentMethod.dbModel, where: { id: 1 } }],
        where: { createdAt: { [Op.between]: [from, to] } },
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getSaleWithProduct(idProduct) {
    try {
      if (isNum(idProduct)) {
        return await dbSale.findAll({
          include: [
            User.dbModel,
            PaymentMethod.dbModel,
            { model: SaleDetail.dbModel, where: { id_Product: idProduct } },
          ],
          order: [['createdAt', 'DESC']],
        });
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getSaleWithProductByRange(idProduct, from, to) {
    try {
      if (isNum(idProduct)) {
        return await this.dbModel.findAll({
          include: [
            User.dbModel,
            PaymentMethod.dbModel,
            { model: SaleDetail.dbModel, where: { id_Product: idProduct } },
          ],
          where: { createdAt: { [Op.between]: [from, to] } },
          order: [['createdAt', 'DESC']],
        });
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getSaleSumWithProduct(idProduct) {
    try {
      if (isNum(idProduct)) {
        return await dbSale.sum('amount', {
          includeIgnoreAttributes: false,
          include: [
            { model: SaleDetail.dbModel, where: { id_Product: idProduct } },
          ],
        });
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  async getSaleSumWithProductByRange(idProduct, from, to) {
    try {
      if (isNum(idProduct)) {
        return await dbSale.sum('amount', {
          includeIgnoreAttributes: false,
          include: [
            {
              model: SaleDetail.dbModel,
              where: { id_Product: idProduct },
              atributes: [],
            },
          ],
          where: { createdAt: { [Op.between]: [from, to] } },
        });
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

module.exports = new Sale();

const SaleDetail = require('./SaleDetail');

User.dbModel.hasMany(dbSale);
PaymentMethod.dbModel.hasMany(dbSale);
dbSale.belongsTo(PaymentMethod.dbModel);
dbSale.belongsTo(User.dbModel);
dbSale.hasMany(SaleDetail.dbModel);
SaleDetail.dbModel.belongsTo(dbSale);
