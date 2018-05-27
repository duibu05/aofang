const Router = require('express').Router;
const router = new Router();

const user = require('./model/user/router');
const qiniuToken = require('./model/qiniu-uptoken/router');
const passportConf = require('./config-passport');

/**
 * clear empty param in req.query
 */
router.use((req, res, next) => {
  const propNames = Object.getOwnPropertyNames(req.query);
  for (let i = 0, len = propNames.length; i < len; i++) {
    const propName = propNames[i];
    if (req.query[propName] === '' || req.query[propName] === null || req.query[propName] === undefined) {
      delete req.query[propName];
    }
  }
  next();
})

/**
 * auth middleware
 */
/* router.use((req, res, next) => {
  if (req.app.get('noNeedAuthPath').has(req.path)) return next()
  console.log('req.isAuthenticated():', req.isAuthenticated())
  if (!req.isAuthenticated()) {
    return res.redirect('/user/signin');
  }
  next()
}) */

router.route('/').get(passportConf.isAuthenticated, (req, res) => {
  res.render('index', { })
});

router.route('/find').get(passportConf.isAuthenticated, (req, res) => {
  res.render('find', { })
})

router.use('/users?', user);
router.use('/qiniu-uptokens?', qiniuToken);

router.use((err, req, res, next) => {
  res.status(200).json({
    code: -1,
    msg: err.message
  })
})

module.exports = router;

