require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./routes');

const port = process.env.PORT || 3000;

app.use('/api', routes);

app.listen(port, () => {
  console.log('Running on port:', port);
});
