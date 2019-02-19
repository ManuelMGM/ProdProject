const router = require('express').Router();

const { protected } = require('../middlewares');
const Provider = require('../models/Provider');
const status = require('../utils/statusCodes');

router.get('/', protected, async (req, res) => {
  try {
    const providers = await Provider.getAll();
    res.send(providers);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.get('/search/:id', protected, async (req, res) => {
  try {
    const provider = await Provider.getEntity(req.params.id);
    res.send(provider);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.get('/:id/products', protected, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      const productsList = await Provider.getProductsByProvider(id);
      res.send(productsList);
    } else {
      res.status(status.BAD_REQUEST).send('Type of "id" does not match.');
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newProvider = await Provider.create(req.body);
    res.send({
      id: newProvider.id,
      cuit: newProvider.cuit,
      name: newProvider.name,
      razonSocial: newProvider.razonSocial,
      apellido: newProvider.apellido,
      email: newProvider.email,
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.put('/:providerId', protected, async (req, res, next) => {
  try {
    if (req.params.providerId) {
      const provider = await Provider.updateEntity(req.body);
      provider
        ? res.send(provider)
        : res.status(status.BAD_REQUEST).send('Validate properties values.');
    } else {
      res.send({});
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

module.exports = router;
