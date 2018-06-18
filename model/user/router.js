const controller = require('./controller');
const Router = require('express').Router;
const router = new Router();

const { body } = require('express-validator/check')

const role = require('../role/router');

router.use('/roles?', role);

router.route('/')
  .get((...args) => controller.find(...args))
  .post((...args) => controller.create(...args));

router.route('/check')
  .post((...args) => controller.check(...args));

router.route('/signin')
  .get((...args) => controller.renderSignInPage(...args))
  .post((...args) => controller.signin(...args));

router.route('/signup')
  .get((req, res) => res.render('register', {}))
  .post([
    body('account').exists().withMessage('账户为必填项！'),
    body('account').isEmail().withMessage('账户必须为邮箱格式！'),
    body('password').isLength({ min: 6 }).withMessage('密码不能少于6位！'),
    body('password').matches(/\d/).withMessage('密码必须包含数字！'),
    body('password').matches(/[a-z]/).withMessage('密码必须包含一个小写英文字母！'),
    body('password').matches(/[A-Z]/).withMessage('密码必须包含一个大写英文字母！'),
  ], (...args) => controller.create(...args))

router.route('/signout')
  .get((...args) => controller.signout(...args));

router.route('/reset-password/:id')
  .put((...args) => controller.resetPwd(...args))
  .post((...args) => controller.checkPwd(...args));

router.route('/token/:token')
  .get((...args) => controller.findByToken(...args))

router.route('/:id')
  .put((...args) => controller.update(...args))
  .get((...args) => controller.findById(...args))
  .delete((...args) => controller.remove(...args));

module.exports = router;
