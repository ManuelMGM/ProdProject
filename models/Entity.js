class Entity {
  constructor(dbModel) {
    this.dbModel = dbModel;
  }

  async create(entityProps) {
    try {
      await sequelize.sync();
      const result = await dbUserType.create({
        ...entityProps,
      });

      return result;
    } catch (e) {
      console.error(e);
    }
  }

  async getEntity(id) {
    try {
      return await this.dbModel.findByPk(id);
    } catch (e) {
      console.error(e);
    }
  }

  getAll() {
    return this.dbModel.findAll();
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
    }
  }
}

module.exports = Entity;
