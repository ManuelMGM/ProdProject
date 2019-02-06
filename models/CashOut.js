const { Sequelize, sequelize } = require('./db');

const dbCashOut = sequelize.define('cashOut', {
  description: { type: Sequelize.TEXT, allowNull: false },
  id_User: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'usersTypes', key: 'id' },
  },
  amount: { type: Sequelize.FLOAT, validate: { min: 0 } },
});

class CashOut {
  constructor() {
    this.create = async ({ description, id_User, amount }) => {
      try {
        if (this.validateCreate({ description, id_User, amount })) {
          await sequelize.sync();

          return await dbCashOut.create({ description, id_User, amount });
        } else {
          return false;
        }
      } catch (e) {
        console.error(e);
      }
    };

    this.getAll = async () => {
      try {
        return await dbCashOut.findAll({
          attributes: ['description', 'id_User', 'amount'],
        });
      } catch (e) {
        console.log(e);
      }
    };
  }

  async delete(id) {
    try {
      const cashout = await dbCashOut.findByPk(id);
      const show = cashout;
      cashout.destroy();

      return show;
    } catch (e) {
      console.log(e);
    }
  }

  async getCashOutByRangeDates(from, to) {
    const Op = Sequelize.Op;
    try {
      return await dbCashOut.findAll({
        where: {
          createdAt: {
            [Op.between]: [from, to],
          },
        },
        attributes: ['description', 'id_User', 'amount'],
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getCheckOutSum(from, to) {
    try {
      return await sequelize.query(
        'SELECT SUM("amount") FROM "cashOuts" WHERE "createdAt" BETWEEN :from AND :to',
        { replacements: { from, to }, type: sequelize.QueryTypes.SELECT }
      );
    } catch (e) {
      console.error(e);
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
