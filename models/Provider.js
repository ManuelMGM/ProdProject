const { Sequelize, sequelize } = require('./db');
const { isString, isNum } = require('../utils/validate');

const dbProvider = sequelize.define('providers', {
  cuit: { type: Sequelize.BIGINT, allowNull: false, unique: true },
  name: { type: Sequelize.STRING, allowNull: false },
  razonSocial: { type: Sequelize.STRING },
  apellido: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING, unique: true, validate: { isEmail: true } },
});

class Provider {
  constructor() {
    this.create = async ({ cuit, name, razonSocial, apellido, email }) => {
      try {
        await sequelize.sync();
        const result = await dbProvider.create({
          cuit,
          name,
          razonSocial,
          apellido,
          email,
        });

        return result;
      } catch (e) {
        console.error(e);
      }
    };

    this.getAll = () => {
      return dbProvider.findAll({
        attributes: ['cuit', 'name', 'razonSocial', 'apellido', 'email'],
      });
    };
  }

  async getProvider(id) {
    try {
      return await dbProvider.findById(id);
    } catch (e) {
      console.error(e);
    }
  }

  async getProductsByProvider(id) {
    try {
      return await sequelize.query(
        'SELECT "codProduct", description FROM public.products WHERE "id_Provider" = ?',
        { replacements: [id], type: sequelize.QueryTypes.SELECT }
      );
    } catch(e) {
      console.error(e);
    }
    
  }

  validateAttributes(provider) {
    if (!Array.isArray(provider)) {
      return this.validateProvider(provider);
    } else {
      for (let i = 0; i < provider.length; i++) {
        if (!this.validateProvider(provider[i])) {
          return false;
        }
      }

      return true;
    }
  }

  validateProvider(provider) {
    if (product.hasOwnProperty('name') && !isString(provider.name)) {
      return false;
    }
    if (product.hasOwnProperty('cuit') && !isNum(provider.cuit)) {
      return false;
    }
    if (!provider.id || !isNum(provider.id)) {
      return false;
    }

    return true;
  }

  async updateProvider(provider) {
    try {
      return await dbProvider.update(
        { ...provider, updateAt: Date.now() },
        { returning: true, where: { id: provider.id } }
      );
    } catch (e) {
      console.error(e);
    }
  }

}

module.exports = new Provider();
