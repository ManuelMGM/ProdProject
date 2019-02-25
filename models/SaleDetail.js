const { Sequelize, sequelize } = require('./db');
const Entity = require('./Entity');
const Product = require('./Product');
const Sale = require('./Sale');
const { isNum } = require('../utils/validate');

const Op = Sequelize.Op;

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
  productId: {
    type: Sequelize.INTEGER,
    field: 'id_Product',
    references: { model: 'products', key: 'id' },
  },
  quantity: { type: Sequelize.FLOAT, validate: { isNumeric: true } },
  price: { type: Sequelize.FLOAT },
});

class SaleDetail extends Entity {
  constructor() {
    super(dbSaleDetail);

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
  }

  async getSaleDetailSumWithProductTypeByRange(productTypeId, from, to) {
    const where =
      from && to ? { createdAt: { [Op.between]: [from, to] } } : null;

    try {
      if (isNum(productTypeId)) {
        const [result] = await this.dbModel.findAll({
          includeIgnoreAttributes: false,

          attributes: [[sequelize.literal('SUM(price * quantity)'), 'sum']],
          include: [
            {
              model: Product.dbModel,
              where: { id_ProductType: productTypeId },
            },
          ],
          raw: true,
          where,
        });

        return result.sum;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getSaleDetailsByRangeAndProductTypeId(productTypeId, from, to) {
    const where =
      from && to ? { createdAt: { [Op.between]: [from, to] } } : null;

    try {
      return await this.dbModel.findAll({
        include: [
          Sale.dbModel,
          {
            model: Product.dbModel,
            where: { id_ProductType: productTypeId },
          },
        ],
        order: [['createdAt', 'DESC']],
        where,
      });
    } catch (e) {
      console.log(e);

      return e;
    }
  }
}

module.exports = new SaleDetail();

Product.dbModel.hasMany(dbSaleDetail);
dbSaleDetail.belongsTo(Product.dbModel);
Sale.dbModel.hasMany(dbSaleDetail);
dbSaleDetail.belongsTo(Sale.dbModel);
