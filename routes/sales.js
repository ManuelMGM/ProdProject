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
    const {type, amount, details} = req.body;
    if(details && details.length){
      const newSale = Sale.create({type, amount, details});
      res.send(newSale);
    } else {
      res.sendStatus(400);
    }
    
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