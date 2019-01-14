const { Sequelize, sequelize } = require('./db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const dbUser = sequelize.define('user', {
  username: { type: Sequelize.STRING, allowNull: false },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  pwd: { type: Sequelize.STRING, allowNull: false }
});

const hashPwd = async pwd => {
  try {

    return await bcrypt.hash(pwd, saltRounds);
  } catch (e) {
    console.error(e);

    return;
  }
};

class User {
  constructor() {    
    this.create = async ({ username, email, pwd }) => {
      try {
        const hash = await hashPwd(pwd);

        return sequelize
          .sync()
          .then(() =>
            dbUser.create({
              username,
              email,
              pwd: hash
            })
          )
          .then(result => result);
      } catch (e) {
        console.error(e);
      }
    };

    this.getAll = () => {

      return dbUser.findAll({
        attributes: ["id", "username", "email"]
      });
    };

    this.login = async us => {
      try {
        const user = await dbUser.findOne({
          where: { email: us.email }
        });
        if (user) {
          const result = await bcrypt.compare(us.pwd, user.pwd);

          return result && user
        } else {
          
          return false;
        }
      } catch (e) {
        console.error(e);
      }
    };
  }
}

module.exports = new User();
