const { Sequelize, sequelize } = require('./db');

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
  stock: { type: Sequelize.FLOAT },
  minimumStock: { type: Sequelize.FLOAT },
  price: { type: Sequelize.FLOAT },
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
      price,
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
          price,
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
          'price',
          'description',
          'id_ProductType',
          'stock',
          'id_Provider',
        ],
      });
    };

    this.getProduct = id => {
      return dbProduct.findAll({
        where: { id },
        attributes: [
          'id',
          'codProduct',
          'price',
          'description',
          'id_ProductType',
          'stock',
          'id_Provider',
        ],
      });
    };
  }
}

module.exports = new Product();
