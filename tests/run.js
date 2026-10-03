// Starts the test front and API, then runs every feature of tests/features with the runner.
// Usage: node tests/run.js [runner options], e.g. node tests/run.js --engine=playwright
const { spawn } = require('child_process');
const path = require('path');
const api = require('./api/server');
const front = require('./front/server');

const FRONT_PORT = Number(process.env.FRONT_PORT || 4280);
const API_PORT = Number(process.env.API_PORT || 4281);

const DEFAULT_ENV = {
    E2E_BASE_URL: `http://localhost:${FRONT_PORT}`,
    E2E_TEST_VARIABLE: 'e2e',
    FRONT_URL: `http://localhost:${FRONT_PORT}`,
    FRONT_CROSS_ORIGIN_URL: `http://127.0.0.1:${FRONT_PORT}`,
    API_URL: `http://localhost:${API_PORT}`,
    DB_HOST: 'localhost',
    DB_USER: 'postgres',
    DB_PASSWORD: 'postgres',
    DB_NAME: 'postgres',
    KAFKA_BROKER: 'localhost:59092',
    // Unique topic, so messages from previous runs are not received.
    KAFKA_TOPIC: `e2e-${Date.now()}`,
    LDAP_URL: 'ldap://localhost:50389',
    LDAP_BIND_DN: 'cn=admin,dc=example,dc=org',
    LDAP_PASSWORD: 'admin',
    LDAP_BASE_DN: 'dc=example,dc=org',
};

async function main() {
    const servers = await Promise.all([front.start(FRONT_PORT), api.start(API_PORT)]);
    const runner = spawn(process.execPath, [
        path.resolve(__dirname, '../index.js'),
        `--features=${path.resolve(__dirname, 'features')}`,
        ...process.argv.slice(2),
    ], {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit',
        env: { ...DEFAULT_ENV, ...process.env },
    });

    runner.on('exit', (code) => {
        servers.forEach((server) => server.close());
        process.exit(code ?? 1);
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
