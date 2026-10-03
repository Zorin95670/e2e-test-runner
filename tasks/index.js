const LogTasks = require('./log');
const KafkaTasks = require('./kafka');
const LdapTasks = require('./ldap');
const DbTasks = require('./db');

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
        ...registerInstance(new LogTasks()),
        ...registerInstance(new KafkaTasks()),
        ...registerInstance(new LdapTasks()),
        ...registerInstance(new DbTasks()),
    });
};
