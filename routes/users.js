const jwt = require('jsonwebtoken');

const { protected } = require('../middlewares');
const User = require('../Models/User');

const baseURL = '/api/users';

module.exports = app => {
  app.get(
    baseURL,
    async (req, res) => {
      try {
        const users = await User.getAll();
        res.send(users);
      } catch (e) {
        console.error(e);
        res.sendStatus(400);
      }
    },
    {},
    [protected]
  );

  app.post(baseURL, async (req, res) => {
    try {
      const newUser = await User.create(req.body);

      res.send({ id: newUser.id, name: newUser.username });
    } catch (e) {
      console.error(e);
      res.sendStatus(400);
    }
  });

  app.post(`${baseURL}/login`, async (req, res) => {
    try {
      const user = await User.login(req.body);
      if (user) {
        jwt.sign({ user }, 'privatekey', { expiresIn: '1h' }, (err, token) => {
          if (err) {
            console.log(err);
          }
          res.send({ id: user.id, token });
        });
      } else {
        res.sendStatus(401);
      }
    } catch (e) {
      console.error(e);
      res.sendStatus(400);
    }
  });
};
