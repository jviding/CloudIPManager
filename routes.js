var User      = require('./dbModels/user');
var IP        = require('./dbModels/ip');

module.exports = function(apiRoutes, app, jwt, callback) {
	
	// API ROUTES

	// ROUTES NOT REQUIRING AN AUTHENTICATION
	apiRoutes.get('/', function (req, res) {
		var ip = req.headers['X-Real-IP'] 
			|| req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	  	res.json({ message: 'Welcome to the mrJasu cloudIP api! Your IP:', ip: ip });
	});

	// route to authenticate a user
	apiRoutes.post('/authenticate', function (req, res) {
		// find the user
		User.findOne({
			name: req.body.name
		}, function(err, user) {
			if (err) throw err;
			if (!user) {
				res.json({ success: false, message: 'Authentication failed. User not found.' });
			} else if (user) {
				// check if password matches
				if (user.password != req.body.password) {
					res.json({ success: false, message: 'Authentication failed. Wrong password.' });
				} else {
					// user found and password is right
					// create a token
					var token = jwt.sign(user, app.get('superSecret'), {
						expiresInMinutes: 1440 // expires in 24 hours
					});
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

	// route to get external IP address of raspberry
	apiRoutes.get('/getip', function (req, res) {
		IP.findOne({ owner: req.decoded['_doc'].name }, function (err, ipAddr) {
			if (ipAddr) {
				res.json({ 
					name:       ipAddr.raspName, 
					ip:         ipAddr.ip, 
					lastUpdate: ipAddr.lastUpdate 
				});
			} else {
				res.json({ success: false });
			}
		});
	});

	// route to set external IP address (for RaspBerry only)
	apiRoutes.get('/setip', function (req, res) {
		// get IP from request
		var ip = req.headers['X-Real-IP'] 
			|| req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		// check it's RaspBerry
		if (req.decoded['_doc'].rasp === true) {
			// check if IP has changed
			IP.findOne({ raspName: req.body.name }, function (err, ipAddr) {
				// if new IP, update
				if (ip !== ipAddr.ip) {
					ipAddr.ip = ip;
				}
				ipAddr.lastUpdate = Date.now();
				ipAddr.save();
				res.json({ success: true });
			});
		} else {
			res.json({ success: false, message: 'No authorization for attempted action.' });
		}
	});

	callback();
};