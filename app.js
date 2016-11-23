var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHdbrs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

//mongo db connection
mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

//check connect-flashmongoose.Promise = global.Promise;
//mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});


//routes
var routes = require('./routes/index');
var users = require('./routes/users');

//the app
var app = express();

//the views
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', expressHdbrs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'fair is foul and foul is fair',
    saveUninitialized: true,
    resave: true
}));

// Call passport and initialize - reference: https://github.com/jaredhanson/passport
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root  = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global variables for flash messages yay
app.use(function (request, response, next) {
  response.locals.success_msg = request.flash('success_msg');
  response.locals.error_msg = request.flash('error_msg');
  response.locals.error = request.flash('error');
  response.locals.user = request.user || null;
  next();
});

//use the routes
app.use('/', routes);
app.use('/users', users);

// Set Port 3000
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server is running on port '+app.get('port'));
});
