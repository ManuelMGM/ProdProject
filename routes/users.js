const router = require("express").Router();
const bodyParser = require("body-parser");

const User = require("../Models/User");

router.get("/", async function(req, res) {
  try {
    const users = await User.getAll();
    res.send(users);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.use(bodyParser.json());
router.post("/", async (req, res) => {
  try {
    const newUser = await User.create(req.body);

    res.send({ id: newUser.id, name: newUser.username });
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

module.exports = router;
