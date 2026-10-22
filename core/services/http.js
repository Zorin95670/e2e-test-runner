const fs = require('fs');
const http = require('http');
const https = require('https');

// Same limit as `page.request.fetch`.
const MAX_REDIRECTS = 20;
const REDIRECT_STATUSES = [301, 302, 303, 307, 308];

function send({method, target, headers, body, certificate, timeout}, redirectsLeft) {
    const tls = certificate ? {cert: fs.readFileSync(certificate.cert), key: fs.readFileSync(certificate.key)} : {};
    const client = target.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
        const options = {method, headers, timeout, rejectUnauthorized: false, ...tls};
        const request = client.request(target, options, (response) => {
            const {statusCode, headers: responseHeaders} = response;
            let text = '';

            response.setEncoding('utf8');
            response.on('data', (chunk) => {
                text += chunk;
            });
            response.on('end', () => {
                if (!REDIRECT_STATUSES.includes(statusCode) || !responseHeaders.location) {
                    resolve({
                        status: statusCode,
                        statusText: response.statusMessage,
                        headers: responseHeaders,
                        body: HttpService.parseBody(responseHeaders['content-type'], text),
                    });
                    return;
                }

                if (redirectsLeft === 0) {
                    reject(new Error(`Request to ${target} exceeded ${MAX_REDIRECTS} redirects`));
                    return;
                }

                const next = new URL(responseHeaders.location, target);
                // Like fetch: a 303, or a 301 or 302 after a POST, is followed with a GET without body.
                const toGet = statusCode === 303 || ([301, 302].includes(statusCode) && method === 'POST');

                resolve(send({
                    method: toGet ? 'GET' : method,
                    target: next,
                    headers,
                    body: toGet ? undefined : body,
                    // The client certificate is only presented to the origin it was set for.
                    certificate: next.origin === target.origin ? certificate : undefined,
                    timeout,
                }, redirectsLeft - 1));
            });
        });

        request.on('timeout', () => request.destroy(new Error(`Request to ${target} timed out`)));
        request.on('error', reject);

        if (body !== undefined) {
            request.write(body);
        }

        request.end();
    });
}

// Sends the requests that present a client certificate: neither `cy.request` nor the request context of the
// Playwright page can present one per request. Like them, it accepts self-signed server certificates and follows
// redirects.
class HttpService {
    /**
     * Body of a response with the same shape as the one of `cy.request`: a JSON body is parsed.
     */
    static parseBody(contentType, text) {
        if ((contentType || '').includes('json')) {
            try {
                return JSON.parse(text);
            } catch (e) {
                return text;
            }
        }

        return text;
    }

    /**
     * method:       string  HTTP method
     * url:          string  URL of the request
     * headers:      object  (optional) HTTP headers
     * params:       object  (optional) query parameters, appended to the URL
     * body:         string  (optional) raw body
     * certificate:  object  paths of the PEM client certificate (`cert`) and of its private key (`key`)
     * timeout:      number  (optional) time without activity on the connection, in ms, after which the request fails,
     *                       30000 by default like `cy.request` and `page.request.fetch`
     *
     * Returns the response with the same shape as the one of `cy.request`: status, statusText, headers and body,
     * a JSON body being parsed. The client certificate is presented again to the redirects on the same origin only.
     */
    requestWithClientCertificate({method, url, headers = {}, params = {}, body, certificate, timeout = 30000}) {
        const target = new URL(url);

        Object.entries(params).forEach(([key, value]) => target.searchParams.append(key, value));

        return send({method, target, headers, body, certificate, timeout}, MAX_REDIRECTS);
    }
}

module.exports = HttpService;
