const router = require("express").Router();
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');

const User = require("../Models/User");

router.get("/", protectedMiddleware, async function(req, res) {
  try {

        const users = await User.getAll();
        res.send(users)
      
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

function protectedMiddleware(req, res, next) {
  jwt.verify(req.token, 'privatekey', async (err, authorizedData) => {
    if(err) {
      console.log('ERROR: Could not connect to the protected route.', err.message)
      res.status(403).send(err.message);
    } else {
      console.log('SUCCESS: Connect to the protected route')
      next()
    }
  })
}

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

router.post("/login", async function(req, res) {
  try {
      const user = await User.login(req.body);
      if(user) {
          jwt.sign({ user }, 'privatekey', { expiresIn: '1h' }, (err, token) => {
              if(err) { console.log(err) }
        
          res.send({id:user.id, token})
              //res.send(user)
          });
      } else {
          res.sendStatus(401)
      }
  } catch (e) {
      console.error(e);
      res.sendStatus(400);
  }
});

module.exports = router;