const { Sequelize, sequelize } = require('./db');
const Entity = require('./Entity');
const Product = require('./Product');

const dbProvider = sequelize.define('providers', {
  cuit: { type: Sequelize.BIGINT, allowNull: false, unique: true },
  name: { type: Sequelize.STRING, allowNull: false },
  razonSocial: { type: Sequelize.STRING },
  apellido: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING, unique: true, validate: { isEmail: true } },
  phoneNumber1: { type: Sequelize.BIGINT },
  phoneNumber2: { type: Sequelize.BIGINT },
});

class Provider extends Entity {
  constructor() {
    super(dbProvider);
    this.create = async ({
      cuit,
      name,
      razonSocial,
      apellido,
      email,
      phoneNumber1,
      phoneNumber2,
    }) => {
      try {
        await sequelize.sync();
        const result = await dbProvider.create({
          cuit,
          name,
          razonSocial,
          apellido,
          email,
          phoneNumber1,
          phoneNumber2,
        });

        return result;
      } catch (e) {
        console.error(e);
      }
    };
  }

  async getProductsByProvider(id) {
    try {
      return await Product.findByProvider(id);
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = new Provider();
