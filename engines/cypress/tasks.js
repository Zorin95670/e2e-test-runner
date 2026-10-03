const LogService = require('../../core/services/log');
const KafkaService = require('../../core/services/kafka');
const LdapService = require('../../core/services/ldap');
const DbService = require('../../core/services/db');

function registerInstance(instance) {
    const tasks = {};
    for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(instance))) {
        if (name !== 'constructor' && typeof instance[name] === 'function') {
            tasks[name] = instance[name].bind(instance);
        }
    }
    return tasks;
}

module.exports = function setupTasks(on) {
    on('task', {
        ...registerInstance(new LogService()),
        ...registerInstance(new KafkaService()),
        ...registerInstance(new LdapService()),
        ...registerInstance(new DbService()),
    });
};
