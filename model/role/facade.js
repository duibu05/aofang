const Facade = require('../../lib/facade');
const roleSchema = require('./schema');

class RoleFacade extends Facade {}

module.exports = new RoleFacade('Role', roleSchema);
