const router = require("express").Router();
const bodyParser = require('body-parser');

const User = require("../Models/User");

router.use(bodyParser.json());
router.post("/", async function(req, res) {
    try {
        const user = await User.login(req.body);
        if(user) {
            res.send(user)
        } else {
            res.sendStatus(401)
        }
    } catch (e) {
        console.error(e);
        res.sendStatus(400);
    }
  });

  module.exports = router;