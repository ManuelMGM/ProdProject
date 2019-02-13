const { Sequelize, sequelize } = require('./db');
const { isString, isNum } = require('../utils/validate');
const Entity = require('./Entity');
const User = require('./User');

const dbCashOut = sequelize.define('cashOuts', {
  description: { type: Sequelize.TEXT, allowNull: false },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'id_User',
    references: { model: 'users', key: 'id' },
  },
  amount: { type: Sequelize.FLOAT, validate: { min: 0 } },
});

class CashOut extends Entity {
  constructor() {
    super(dbCashOut);
    this.create = async ({ description, id_User, amount }) => {
      try {
        if (this.validateCreate({ description, id_User, amount })) {
          await sequelize.sync();

          return await dbCashOut.create({ description, id_User, amount });
        } else {
          throw new Error('Validate Data Type.');
        }
      } catch (e) {
        console.error(e);
      }
    };
  }
  async getAll() {
    try {
      User.dbModel.hasMany(dbCashOut);
      this.dbModel.belongsTo(User.dbModel);
      return await this.dbModel.findAll({
        include: [User.dbModel],
      });
    } catch (e) {
      throw e;
    }
  }

  async getCheckOutSum(from, to) {
    try {
      const [response] = await sequelize.query(
        'SELECT SUM("amount") FROM "cashOuts" WHERE "createdAt" BETWEEN :from AND :to',
        { replacements: { from, to }, type: sequelize.QueryTypes.SELECT }
      );

      return response.sum || 0;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async validateCreate({ description, id_User, amount }) {
    try {
      if (
        description &&
        id_User &&
        amount &&
        isString(description) &&
        isNum(amount) &&
        amount > 0
      ) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = new CashOut();
