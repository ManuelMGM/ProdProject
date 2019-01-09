require('dotenv').config();
const express = require("express");
const app = express();
const routes = require("./routes");

const port = 3000;

app.use("/api", routes);

app.listen(port);