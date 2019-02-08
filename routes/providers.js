const router = require('express').Router();

const { protected } = require('../middlewares');
const Provider = require('../models/Provider');

router.get('/', protected, async (req, res) => {
  try {
    const providers = await Provider.getAll();
    res.send(providers);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.get('/search/:id', protected, async (req, res) => {
  try {
    const provider = await Provider.getProvider(req.params.id);
    res.send(provider);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.get('/:id/products', protected, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      const productsList = await Provider.getProductsByProvider(id);
      res.send(productsList);
    } else {
      res.status(400).send('Type of "id" does not match.');
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
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
    res.sendStatus(400);
  }
});

router.put('/:providerId', protected, async (req, res, next) => {
  try {
    if (req.params.providerId) {
      const provider = await Provider.updateProvider(req.body);
      provider
        ? res.send(provider)
        : res.status(400).send('Validate properties values.');
    } else {
      res.send({});
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

module.exports = router;
