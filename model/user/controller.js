const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const _ = require('lodash');
const passport = require('passport');
const { validationResult } = require('express-validator/check');
const Controller = require('../../lib/controller');
const userFacade = require('./facade');
const roleFacade = require('../role/facade')

class UserController extends Controller {
  signin(req, res, next) {
    const self = this
    this.facade.findOne({ account: req.body.account })
      .then(result => {
        if (result) {
          result.comparePassword(req.body.password, (err, isMatch) => {
            if (err) next(err);
            if (isMatch) {
              // passport
              passport.authenticate('local', (err, user, info) => {
                if (err) return next(err);
                if (!user) return next(info);

                req.logIn(user, (err) => {
                  if (err) return next(err);

                  return res.json({
                    code: 0,
                    msg: 'ok',
                    data: {
                      returnTo: req.session.returnTo || '/'
                    }
                  })
                });
              })(req, res, next);
            } else {
              return res.json({
                code: -1,
                msg: '账号或密码错误！'
              });
            }
          });
        } else {
          return res.json({
            code: -1,
            msg: '账号或密码错误！'
          });
        }
      })
  }

  signout(req, res, next) {
    this.facade.update({ token: '' })
      .then(() => {
        return res.json({
          code: 0,
          msg: 'ok'
        })
      })
  }

  check(req, res, next) {
    this.facade.findOne({ account: req.body.account })
    .then(user => {
      if(user) {
        return res.json({
          code: -1,
          msg: '用户已存在！'
        })
      }

      return res.json({
        code: 0,
        msg: 'ok!'
      })
    })
    .catch(err => {
      return res.json({
        code: -1,
        msg: '请求异常！'
      })
    })
  }

  create(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        code: -1,
        msg: `bad request: ${errors.array()[0].msg}`,
        data: errors.array()
      });
    }

    this.facade.findOne({ account: req.body.account })
      .then(user => {
        if(user) {
          return res.json({
            code: -1,
            msg: '用户已存在！'
          })
        }

        this.facade.create(req.body)
          .then(user => {
            delete user.password
            return res.json({
              code: 0,
              msg: 'ok',
              data: user
            })
          })
          .catch(err => {
            return res.json({
              code: -1,
              msg: `请求异常: ${err.message}`
            })
          })
      })
      .catch(err => {
        return res.json({
          code: -1,
          msg: `请求异常: ${err.message}`
        })
      })
  }

  findByToken(req, res, next) {
    this.facade.findOne({token: req.params.token})
      .then(doc => {
        doc.password = ''
        roleFacade.findOne({name: doc.role.name}).then(role => {
          return res.status(200).json({ code:0, data: {user:doc, role:role} });
        })
      })
      .catch(err => next(err));
  }

  resetPwd(req, res, next) {
    this.facade.model.hashPassword(req.body.password).then(result => {
      req.body.password = result;
      req.body.token = '';
      this.facade.update({ _id: req.params.id }, req.body)
      .then((results) => {
        if (results.n < 1) { return res.json({code: -1, msg: '无相应记录！'}); }
        if (results.nModified < 1) { return res.json({code: -1, msg: '修改失败！'}); }
        return res.json({ code: 0, msg: 'ok' });
      })
      .catch(err => next(err));
    });
  }

  checkPwd(req, res, next) {
    this.facade.findById(req.params.id)
      .then(result => {
        if (result) {
          result.comparePassword(req.body.password, (err, isMatch) => {
            if (err) next(err);
            if (isMatch) {
              return res.json({
                code: 0
              });
            } else {
              return res.json({
                code: -1,
                msg: '旧密码不正确！'
              });
            }
          });
        }
      })
  }
}

module.exports = new UserController(userFacade);
