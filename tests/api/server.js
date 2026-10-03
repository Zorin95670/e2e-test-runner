const http = require('http');

const USERS = [
    { id: 1, name: 'John', age: 30, admin: true },
    { id: 2, name: 'Jane', age: 25, admin: false },
    { id: 3, name: 'Bob', age: 42, admin: false },
];

function send(res, status, body, headers = {}) {
    res.writeHead(status, {
        'content-type': 'application/json',
        'x-api-version': '1.0.0',
        ...headers,
    });
    res.end(body === undefined ? '' : JSON.stringify(body));
}

function readBody(req) {
    return new Promise((resolve) => {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => resolve(body));
    });
}

async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const body = await readBody(req);
    const userMatch = url.pathname.match(/^\/users\/(\d+)$/);
    const statusMatch = url.pathname.match(/^\/status\/(\d{3})$/);

    if (url.pathname === '/echo') {
        return send(res, 200, {
            method: req.method,
            query: Object.fromEntries(url.searchParams),
            headers: req.headers,
            body,
        }, { 'x-request-id': 'e2e-request-id' });
    }

    if (url.pathname === '/users' && req.method === 'GET') {
        return send(res, 200, USERS);
    }

    if (url.pathname === '/users' && req.method === 'POST') {
        let user;

        try {
            user = JSON.parse(body);
        } catch (e) {
            return send(res, 400, { error: 'Invalid JSON body' });
        }

        return send(res, 201, { id: USERS.length + 1, ...user });
    }

    if (userMatch && req.method === 'GET') {
        const user = USERS.find(({ id }) => id === Number(userMatch[1]));

        return user ? send(res, 200, user) : send(res, 404, { error: 'User not found' });
    }

    if (userMatch && req.method === 'DELETE') {
        return send(res, 204);
    }

    if (statusMatch) {
        return send(res, Number(statusMatch[1]), { status: Number(statusMatch[1]) });
    }

    if (url.pathname === '/secured') {
        return req.headers.authorization === 'Bearer e2e-token'
            ? send(res, 200, { authenticated: true })
            : send(res, 401, { authenticated: false });
    }

    return send(res, 404, { error: 'Not found' });
}

function start(port) {
    return new Promise((resolve) => {
        const server = http.createServer(handle);

        server.listen(port, () => resolve(server));
    });
}

if (require.main === module) {
    const port = Number(process.env.API_PORT || 4281);

    start(port).then(() => console.log(`API listening on http://localhost:${port}`));
}

module.exports = { start };
