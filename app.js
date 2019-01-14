const express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  cons = require('consolidate'),
  dust = require('dustjs-helpers'),
  flash = require('connect-flash'),
  session = require('express-session'),
  passport = require('passport'),
  mongoose = require('mongoose');

let app = express();

// Load routes
const recipes = require('./routes/recipes');
const users = require('./routes/users');

// Passport config
require('./config/passport')(passport);

// Connect to MongoDb
mongoose
  .connect('mongodb://localhost/recipebook')
  .then(() => console.log('MongoDb Connected...'))
  .catch(err => console.log(err));

// Assign Dust Engine To .dust Files
app.engine('dust', cons.dust);

// Set Default ext .dust
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Method Override Middleware
app.use(methodOverride('_method'));

// Express Session Middleware
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Middleware
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Use routes
app.use('/', recipes);
app.use('/users', users);

// Server
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server started on port: ' + port);
  console.log('http://localhost:' + port);
});
