const fs = require('fs');
const http = require('http');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const CONTENT_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
};

function handle(req, res) {
    const { pathname } = new URL(req.url, 'http://localhost');
    const file = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

    if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('Not found');
        return;
    }

    res.writeHead(200, { 'content-type': CONTENT_TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
}

function start(port) {
    return new Promise((resolve) => {
        const server = http.createServer(handle);

        server.listen(port, () => resolve(server));
    });
}

if (require.main === module) {
    const port = Number(process.env.FRONT_PORT || 4280);

    start(port).then(() => console.log(`Front listening on http://localhost:${port}`));
}

module.exports = { start };
