const Router = require('express').Router;
const router = new Router();

const user = require('./model/user/router');
const qiniuToken = require('./model/qiniu-uptoken/router');

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

router.route('/api/v1').get((req, res) => {
  res.json({ message: 'Welcome to aofang-server API!' });
});

router.route('/api/v1/*').options((req, res) => {
  res.status(204).end();
});

router.use('/api/v1/users?', user);
router.use('/api/v1/qiniu-uptokens?', qiniuToken);

router.use((err, req, res, next) => {
  res.status(200).json({
    code: -1,
    msg: err.message
  })
})

module.exports = router;

