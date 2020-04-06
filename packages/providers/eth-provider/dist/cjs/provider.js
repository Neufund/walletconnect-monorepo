"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = tslib_1.__importDefault(require("events"));
const utils_1 = require("@walletconnect/utils");
// -- EthereumProvider ---------------------------------------------------- //
class EthereumProvider extends events_1.default {
    constructor(connection) {
        super();
        this.connected = false;
        this.promises = {};
        this.subscriptions = [];
        this.accounts = [];
        this.coinbase = "";
        this.attemptedNetworkSubscription = false;
        this.attemptedChainSubscription = false;
        this.attemptedAccountsSubscription = false;
        this.connection = connection;
    }
    onConnectionPayload(payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { id } = payload;
            if (typeof id !== "undefined") {
                if (this.promises[id]) {
                    if (utils_1.isJsonRpcResponseError(payload)) {
                        this.promises[id].reject(payload.error);
                    }
                    else if (utils_1.isJsonRpcResponseSuccess(payload)) {
                        this.promises[id].resolve(payload.result);
                    }
                    delete this.promises[id];
                }
            }
            else if (utils_1.isJsonRpcSubscription(payload)) {
                if (payload.method && payload.method.indexOf("_subscription") > -1) {
                    // Emit subscription result
                    this.emit(payload.params.subscription, payload.params.result);
                    this.emit(payload.method, payload.params); // Latest EIP-1193
                    this.emit("data", payload); // Backwards Compatibility
                }
            }
        });
    }
    checkConnection() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                this.emit("connect", yield this._send("net_version"));
                this.connected = true;
                if (this.listenerCount("networkChanged") && !this.attemptedNetworkSubscription) {
                    this.startNetworkSubscription();
                }
                if (this.listenerCount("chainChanged") && !this.attemptedAccountsSubscription) {
                    this.startAccountsSubscription();
                }
                if (this.listenerCount("accountsChanged") && !this.attemptedAccountsSubscription) {
                    this.startAccountsSubscription();
                }
            }
            catch (e) {
                this.connected = false;
            }
        });
    }
    startNetworkSubscription() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.attemptedNetworkSubscription = true;
            try {
                const networkChanged = yield this.subscribe("eth_subscribe", "networkChanged");
                this.on(networkChanged, netId => this.emit("networkChanged", netId));
            }
            catch (e) {
                console.warn("Unable to subscribe to networkChanged", e); // tslint:disable-line
            }
        });
    }
    startChainSubscription() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.attemptedChainSubscription = true;
            try {
                const chainChanged = yield this.subscribe("eth_subscribe", "chainChanged");
                this.on(chainChanged, chainId => this.emit("chainChanged", chainId));
            }
            catch (e) {
                console.warn("Unable to subscribe to chainChanged", e); // tslint:disable-line
            }
        });
    }
    startAccountsSubscription() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.attemptedAccountsSubscription = true;
            try {
                const accountsChanged = yield this.subscribe("eth_subscribe", "accountsChanged");
                this.on(accountsChanged, accounts => this.emit("accountsChanged", accounts));
            }
            catch (e) {
                console.warn("Unable to subscribe to accountsChanged", e); // tslint:disable-line
            }
        });
    }
    enable() {
        return new Promise((resolve, reject) => {
            this.on("newListener", event => {
                if (event === "networkChanged") {
                    if (!this.attemptedNetworkSubscription && this.connected) {
                        this.startNetworkSubscription();
                    }
                }
                else if (event === "chainChanged") {
                    if (!this.attemptedChainSubscription && this.connected) {
                        this.startChainSubscription();
                    }
                }
                else if (event === "accountsChanged") {
                    if (!this.attemptedAccountsSubscription && this.connected) {
                        this.startAccountsSubscription();
                    }
                }
            });
            this.connection.on("close", () => {
                this.connected = false;
                this.emit("close");
            });
            this.connection.on("payload", this.onConnectionPayload.bind(this));
            this.connection.on("connect", () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this.checkConnection();
                try {
                    const accounts = yield this._send("eth_accounts");
                    if (accounts.length > 0) {
                        this.accounts = accounts;
                        this.coinbase = accounts[0];
                        this.emit("enable");
                        this.emit("connect");
                        resolve(accounts);
                    }
                    else {
                        const err = new Error("User Denied Full Provider");
                        err.code = 4001;
                        this.connected = false;
                        this.connection.close();
                        reject(err);
                    }
                }
                catch (e) {
                    this.connected = false;
                    this.connection.close();
                    reject(e);
                }
            }));
            this.connection.open();
        });
    }
    _send(method, params = []) {
        if (!method || typeof method !== "string") {
            throw new Error("Method is not a valid string.");
        }
        if (!(params instanceof Array)) {
            throw new Error("Params is not a valid array.");
        }
        const payload = { jsonrpc: "2.0", id: utils_1.payloadId(), method, params };
        const promise = new Promise((resolve, reject) => {
            this.promises[payload.id] = { resolve, reject };
        });
        this.connection.send(payload);
        return promise;
    }
    send(...args) {
        // Send can be clobbered, proxy sendPromise for backwards compatibility
        return this._send(...args);
    }
    _sendBatch(requests) {
        return Promise.all(requests.map(payload => {
            if (utils_1.isJsonRpcRequest(payload)) {
                this._send(payload.method, payload.params);
            }
        }));
    }
    sendAsync(payload, cb) {
        // Backwards Compatibility
        if (!cb || typeof cb !== "function") {
            return cb(new Error("Invalid or undefined callback provided to sendAsync"));
        }
        if (!payload) {
            return cb(new Error("Invalid Payload"));
        }
        // sendAsync can be called with an array for batch requests used by web3.js 0.x
        // this is not part of EIP-1193's backwards compatibility but we still want to support it
        if (payload instanceof Array) {
            return this.sendAsyncBatch(payload, cb);
        }
        else if (utils_1.isJsonRpcRequest(payload)) {
            return this._send(payload.method, payload.params)
                .then(result => {
                cb(null, { id: payload.id, jsonrpc: payload.jsonrpc, result });
            })
                .catch(err => {
                cb(err);
            });
        }
    }
    sendAsyncBatch(requests, cb) {
        return this._sendBatch(requests)
            .then(results => {
            const result = results.map((entry, index) => {
                return {
                    id: requests[index].id,
                    jsonrpc: requests[index].jsonrpc,
                    result: entry,
                };
            });
            cb(null, result);
        })
            .catch(err => {
            cb(err);
        });
    }
    subscribe(type, method, params = []) {
        return this._send(type, [method, ...params]).then(id => {
            this.subscriptions.push(id);
            return id;
        });
    }
    unsubscribe(type, id) {
        return this._send(type, [id]).then(success => {
            if (success) {
                this.subscriptions = this.subscriptions.filter(_id => _id !== id); // Remove subscription
                this.removeAllListeners(String(id)); // Remove listeners
                return success;
            }
        });
    }
    isConnected() {
        // Backwards Compatibility
        return this.connected;
    }
    close() {
        this.connection.close();
        this.connected = false;
        const error = new Error(`Provider closed, subscription lost, please subscribe again.`);
        this.subscriptions.forEach(id => this.emit(String(id), error)); // Send Error objects to any open subscriptions
        this.subscriptions = []; // Clear subscriptions
    }
}
exports.default = EthereumProvider;
//# sourceMappingURL=provider.js.map