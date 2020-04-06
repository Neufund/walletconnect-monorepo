"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = tslib_1.__importDefault(require("events"));
const xhr2_cookies_1 = require("xhr2-cookies");
// -- global -------------------------------------------------------------- //
const _window = window;
const XHR = typeof _window !== "undefined" && typeof _window.XMLHttpRequest !== "undefined"
    ? _window.XMLHttpRequest
    : xhr2_cookies_1.XMLHttpRequest;
// -- HttpConnection ------------------------------------------------------ //
class HTTPConnection extends events_1.default {
    constructor(url) {
        super();
        this.url = url;
        this.post = {
            body: null,
            headers: { "Content-Type": "application/json" },
            method: "POST",
        };
    }
    formatError(payload, message, code = -1) {
        return {
            error: { message, code },
            id: payload.id,
            jsonrpc: payload.jsonrpc,
        };
    }
    send(payload, internal) {
        return new Promise(resolve => {
            if (payload.method === "eth_subscribe") {
                const error = this.formatError(payload, "Subscriptions are not supported by this HTTP endpoint");
                return resolve(error);
            }
            const xhr = new XHR();
            let responded = false;
            const res = (err, result) => {
                if (!responded) {
                    xhr.abort();
                    responded = true;
                    if (internal) {
                        internal(err, result);
                    }
                    else {
                        const { id, jsonrpc } = payload;
                        const response = err
                            ? { id, jsonrpc, error: { message: err.message, code: err.code } }
                            : { id, jsonrpc, result };
                        resolve(response);
                    }
                }
            };
            try {
                this.post.body = JSON.stringify(payload);
            }
            catch (e) {
                return res(e);
            }
            xhr.open("POST", this.url, true);
            xhr.timeout = 60 * 1000;
            xhr.onerror = res;
            xhr.ontimeout = res;
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        res(response.error, response.result);
                    }
                    catch (e) {
                        res(e);
                    }
                }
            };
            xhr.send(JSON.stringify(payload));
        });
    }
}
exports.default = HTTPConnection;
//# sourceMappingURL=index.js.map