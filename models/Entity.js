const { Sequelize, sequelize } = require('./db');
class Entity {
  constructor(dbModel) {
    this.dbModel = dbModel;
  }

  async create(entityProps) {
    try {
      await sequelize.sync();
      return await this.dbModel.create({
        ...entityProps,
      });
    } catch (e) {
      console.error(e);

      return e;
    }
  }

  async getEntity(id) {
    try {
      return await this.dbModel.findByPk(id);
    } catch (e) {
      console.error(e);

      return e;
    }
  }

  getAll() {
    return this.dbModel.findAll();
  }

  getAllByKey(key) {
    return this.dbModel.findAll({
      where: { [key]: key },
    });
  }

  async updateEntity(entity) {
    try {
      const result = await this.dbModel.update(
        { ...entity, updateAt: Date.now() },
        { returning: true, where: { id: entity.id } }
      );

      return result[1][0].dataValues;
    } catch (e) {
      console.error(e);

      return e;
    }
  }

  async delete(id) {
    try {
      const model = await this.dbModel.findByPk(id);
      const show = model;
      model.destroy();

      return show;
    } catch (e) {
      console.log(e);

      return e;
    }
  }

  async getEntitiesByRangeDates(from, to) {
    const Op = Sequelize.Op;
    try {
      return await this.dbModel.findAll({
        where: {
          createdAt: {
            [Op.between]: [from, to],
          },
        },
      });
    } catch (e) {
      console.log(e);

      return e;
    }
  }
}

module.exports = Entity;
