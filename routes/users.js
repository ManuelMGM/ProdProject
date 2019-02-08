const router = require('express').Router();
const jwt = require('jsonwebtoken');

const { protected } = require('../middlewares');
const User = require('../Models/User');

router.get('/', protected, async (req, res) => {
  try {
    const users = await User.getAll();
    res.send(users);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.send({ id: newUser.id, name: newUser.username });
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
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

router.get('/auth', async ({ token }, res) => {
  try {
    jwt.verify(token, process.env.PRIVATE_KEY, (err, authorizedData) => {
      if (err) {
        console.log('ERROR: Could not authenticate user', err.message);
        res.status(403).send(err.message);
      } else {
        const {
          user: { id, username, id_UserType },
        } = authorizedData;
        res.send({ id, username, id_UserType, token });
      }
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

module.exports = router;
