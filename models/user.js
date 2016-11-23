var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); // to hash password

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	}
});

//variable to be access outside of this file
var User = module.exports = mongoose.model('User', UserSchema);

//hash the password - ref: https://github.com/dcodeIO/bcrypt.js
module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash; //save the password hash
	        newUser.save(callback);
	    });
	});
};

//mongoose methods - http://mongoosejs.com/docs/queries.html
module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
};


//ref - https://github.com/dcodeIO/bcrypt.js
module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
};
