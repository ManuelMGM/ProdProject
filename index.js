var express = require('express');
var app = express();

const routes = require('./routes')

var port = 3000;

app.use('/api', routes);

/* app.get('/', function(req, res) {
    res.send('Hola Mundo!');
}); */

app.listen(port);