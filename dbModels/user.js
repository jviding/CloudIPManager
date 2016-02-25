// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
	name: String,
	raspName: String,
	password: String,
	admin: Boolean,
	rasp: Boolean
});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);