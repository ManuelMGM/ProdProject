const { Sequelize, sequelize } = require('./db');

const dbUserType = sequelize.define('usersTypes', {
  description: { type: Sequelize.STRING, allowNull: false, unique: true },
});

class UserType {
  constructor() {
    this.create = async ({ description }) => {
      try {
        await sequelize.sync();
        const result = await dbUserType.create({
          description,
        });

        return result;
      } catch (e) {
        console.error(e);
      }
    };

    this.getAll = () => {
      return dbUserType.findAll({
        attributes: ['id', 'description'],
      });
    };

    this.getUserType = description => {
      return dbUserType.findAll({
        where: { description },
        attributes: ['id', 'description'],
      });
    };
  }
}

module.exports = new UserType();
