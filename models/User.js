const { Sequelize, sequelize } = require("./db");

const dbUser = sequelize.define("user", {
  username: { type: Sequelize.STRING, allowNull: false },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  psw: { type: Sequelize.STRING, allowNull: false }
});

class User {
  constructor() {
    this.create = ({ username, email, psw }) => {
      return sequelize
        .sync()
        .then(() =>
          dbUser.create({
            username,
            email,
            psw
          })
        )
        .then(result => result);
    };

    this.getAll = () => {
      return dbUser.findAll({
        attributes: ["id", "username", "email"]
      });
    };
  }
}

module.exports = new User();
