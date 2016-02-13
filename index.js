var express    = require('express');
var app        = express();
var http       = require('http');
var httpServer = http.Server(app);
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');

var jwt    = require('jsonwebtoken');
var config = require('./config');

var routes = require('./routes');

// CONFIGURATION
const port = process.env.PORT || 3005;
mongoose.connect(config.database);
app.set('superSecret', config.secret); // secret variable

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// ROUTES
var apiRoutes = express.Router();
routes(apiRoutes, app, jwt, function () {
	// apply the routes to our application with the prefix /api
	app.use('/api', apiRoutes);
});


// LAUNCH
httpServer.listen(port, function() {
	console.log('Server listening on port:' + port);
});