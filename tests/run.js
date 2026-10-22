// Starts the test front and API, then runs every feature of tests/features with the runner.
// Usage: node tests/run.js [runner options], e.g. node tests/run.js --engine=playwright
const { execFileSync, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const api = require('./api/server');
const front = require('./front/server');

const FRONT_PORT = Number(process.env.FRONT_PORT || 4280);
const API_PORT = Number(process.env.API_PORT || 4281);
const MTLS_API_PORT = Number(process.env.MTLS_API_PORT || 4282);

const DEFAULT_ENV = {
    E2E_BASE_URL: `http://localhost:${FRONT_PORT}`,
    E2E_TEST_VARIABLE: 'e2e',
    FRONT_URL: `http://localhost:${FRONT_PORT}`,
    FRONT_CROSS_ORIGIN_URL: `http://127.0.0.1:${FRONT_PORT}`,
    API_URL: `http://localhost:${API_PORT}`,
    MTLS_API_URL: `https://localhost:${MTLS_API_PORT}`,
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

// Self-signed certificates of the mutual TLS API, generated for each run: the server trusts the client certificate
// itself.
function createCertificates() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-certificates-'));

    [['server', 'localhost'], ['client', 'e2e-client']].forEach(([name, subject]) => execFileSync('openssl', [
        'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', `/CN=${subject}`,
        '-keyout', path.join(dir, `${name}.key`), '-out', path.join(dir, `${name}.crt`),
    ], { stdio: 'ignore' }));

    return dir;
}

async function main() {
    const certificates = createCertificates();
    const servers = await Promise.all([
        front.start(FRONT_PORT),
        api.start(API_PORT),
        api.startMutualTls(MTLS_API_PORT, {
            key: fs.readFileSync(path.join(certificates, 'server.key')),
            cert: fs.readFileSync(path.join(certificates, 'server.crt')),
            ca: fs.readFileSync(path.join(certificates, 'client.crt')),
        }),
    ]);
    const runner = spawn(process.execPath, [
        path.resolve(__dirname, '../index.js'),
        `--features=${path.resolve(__dirname, 'features')}`,
        ...process.argv.slice(2),
    ], {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit',
        env: {
            ...DEFAULT_ENV,
            CLIENT_CERTIFICATE: path.join(certificates, 'client.crt'),
            CLIENT_KEY: path.join(certificates, 'client.key'),
            ...process.env,
        },
    });

    runner.on('exit', (code) => {
        servers.forEach((server) => server.close());
        fs.rmSync(certificates, { recursive: true, force: true });
        process.exit(code ?? 1);
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
