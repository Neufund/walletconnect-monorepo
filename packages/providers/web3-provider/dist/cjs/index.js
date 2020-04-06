"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const browser_1 = tslib_1.__importDefault(require("@walletconnect/browser"));
const qrcode_modal_1 = tslib_1.__importDefault(require("@walletconnect/qrcode-modal"));
const http_connection_1 = tslib_1.__importDefault(require("@walletconnect/http-connection"));
const ProviderEngine = require("web3-provider-engine");
const CacheSubprovider = require("web3-provider-engine/subproviders/cache");
const FixtureSubprovider = require("web3-provider-engine/subproviders/fixture");
const FilterSubprovider = require("web3-provider-engine/subproviders/filters");
const HookedWalletSubprovider = require("web3-provider-engine/subproviders/hooked-wallet");
const NonceSubprovider = require("web3-provider-engine/subproviders/nonce-tracker");
const SubscriptionsSubprovider = require("web3-provider-engine/subproviders/subscriptions");
class WalletConnectProvider extends ProviderEngine {
    constructor(opts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        super({
            pollingInterval: ((_a = opts) === null || _a === void 0 ? void 0 : _a.pollingInterval) || 4000, blockTracker: {
                on: () => {
                }, removeAllListeners: () => {
                }
            }
        });
        this.bridge = "https://bridge.walletconnect.org";
        this.qrcode = true;
        this.rpc = null;
        this.infuraId = "";
        this.http = null;
        this.isConnecting = false;
        this.connected = false;
        this.isWalletConnect = true;
        this.connectCallbacks = [];
        this.accounts = [];
        this.chainId = 1;
        this.networkId = 1;
        this.rpcUrl = "";
        console.log('constructor', opts);
        this.bridge = ((_b = opts) === null || _b === void 0 ? void 0 : _b.bridge) || "https://bridge.walletconnect.org";
        this.qrcode = typeof ((_c = opts) === null || _c === void 0 ? void 0 : _c.qrcode) === "undefined" || ((_d = opts) === null || _d === void 0 ? void 0 : _d.qrcode) !== false;
        this.rpc = ((_e = opts) === null || _e === void 0 ? void 0 : _e.rpc) || null;
        if (!this.rpc &&
            (!((_f = opts) === null || _f === void 0 ? void 0 : _f.infuraId) || typeof ((_g = opts) === null || _g === void 0 ? void 0 : _g.infuraId) !== "string" || !((_h = opts) === null || _h === void 0 ? void 0 : _h.infuraId.trim()))) {
            throw new Error("Missing one of the required parameters: rpc or infuraId");
        }
        this.infuraId = ((_j = opts) === null || _j === void 0 ? void 0 : _j.infuraId) || "";
        this.wc = new browser_1.default({ bridge: this.bridge });
        this.chainId = typeof ((_k = opts) === null || _k === void 0 ? void 0 : _k.chainId) !== "undefined" ? (_l = opts) === null || _l === void 0 ? void 0 : _l.chainId : 1;
        this.networkId = this.chainId;
        this.updateRpcUrl(this.chainId);
        this.addProvider(new FixtureSubprovider({
            eth_hashrate: "0x00",
            eth_mining: false,
            eth_syncing: true,
            net_listening: true,
            web3_clientVersion: `WalletConnect/v1.0.0-beta/javascript`,
        }));
        this.addProvider(new CacheSubprovider());
        this.addProvider(new SubscriptionsSubprovider());
        this.addProvider(new FilterSubprovider());
        this.addProvider(new NonceSubprovider());
        this.addProvider(new HookedWalletSubprovider({
            getAccounts: (cb) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    const wc = yield this.getWalletConnector();
                    const accounts = wc.accounts;
                    if (accounts && accounts.length) {
                        cb(null, accounts);
                    }
                    else {
                        cb(new Error("Failed to get accounts"));
                    }
                }
                catch (error) {
                    cb(error);
                }
            }),
            processMessage: (msgParams, cb) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    const wc = yield this.getWalletConnector();
                    const result = yield wc.signMessage([msgParams.from, msgParams.data]);
                    cb(null, result);
                }
                catch (error) {
                    cb(error);
                }
            }),
            processPersonalMessage: (msgParams, cb) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    const wc = yield this.getWalletConnector();
                    const result = yield wc.signPersonalMessage([msgParams.data, msgParams.from]);
                    cb(null, result);
                }
                catch (error) {
                    cb(error);
                }
            }),
            processSignTransaction: (txParams, cb) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    const wc = yield this.getWalletConnector();
                    const result = yield wc.signTransaction(txParams);
                    cb(null, result);
                }
                catch (error) {
                    cb(error);
                }
            }),
            processTransaction: (txParams, cb) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    const wc = yield this.getWalletConnector();
                    const result = yield wc.sendTransaction(txParams);
                    cb(null, result);
                }
                catch (error) {
                    cb(error);
                }
            }),
            processTypedMessage: (msgParams, cb) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    const wc = yield this.getWalletConnector();
                    const result = yield wc.signTypedData([msgParams.from, msgParams.data]);
                    cb(null, result);
                }
                catch (error) {
                    cb(error);
                }
            }),
        }));
        this.addProvider({
            handleRequest: (payload, next, end) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    const { result } = yield this.handleRequest(payload);
                    end(null, result);
                }
                catch (error) {
                    end(error);
                }
            }),
            setEngine: (_) => _,
        });
    }
    enable() {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                console.log("enabling");
                const wc = yield this.getWalletConnector();
                if (wc) {
                    this.start();
                    this.subscribeWalletConnector();
                    resolve(wc.accounts);
                }
                else {
                    return reject(new Error("Failed to connect to WalletConnect"));
                }
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
    send(payload, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Web3 1.0 beta.38 (and above) calls `send` with method and parameters
            if (typeof payload === "string") {
                return new Promise((resolve, reject) => {
                    this.sendAsync({
                        id: 42,
                        jsonrpc: "2.0",
                        method: payload,
                        params: callback || [],
                    }, (error, response) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(response.result);
                        }
                    });
                });
            }
            // Web3 1.0 beta.37 (and below) uses `send` with a callback for async queries
            if (callback) {
                this.sendAsync(payload, callback);
                return;
            }
            const res = yield this.handleRequest(payload);
            return res;
        });
    }
    onConnect(callback) {
        this.connectCallbacks.push(callback);
    }
    triggerConnect(result) {
        if (this.connectCallbacks && this.connectCallbacks.length) {
            this.connectCallbacks.forEach(callback => callback(result));
        }
    }
    close() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('closing...');
            const wc = yield this.getWalletConnector({ disableSessionCreation: true });
            yield wc.killSession();
            // tslint:disable-next-line:await-promise
            yield this.stop();
            this.emit("close", 1000, "Connection closed");
        });
    }
    handleRequest(payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                let response;
                let result = null;
                const wc = yield this.getWalletConnector();
                switch (payload.method) {
                    case "wc_killSession":
                        console.log("wc_killSession");
                        yield this.close();
                        result = null;
                        break;
                    case "eth_accounts":
                        result = wc.accounts;
                        break;
                    case "eth_coinbase":
                        result = wc.accounts[0];
                        break;
                    case "eth_chainId":
                        result = wc.chainId;
                        break;
                    case "net_version":
                        result = wc.networkId || wc.chainId;
                        break;
                    case "eth_uninstallFilter":
                        this.sendAsync(payload, (_) => _);
                        result = true;
                        break;
                    default:
                        response = yield this.handleOtherRequests(payload);
                }
                if (response) {
                    console.log("-->response", response);
                    return response;
                }
                return this.formatResponse(payload, result);
            }
            catch (error) {
                this.emit("error", error);
                throw error;
            }
        });
    }
    formatResponse(payload, result) {
        return {
            id: payload.id,
            jsonrpc: payload.jsonrpc,
            result: result,
        };
    }
    handleOtherRequests(payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (payload.method.startsWith("eth_")) {
                return this.handleReadRequests(payload);
            }
            const wc = yield this.getWalletConnector();
            const result = yield wc.sendCustomRequest(payload);
            return this.formatResponse(payload, result);
        });
    }
    handleReadRequests(payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.http) {
                const error = new Error("HTTP Connection not available");
                this.emit("error", error);
                throw error;
            }
            this.http.send(payload);
            return new Promise(resolve => {
                this.on("payload", (response) => {
                    if (response.id === payload.id) {
                        resolve(response);
                    }
                });
            });
        });
    }
    // disableSessionCreation - if true, getWalletConnector won't try to create a new session
    // in case the connector is disconnected
    getWalletConnector(opts = {}) {
        const { disableSessionCreation = false } = opts;
        return new Promise((resolve, reject) => {
            const wc = this.wc;
            if (this.isConnecting) {
                this.onConnect((x) => resolve(x));
            }
            else if (!wc.connected && !disableSessionCreation) {
                this.isConnecting = true;
                const sessionRequestOpions = this.chainId ? { chainId: this.chainId } : undefined;
                wc.createSession(sessionRequestOpions)
                    .then(() => {
                    if (this.qrcode) {
                        console.log(wc.uri);
                        qrcode_modal_1.default.open(wc.uri, () => {
                            reject(new Error("User closed WalletConnect modal"));
                        });
                    }
                    wc.on('reject', (error, _) => {
                        console.log('onreject', error);
                        if (this.qrcode) {
                            qrcode_modal_1.default.close();
                        }
                        this.isConnecting = false;
                        this.connected = false;
                        this.emit("reject");
                        return reject(error);
                    });
                    wc.on("connect", (error, payload) => {
                        if (this.qrcode) {
                            qrcode_modal_1.default.close();
                        }
                        if (error) {
                            console.log("-->createSession onconnect", error);
                            this.isConnecting = false;
                            return reject(error);
                        }
                        this.isConnecting = false;
                        this.connected = true;
                        if (payload) {
                            // Handle session update
                            this.updateState(payload.params[0]);
                        }
                        // Emit connect event
                        this.emit("connect");
                        this.triggerConnect(wc);
                        resolve(wc);
                    });
                })
                    .catch(error => {
                    console.log("-->createSession", error);
                    this.isConnecting = false;
                    reject(error);
                });
            }
            else {
                if (!this.connected) {
                    this.connected = true;
                    this.updateState(wc.session);
                }
                resolve(wc);
            }
        });
    }
    subscribeWalletConnector() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const wc = yield this.getWalletConnector();
            console.log("subscribeWalletConnector", wc);
            wc.on("disconnect", error => {
                console.log('subscribeWalletConnector disconnect', error);
                if (error) {
                    this.emit("error", error);
                    return;
                }
                else {
                    this.emit("disconnect", error);
                    this.stop();
                    // this.close()
                }
            });
            wc.on("session_update", (error, payload) => {
                console.log('subscribeWalletConnector session_update,', error);
                if (error) {
                    this.emit("error", error);
                    return;
                }
                // Handle session update
                this.updateState(payload.params[0]);
            });
        });
    }
    updateState(sessionParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { accounts, chainId, networkId, rpcUrl } = sessionParams;
            // Check if accounts changed and trigger event
            if (!this.accounts || (accounts && this.accounts !== accounts)) {
                this.accounts = accounts;
                this.emit("accountsChanged", accounts);
            }
            // Check if chainId changed and trigger event
            if (!this.chainId || (chainId && this.chainId !== chainId)) {
                this.chainId = chainId;
                this.emit("chainChanged", chainId);
            }
            // Check if networkId changed and trigger event
            if (!this.networkId || (networkId && this.networkId !== networkId)) {
                this.networkId = networkId;
                this.emit("networkChanged", networkId);
            }
            // Handle rpcUrl update
            this.updateRpcUrl(this.chainId, rpcUrl || "");
        });
    }
    updateRpcUrl(chainId, rpcUrl = "") {
        const infuraNetworks = {
            1: "mainnet",
            3: "ropsten",
            4: "rinkeby",
            5: "goerli",
            42: "kovan",
        };
        const network = infuraNetworks[chainId];
        console.log(rpcUrl);
        if (!rpcUrl) {
            if (this.rpc && this.rpc[chainId]) {
                rpcUrl = this.rpc[chainId];
            }
            else if (network) {
                rpcUrl = `https://${network}.infura.io/v3/${this.infuraId}`;
            }
        }
        if (rpcUrl) {
            // Update rpcUrl
            this.rpcUrl = rpcUrl;
            // Handle http update
            this.updateHttpConnection();
        }
        else {
            this.emit("error", new Error(`No RPC Url available for chainId: ${chainId}`));
        }
    }
    updateHttpConnection() {
        if (this.rpcUrl) {
            this.http = new http_connection_1.default(this.rpcUrl);
            this.http.on("payload", payload => this.emit("payload", payload));
            this.http.on("error", error => this.emit("error", error));
        }
    }
}
exports.default = WalletConnectProvider;
//# sourceMappingURL=index.js.map