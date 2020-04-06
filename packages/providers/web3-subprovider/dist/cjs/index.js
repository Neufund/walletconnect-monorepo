"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const browser_1 = tslib_1.__importDefault(require("@walletconnect/browser"));
const node_1 = tslib_1.__importDefault(require("@walletconnect/node"));
const qrcode_modal_1 = tslib_1.__importDefault(require("@walletconnect/qrcode-modal"));
const utils_1 = require("@walletconnect/utils");
const events_1 = require("events");
const HookedWalletSubprovider = require("web3-provider-engine/subproviders/hooked-wallet");
class WalletConnectSubprovider extends HookedWalletSubprovider {
    constructor(opts) {
        var _a, _b, _c, _d, _e;
        super({
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
        });
        this._connected = false;
        this.eventEmitter = new events_1.EventEmitter();
        this.on = this.eventEmitter.on;
        this.emit = this.eventEmitter.emit;
        this.bridge = ((_a = opts) === null || _a === void 0 ? void 0 : _a.bridge) || "https://bridge.walletconnect.org";
        this.qrcode = typeof ((_b = opts) === null || _b === void 0 ? void 0 : _b.qrcode) === "undefined" || ((_c = opts) === null || _c === void 0 ? void 0 : _c.qrcode) !== false;
        this.isNode = utils_1.isNode();
        const nodeOpts = {
            clientMeta: {
                name: "wallet-connect-provider",
                description: "WalletConnect provider",
                url: "#",
                icons: ["https://walletconnect.org/walletconnect-logo.png"],
            },
        };
        this.wc = this.isNode
            ? new node_1.default({ bridge: this.bridge }, nodeOpts)
            : new browser_1.default({ bridge: this.bridge });
        this.chainId = typeof ((_d = opts) === null || _d === void 0 ? void 0 : _d.chainId) !== "undefined" ? (_e = opts) === null || _e === void 0 ? void 0 : _e.chainId : 1;
        this.networkId = this.chainId;
        this.isConnecting = false;
        this.connectCallbacks = [];
    }
    get isWalletConnect() {
        return true;
    }
    get connected() {
        return this._connected;
    }
    get uri() {
        return this.wc.uri;
    }
    get accounts() {
        return this.wc.accounts;
    }
    onConnect(callback) {
        this.connectCallbacks.push(callback);
    }
    triggerConnect(result) {
        if (this.connectCallbacks && this.connectCallbacks.length) {
            this.connectCallbacks.forEach((callback) => callback(result));
        }
    }
    enable() {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const wc = yield this.getWalletConnector();
                if (wc) {
                    this.start();
                    this.subscribeWalletConnector();
                    resolve(wc.accounts);
                }
                else {
                    return reject(new Error("Failed to connect"));
                }
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
    getMeta() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const wc = yield this.getWalletConnector();
            return wc.peerMeta;
        });
    }
    close() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const wc = yield this.getWalletConnector({ disableSessionCreation: true });
            yield wc.killSession();
            // tslint:disable-next-line:await-promise
            yield this.stop();
            this.emit("close", 1000, "Connection closed");
        });
    }
    cancelSession() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.wc.killSession();
            yield this.stop();
            this.emit("close", 1000, "Connection closed");
        });
    }
    connect() {
        const wc = this.wc;
        this.isConnecting = true;
        const sessionRequestOpions = this.chainId ? { chainId: this.chainId } : undefined;
        return new Promise((resolve, reject) => {
            wc.createSession(sessionRequestOpions)
                .then(() => {
                this.emit("sessionRequest", wc.uri);
                if (this.qrcode) {
                    qrcode_modal_1.default.open(wc.uri, () => {
                        reject(new Error("User closed WalletConnect modal"));
                    });
                }
                wc.on('disconnect', (error, _) => {
                    if (this.qrcode) {
                        qrcode_modal_1.default.close();
                    }
                    this.isConnecting = false;
                    wc.connected = false;
                    this.emit("reject");
                    return reject(error);
                });
                wc.on("connect", (error, payload) => {
                    if (this.qrcode) {
                        qrcode_modal_1.default.close();
                    }
                    if (error) {
                        this.isConnecting = false;
                        return reject(error);
                    }
                    this.isConnecting = false;
                    this._connected = true;
                    if (payload) {
                        // Handle session update
                        this.updateState(payload.params[0]);
                    }
                    // Emit connect event
                    // @ts-ignore
                    this.emit("connect");
                    this.triggerConnect(wc);
                    resolve(wc);
                });
            })
                .catch((error) => {
                this.isConnecting = false;
                reject(error);
            });
        });
    }
    // disableSessionCreation - if true, getWalletConnector won't try to create a new session
    // in case the connector is disconnected
    getWalletConnector(opts = {}) {
        const { disableSessionCreation = false } = opts;
        const wc = this.wc;
        if (this.isConnecting) {
            return new Promise((resolve, _) => {
                this.onConnect((x) => resolve(x));
            });
        }
        else if (!wc.connected && !disableSessionCreation) {
            return this.connect();
        }
        else {
            return new Promise((resolve, _) => {
                if (!this.connected) {
                    this._connected = true;
                    this.updateState(wc.session);
                }
                resolve(wc);
            });
        }
    }
    updateState(sessionParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { accounts, chainId, networkId } = sessionParams;
            // Check if accounts changed and trigger event
            if (!this.accounts || (accounts && this.accounts !== accounts)) {
                this.wc.accounts = accounts;
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
        });
    }
    subscribeWalletConnector() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const wc = yield this.getWalletConnector();
            wc.on("disconnect", error => {
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
                if (error) {
                    this.emit("error", error);
                    return;
                }
                // Handle session update
                this.updateState(payload.params[0]);
            });
        });
    }
}
exports.default = WalletConnectSubprovider;
//# sourceMappingURL=index.js.map