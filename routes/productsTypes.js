const router = require('express').Router();

const { protected } = require('../middlewares');
const ProductType = require('../models/ProductType');
const SaleDetail = require('../models/SaleDetail');
const status = require('../utils/statusCodes');
const isBefore = require('date-fns/is_before');
const { stringToDate } = require('../utils/dates');

router.get('/', protected, async (req, res) => {
  try {
    const productsTypes = await ProductType.getAll();
    res.send(productsTypes);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newType = await ProductType.create(req.body);
    res.send({ description: newType.description });
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.get('/search/:description', protected, async (req, res) => {
  try {
    const productType = await ProductType.getAllByKey(req.params.description);
    res.send(productType);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.get('/:productTypeId/sales', async (req, res) => {
  try {
    const { productTypeId } = req.params;
    const { from, to } = req.query;
    if (productTypeId) {
      const fromDate = from && stringToDate(from);
      const toDate = to && stringToDate(to);
      const datesAreValid = (!from && !to) || isBefore(fromDate, toDate);
      if (datesAreValid) {
        const sales = await SaleDetail.getSaleDetailsByRangeAndProductTypeId(
          productTypeId,
          fromDate,
          toDate
        );

        const sum = await SaleDetail.getSaleDetailSumWithProductTypeByRange(
          productTypeId,
          fromDate,
          toDate
        );

        res.send({ sum, sales });
      } else {
        res.status(status.BAD_REQUEST).send('Verify dates.');
      }
    } else {
      res.send({});
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

module.exports = router;
