const { Sequelize, sequelize } = require('./db');
const Entity = require('./Entity');
const Sale = require('./Sale');
const CashOut = require('./CashOut');

const { isNum } = require('../utils/validate');

const dbCashShift = sequelize.define('cashShifts', {
  existingAmount: {
    type: Sequelize.FLOAT,
    allownull: false,
    validate: { min: 0 },
  },
  salesSum: {
    type: Sequelize.FLOAT,
    allownull: false,
    validate: { min: 0 },
  },
  cashOutSum: {
    type: Sequelize.FLOAT,
    allownull: false,
    validate: { min: 0 },
    defaultValue: 0,
  },
  userId: {
    type: Sequelize.INTEGER,
    allownull: false,
    field: 'id_User',
    references: { model: 'users', key: 'id' },
  },
  observation: { type: Sequelize.TEXT },
});

const getPreviousShift = () => {
  const eightHours = 60 * 60 * 8 * 1000;

  return new Date(Date.now() - eightHours).toISOString();
};

class CashShift extends Entity {
  constructor() {
    super(dbCashShift);
  }

  async create({ existingAmount, id_User, observation }) {
    if (this.validateCreate({ existingAmount, id_User })) {
      const fromPromise = this.getLastCloseShift();

      return fromPromise
        .then(async fromDate => {
          try {
            const from = fromDate.length
              ? fromDate[0].createdAt
              : getPreviousShift();

            await sequelize.sync();
            const salesSum =
              (await Sale.getCashSalesSum(from, new Date().toISOString())) || 0;
            const cashOutSum =
              (await CashOut.getCheckOutSum(from, new Date().toISOString())) ||
              0;

            return await this.dbModel.create({
              existingAmount,
              salesSum,
              cashOutSum,
              userId: id_User,
              observation,
            });
          } catch (e) {
            throw e;
          }
        })
        .catch(error => {
          console.error(error);
          throw Error(error);
        });
    } else {
      throw new Error('Invalid Data Type.');
    }
  }

  getLastCloseShift() {
    try {
      return this.dbModel.findAll({
        order: [['id', 'DESC']],
        limit: 1,
      });
    } catch (e) {
      throw e;
    }
  }

  validateCreate({ existingAmount, id_User }) {
    return isNum(existingAmount) && isNum(id_User);
  }

  getClosestShift() {
    try {
      return this.dbModel.findAll({
        order: [['id', 'DESC']],
        include: [User.dbModel],
        limit: 10,
      });
    } catch (e) {
      throw e;
    }
  }
}

module.exports = new CashShift();

const User = require('./User');

User.dbModel.hasMany(dbCashShift);
dbCashShift.belongsTo(User.dbModel);
