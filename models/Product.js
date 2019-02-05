const { Sequelize, sequelize } = require('./db');
const { isString, isNum } = require('../utils/validate');

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

class Product {
  constructor() {
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
        const result = await dbProduct.create({
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

    this.getAll = () => {
      return dbProduct.findAll({
        attributes: [
          'id',
          'codProduct',
          'salePrice',
          'costPrice',
          'description',
          'id_ProductType',
          'stock',
          'id_Provider',
        ],
      });
    };

    this.getProduct = async id => {
      try {
        return await dbProduct.findById(id);
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
            return dbProduct
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
      return await dbProduct.findAll({
        where: {
          [Op.or]: [
            { description: { [Op.iLike]: `%${term}%` } },
            { codProduct: { [Op.iLike]: `%${term}%` } },
          ],
        },
        attributes: [
          'id',
          'codProduct',
          'salePrice',
          'costPrice',
          'description',
          'id_ProductType',
          'stock',
          'id_Provider',
        ],
      });
    } catch (e) {
      console.error(e);
    }
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
    if (!product.id || !isNum(product.id)) {
      return false;
    }

    return true;
  }

  async updateProduct(product) {
    try {
      return await dbProduct.update(
        { ...product, updateAt: Date.now() },
        { returning: true, where: { id: product.id } }
      );
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = new Product();
