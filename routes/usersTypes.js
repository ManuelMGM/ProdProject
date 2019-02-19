const router = require('express').Router();

const { protected } = require('../middlewares');
const UserType = require('../models/UserType');
const status = require('../utils/statusCodes');

router.get('/', protected, async (req, res) => {
  try {
    const usersTypes = await UserType.getAll();
    res.send(usersTypes);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newType = await UserType.create(req.body);
    res.send({ description: newType.description });
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.get('/search/:description', protected, async (req, res) => {
  try {
    const userType = await UserType.getAllByKey(req.params.description);
    res.send(userType);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

module.exports = router;
