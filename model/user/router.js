const Router = require('express').Router;
const router = new Router();
const controller = require('./controller');

const { body } = require('express-validator/check')

const role = require('../role/router');

router.use('/roles?', role);

router.route('/')
  .get((...args) => controller.find(...args))
  .post((...args) => controller.create(...args));

router.route('/check')
  .post((...args) => controller.check(...args));

router.route('/signin')
  .get((req, res) => res.render('login', {}))
  .post((...args) => controller.signin(...args));

router.route('/signup')
  .get((req, res) => res.render('register', {}))
  .post([
    body('account').exists().withMessage((value, { req }) => req.t('accountIsRequired')),
    body('account').isEmail().withMessage((value, { req }) => req.t('accountMustBeEmail')),
    body('password').isLength({ min: 6 }).withMessage((value, { req }) => req.t('pwdLengthMustMoreThan6')),
    body('password').matches(/\d/).withMessage((value, { req }) => req.t('pwdMustContainsNumber')),
    body('password').matches(/[a-z]/).withMessage((value, { req }) => req.t('pwdMustContainsLowerCaseCharactor')),
    body('password').matches(/[A-Z]/).withMessage((value, { req }) => req.t('pwdMustContainsUpperCaseCharactor')),
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
