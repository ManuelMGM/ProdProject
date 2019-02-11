const { Sequelize, sequelize } = require('./db');
const Entity = require('./Entity');

const dbUserType = sequelize.define('usersTypes', {
  description: { type: Sequelize.STRING, allowNull: false, unique: true },
});

class UserType extends Entity {
  constructor() {
    super(dbUserType);

    this.getUserType = description => {
      return dbUserType.findAll({
        where: { description },
        attributes: ['id', 'description'],
      });
    };
  }
}

module.exports = new UserType();
