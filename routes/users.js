const router = require('express').Router();
const jwt = require('jsonwebtoken');

const { protected } = require('../middlewares');
const User = require('../models/User');
const status = require('../utils/statusCodes');

router.get('/', protected, async (req, res) => {
  try {
    const users = await User.getAll();
    res.send(users);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.send({ id: newUser.id, name: newUser.username });
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.login(req.body);
    if (user) {
      jwt.sign({ user }, 'privatekey', { expiresIn: '24h' }, (err, token) => {
        if (err) {
          console.log(err);
        }
        res.send({
          id: user.id,
          token,
          id_UserType: user.userTypeId,
          username: user.username,
        });
      });
    } else {
      res.sendStatus(status.UNAUTHORIZED);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.get('/auth', async ({ token }, res) => {
  try {
    jwt.verify(token, process.env.PRIVATE_KEY, (err, authorizedData) => {
      if (err) {
        console.log('ERROR: Could not authenticate user', err.message);
        res.status(status.FORBIDDEN).send(err.message);
      } else {
        const {
          user: { id, username, id_UserType },
        } = authorizedData;
        res.send({ id, username, id_UserType, token });
      }
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

module.exports = router;
