var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

//db model- schema
var User = require('../models/user');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

//validation
	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else { //if validation passed - new user
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
		});

		//call the new user function from the model
		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		//sucess message and redirect
		req.flash('success_msg', 'You are registered and can now login');
		res.redirect('/users/login');
	}
});

//call the model getUserByUsername
passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'This user is not registered'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

//ref - http://passportjs.org/docs/basic-digest
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

//local strategy for local db: ref- https://github.com/jaredhanson/passport-local
router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/'); //redirect to dashboard home poge
		//console.log(user.name + " successfully login");
  });

//for logout - end session
//ref - http://passportjs.org/docs/basic-digest
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
	//console.log(user.name + ' has logged out');
});

/*
app.post('/login',
	passport.authenticate('local', {successRedirect:'/', failureRedirect:'users/login',
	function(req, res){
		res.redirect('/');
});
*/

//export this route
module.exports = router;