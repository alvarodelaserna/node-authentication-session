var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

mongoose.connect(configDB.url); // connect to our DB

require('./config/passport.js')(passport); // pass passport por configuration

// load necessary files from '/public' folder
app.use(express.static(__dirname + '/public'));

// set up express
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (for auth)
app.use(bodyParser()); // get info from html forms

app.set('view-engine', 'ejs'); // ejs templating

// passport
app.use(session({
	cookieName: 'abracadabra',
	secret: 'who{34.-{;kjhgfdgh}+]likesQG3;;shortsh[{orts', // session secret
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000, // miliseconds
	httpOnly: true, // prevents browser JavaScript from accessing cookies
	secure: true, // ensures cookies are ONLY used over HTTPS
	ephemeral: true // deletes the cookie when the browser is closed
})); 

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes
require('./app/routes.js')(app, passport); // load routes and pass in our app and configured passport

// launch
app.listen(port);
console.log('Magic happening on port ' + port);