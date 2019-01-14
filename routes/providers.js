const router = require('express').Router();

const { protected } = require('../middlewares');
const Provider = require('../Models/Provider');

router.get('/', protected, async (req, res) => {
  try {
    const providers = await Provider.getAll();
    res.send(providers);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.post('/', protected, async (req, res) => {
  try {
      console.log(req.body)
    const newProvider = await Provider.create(req.body);
    res.send({ id: newProvider.id,
        cuit: newProvider.cuit, 
        name: newProvider.name,
        razonSocial: newProvider.razonSocial,
        apellido: newProvider.apellido,
        email: newProvider.email });
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
})

module.exports = router;