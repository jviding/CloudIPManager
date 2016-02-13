var User = require('./dbModels/user');
var IP   = require('./dbModels/ip');

module.exports = function(apiRoutes, app, jwt, callback) {
	
	// API ROUTES

	// route to set external IP address of raspberry
	apiRoutes.get('/setip', function (req, res) {
	//apiRoutes.post('/setip', function (req, res) {
		// get IP from req
		var ip = req.headers['x-forwarded-for'];
		res.json({ message: 'Welcome to the coolest API on earth!', ip: ip });
	});

	// route to authenticate a user
	/*apiRoutes.post('/authenticate', function (req, res) {
		// find the user
		User.findOne({
			name: req.body.name
		}, function(err, user) {
			if (err) throw err;
			if (!user) {
				res.json({ success: false, message: 'Authentication failed. User not found.'});
			} else if (user) {
				// check if password matches
				if (user.password != req.body.password) {
					res.json({ success: false, message: 'Authentication failed. Wrong password.'});
				} else {
					// user found and password is right
					// create a token
					var token = jwt.sign(user, app.get('superSecret'), {
						expiresInMinutes: 1440 // expires in 24 hours
					});
					console.log(token);
					// return the information including token as JSON
					res.json({
						success: true,
						message: 'Enjoy your token!',
						token: token
					});
				}
			}
		});
	});

	// route middleware to verify a token
	apiRoutes.use(function (req, res, next) {
		// check header or url parameters or post parameters for token
		var token = req.body.token || req.query.token || req.headers['x-access-token'];
		// decode token
		if (token) {
			// verifies secret and checks exp
			jwt.verify(token, app.get('superSecret'), function(err, decoded) {
				if (err) {
					return res.json({ success: false, message: 'Failed to authenticate token.' });
				} else {
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;
					next();
				}
			});
		} else {
			// there is no token, return an error
			return res.status(403).send({
				success: false,
				message: 'No token provided.'
			});
		}
	});

	// ROUTES REQUIRING AN AUTHENTICATION

	// route to show a random message (GET http://localhost:8080/api/)
	apiRoutes.get('/', function (req, res) {
	  res.json({ message: 'Welcome to the coolest API on earth!' });
	});

	// route to return all users (GET http://localhost:8080/api/users)
	apiRoutes.get('/users', function (req, res) {
  		User.find({}, function (err, users) {
    		res.json(users);
  		});
	});

	// route to get external IP address of raspberry
	apiRoutes.get('/getip', function (req, res) {

	});

	// route to set external IP address of raspberry
	/*apiRoutes.post('/setip', function (req, res) {
		// get IP from req
		var ip = req.headers['x-forwarded-for'];
		console.log(ip);
	});*/

	callback();
};