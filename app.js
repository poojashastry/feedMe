var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var cookieParser = require('cookie-parser');
var lib = require("./lib/feedme.js");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');

/**
 * App Homepage
 */
app.get('/', function (req, res) {
	lib.feedMe.myFeed(req, res);
});

/**
 * Register a new user
 */
app.get('/register', function(req, res) {
	res.render('register');
});

/**
 * Login a user
 */
app.get('/login', function(req,res) {
	lib.feedMe.login(req,res);
});

/**
 * Display a user's feeds
 */
app.get('/myfeed',function(req,res) {
	lib.feedMe.myFeed(req, res);
});

/**
 * Delete Feed on button click
 */
app.post('/deleteFeed',function(req,res) {
	lib.feedMe.deleteFeed(req, res);
});

/**
 * Log a user out. Destroys cookies.
 */
app.get('/logout',function(req,res) {
	lib.feedMe.logout(req, res);
});

/**
 * Fetch feeds from DB.
 */
app.get('/getFeeds',function(req,res) {
	lib.feedMe.getFeeds(req, res);
});

/**
 * Save feeds addes by user into DB.
 */
app.post('/saveFeeds',function(req,res) {
	console.log(req.body);
	lib.feedMe.saveFeeds(req, res);
});

/**
 * Authenticate user credentials.
 */
app.post('/loginUser',function(req,res) {
	lib.feedMe.loginUser(req, res);
});

/**
 * Add new user to DB.
 */
app.post('/registerUser', function(req,res){
	lib.feedMe.registerUser(req, res);
});

/**
 * Fire up the application.
 */
app.listen(3000, function () {
  console.log('Feed me booting');
});