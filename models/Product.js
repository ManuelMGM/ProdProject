const { Sequelize, sequelize } = require('./db');
const { isString, isNum } = require('../utils/validate');
const Entity = require('./Entity');

const dbProduct = sequelize.define('products', {
  codProduct: { type: Sequelize.STRING, allowNull: false, unique: true },
  description: { type: Sequelize.STRING, allowNull: false },
  id_ProductType: {
    type: Sequelize.INTEGER,
    references: { model: 'productsTypes', key: 'id' },
  },
  id_Provider: {
    type: Sequelize.INTEGER,
    references: { model: 'providers', key: 'id' },
  },
  stock: { type: Sequelize.FLOAT, validate: { min: 0 } },
  minimumStock: { type: Sequelize.FLOAT, validate: { min: 0 } },
  salePrice: { type: Sequelize.FLOAT, validate: { min: 0 } },
  costPrice: { type: Sequelize.FLOAT, validate: { min: 0 } },
});

class Product extends Entity {
  constructor() {
    super(dbProduct);

    this.create = async ({
      codProduct,
      description,
      id_ProductType,
      id_Provider,
      stock,
      minimumStock,
      salePrice,
      costPrice,
    }) => {
      try {
        await sequelize.sync();
        const result = await this.dbModel.create({
          codProduct,
          description,
          id_ProductType,
          id_Provider,
          stock,
          minimumStock,
          salePrice,
          costPrice,
        });

        return result;
      } catch (e) {
        console.error(e);
      }
    };
  }

  async updateMultiple(products) {
    if (this.validateAttributes(products)) {
      return sequelize
        .transaction()
        .then(t => {
          return sequelize.Promise.map(products, prod => {
            return this.dbModel
              .update(
                { ...prod, updateAt: Date.now() },
                { returning: true, where: { id: prod.id }, transaction: t }
              )
              .then(result => {
                const newProduct = result[1][0].dataValues;
                return newProduct;
              });
          }).then(productsChanged => {
            t.commit();

            return productsChanged;
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
  }

  async getProductByDescription(term) {
    const Op = Sequelize.Op;
    try {
      return await this.dbModel.findAll({
        where: {
          [Op.or]: [
            { description: { [Op.iLike]: `%${term}%` } },
            { codProduct: { [Op.iLike]: `%${term}%` } },
          ],
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  async getProductOrderBy(order) {
    try {
      const queryTerm = this.getOrderParam(order);
      const query =
        'SELECT p.id, p."codProduct", p.description As Product, pt.description As Type,' +
        ' CONCAT(pr.name, \' \', pr.apellido) As Provider, p.stock, p."minimumStock", p."salePrice", p."costPrice"' +
        ' FROM public.products p INNER JOIN public.providers pr ON p."id_Provider" = pr.id' +
        '   INNER JOIN public."productsTypes" pt ON p."id_ProductType" = pt.id' +
        ' ORDER BY ?';

      if (queryTerm) {
        return await sequelize.query(query, {
          replacements: [queryTerm],
          type: sequelize.QueryTypes.SELECT,
        });
      } else {
        return await sequelize.query(query, {
          replacements: [3],
          type: sequelize.QueryTypes.SELECT,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  getOrderParam(order) {
    let result = false;
    switch (order) {
      case 'codProduct':
        result = 2;
        break;
      case 'product':
        result = 3;
        break;
      case 'productType':
        result = 4;
        break;
      case 'provider':
        result = 5;
        break;
    }

    return result;
  }

  validateAttributes(product) {
    if (!Array.isArray(product)) {
      return this.validateProduct(product);
    } else {
      let res = true;
      product.some(element => {
        if (!this.validateProduct(element)) {
          res = false;
        }
      });

      return res;
    }
  }

  validateProduct(product) {
    if (
      product.hasOwnProperty('description') &&
      !isString(product.description)
    ) {
      return false;
    }
    if (product.hasOwnProperty('codProduct') && !isString(product.codProduct)) {
      return false;
    }
    if (!isNum(product.id)) {
      return false;
    }

    return true;
  }

  async findByProvider(providerId) {
    return this.dbModel.findAll({ where: { id_Provider: providerId } });
  }
}

module.exports = new Product();
