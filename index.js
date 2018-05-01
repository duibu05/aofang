const express = require('express');
const helmet = require('helmet');
const bluebird = require('bluebird');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');

/**
 * Load environment variables from .env file to process.env, where API keys and passwords and so on are configured.
 */
dotenv.load({ path: '.env.aofang' });

/**
 * Passport configuration.
 */
const passportConfig = require('./config/passport');

const config = require('./config');
const routes = require('./routes');

const app  = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = bluebird;
mongoose.connect(config.mongo.url, { useMongoClient: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  process.exit();
});


/**
 * Express configuration.
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'xtpl');

app.use(expressStatusMonitor());

app.use(helmet());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(expressValidator());

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true,
    clear_interval: 3600
  })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

/**
 * After successful login, redirect back to the intended page
 */
app.use((req, res, next) => {
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path === '/account') {
    req.session.returnTo = req.path;
  }
  next();
});

/**
 * Morgan configuration
 */
app.use(morgan('dev'));

/**
 * Use errorHandler in dev mode
 */
if (/^dev/.test(process.env)) {
  app.use(errorHandler());
}

/**
 * Cross origin configuration
 */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.header('Origin'));
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,x-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

/**
 * Routes configuration
 */
app.use('/', routes);

/**
 * Start server
 */
app.listen(config.server.port, () => {
  console.log(`Magic happens on port ${config.server.port}`);
});

module.exports = app;
