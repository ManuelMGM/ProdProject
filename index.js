require('dotenv').config();
const app = require('restana')();
const routes = require('./routes');

const port = process.env.PORT || 3000;

// Setting routes
routes(app);

app.start(port).then(() => {
  console.log('Running on port:', port);
});
