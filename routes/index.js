const router = require("express").Router();
const users = require("./users");
const login = require("./login");
const { Token } = require("../utils");

// Inserting Bearer token value to request object. Ej: req.token
router.use(
  Token({
    headerKey: "Bearer"
  })
);
router.use("/users", users);
router.use("/login", login);

module.exports = router;
