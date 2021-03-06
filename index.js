const express = require('express');
const helmet = require('helmet');
const bluebird = require('bluebird');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
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
const i18n = require("i18n");

/**
 * Load environment variables from .env file to process.env, where API keys and passwords and so on are configured.
 */
dotenv.load({ path: '.env.aofang' });

/**
 * Passport configuration.
 */
const passportConfig = require('./config-passport');

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
app.set('views', path.join(__dirname, 'views', 'pages'));
app.set('view engine', 'xtpl');
app.set('noNeedAuthPath', new Set(['/user/signin', '/user/signup']));

app.use(expressStatusMonitor());

app.use(helmet());

app.use(cookieParser());

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

app.use((req, res, next) => {
  const languages = [ 'en', 'es-ES', 'ja-JP', 'ko-KR', 'zh-CN' ]
  var locale;
  //配置i18n
  i18n.configure({
    directory: __dirname + '/locales',
    extension: '.json',
    queryParameter: 'lang',
    cookie: 'locale',
    register: req,
    defaultLocale: 'en',
    api: {
      '__': 't',
      '__n': 'tn'
    }
  });

  if(req.query.lang) {
    locale = req.query.lang
    res.cookie('locale',locale, { httpOnly: true });
  } else if(req.cookies['locale']){ //客户端可以通过修改cookie进行语言切换控制
    locale = req.cookies['locale'];
  } else if(req.acceptsLanguages()){
    locale = req.acceptsLanguages()[0];
  }

  if(!~languages.indexOf(locale)) {
    locale = 'en';
  }
  // 设置i18n对这个请求所使用的语言
  res.setLocale(req, locale);
  next();
});

/**
 * After successful login, redirect back to the intended page
 */
app.use((req, res, next) => {
  if(req.user && (
    req.path === '/user/signin' ||
    req.path === '/user/signup')) {
    return res.redirect('/');
  }
  
  if (!req.user &&
    req.path !== '/user/signin' &&
    req.path !== '/user/check' &&
    req.path !== '/user/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
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
