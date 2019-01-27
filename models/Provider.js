const { Sequelize, sequelize } = require('./db');
const value = require('../utils/validate');

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

    this.getProvider = id => {
      return dbProvider.findAll({
        where: { id },
        attributes: ['cuit', 'name', 'razonSocial', 'apellido', 'email'],
      });
    };
  }

  async update(provider) {
    try {
      if (this.validateAttributes(provider)) {
        if (!Array.isArray(provider)) {
          return await dbProvider.update(
            { ...provider, updateAt: Date.now() },
            { returning: true, where: { id: provider.id } }
          );
        } else {
          let transaction;
          try {
            await sequelize.sync();
            transaction = await sequelize.transaction();

            let result = [];
            await provider.forEach(async item => {
              await result.push(
                await dbProvider.update(
                  { ...item, updateAt: Date.now() },
                  { returning: true, where: { id: item.id } },
                  { transaction }
                )
              );
            });

            await transaction.commit();

            return result;
          } catch (e) {
            await transaction.rollback();
            console.error(e);
          }
        }
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async getProductsById(id) {
    return await sequelize.query(
      'SELECT "codProduct", description FROM public.products WHERE "id_Provider" = ?',
      { replacements: [id], type: sequelize.QueryTypes.SELECT }
    );
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
    if (!(provider.name == null) && !value.isString(provider.name)) {
      return false;
    }
    if (!(provider.cuit == null) && !value.isNum(provider.cuit)) {
      return false;
    }
    if (!provider.id || !value.isNum(provider.id)) {
      return false;
    }
    return true;
  }
}

module.exports = new Provider();
