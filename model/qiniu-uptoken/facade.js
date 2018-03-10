const Facade = require('../../lib/facade');
const qiniuUpTokenSchema = require('./schema');

class QiniuUpTokenFacade extends Facade {}

module.exports = new QiniuUpTokenFacade('QiniuUpToken', qiniuUpTokenSchema);
