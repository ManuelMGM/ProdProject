const router = require('express').Router();

const { protected } = require('../middlewares');
const Sale = require('../Models/Sale');

router.get('/', protected, async (req, res) => {
  try {
    const sales = await Sale.getAll();
    res.send(sales);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.post('/', protected, async (req, res) => {
  try {
      const newSale = await Sale.create(req.body);
      res.send({ number: newSale.number,
        type: newSale.cuit, 
        date: newSale.name,
        cuil: newSale.razonSocial,
        amount: newSale.apellido });
    } catch (e) {
        console.error(e);
        res.sendStatus(400);
        }
    });

router.get('/search/:number', protected, async (req, res) => {
  try {
    const sale = await Sale.getSale(req.params.number);
    res.send(sale);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
})

module.exports = router;