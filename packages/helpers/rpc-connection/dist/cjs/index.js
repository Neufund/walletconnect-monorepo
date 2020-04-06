"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = tslib_1.__importDefault(require("events"));
const browser_1 = tslib_1.__importDefault(require("@walletconnect/browser"));
const qrcode_modal_1 = tslib_1.__importDefault(require("@walletconnect/qrcode-modal"));
const utils_1 = require("@walletconnect/utils");
class WCRpcConnection extends events_1.default {
    constructor(opts) {
        var _a, _b, _c;
        super();
        this.bridge = "https://bridge.walletconnect.org";
        this.qrcode = true;
        this.chainId = 1;
        this.wc = null;
        this.connected = false;
        this.bridge = ((_a = opts) === null || _a === void 0 ? void 0 : _a.bridge) || "https://bridge.walletconnect.org";
        this.qrcode = typeof ((_b = opts) === null || _b === void 0 ? void 0 : _b.qrcode) === "undefined" || opts.qrcode !== false;
        this.chainId = typeof ((_c = opts) === null || _c === void 0 ? void 0 : _c.chainId) !== "undefined" ? opts.chainId : 1;
        this.on("error", () => this.close());
    }
    openQRCode() {
        const uri = this.wc ? this.wc.uri : "";
        if (uri) {
            qrcode_modal_1.default.open(uri, () => {
                this.emit("error", new Error("User close WalletConnect QR Code modal"));
            });
        }
    }
    create() {
        try {
            this.wc = new browser_1.default({ bridge: this.bridge });
        }
        catch (e) {
            this.emit("error", e);
            return;
        }
        if (!this.wc.connected) {
            this.wc
                .createSession({ chainId: this.chainId })
                .then(() => {
                if (this.qrcode) {
                    this.openQRCode();
                }
            })
                .catch((e) => this.emit("error", e));
        }
        this.wc.on("connect", (err) => {
            if (err) {
                this.emit("error", err);
                return;
            }
            this.connected = true;
            if (this.qrcode) {
                qrcode_modal_1.default.close(); // Close QR Code Modal
            }
            // Emit connect event
            this.emit("connect");
        });
        this.wc.on("disconnect", (err) => {
            if (err) {
                this.emit("error", err);
                return;
            }
            this.onClose();
        });
    }
    onClose() {
        this.wc = null;
        this.connected = false;
        this.emit("close");
        this.removeAllListeners();
    }
    open() {
        return new Promise((resolve, reject) => {
            this.on("error", err => {
                reject(err);
            });
            this.on("connect", () => {
                resolve();
            });
            this.create();
        });
    }
    close() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.wc) {
                this.wc.killSession();
            }
            this.onClose();
            return Promise.resolve();
        });
    }
    onError(payload, message = "Failed or Rejected Request", code = -32000) {
        const errorPayload = {
            id: payload.id,
            jsonrpc: payload.jsonrpc,
            error: { code, message },
        };
        this.emit("payload", errorPayload);
        return errorPayload;
    }
    sendPayload(payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.wc || !this.wc.connected) {
                return this.onError(payload, "WalletConnect Not Connected");
            }
            try {
                return this.wc.unsafeSend(payload);
            }
            catch (error) {
                return this.onError(payload, error.message);
            }
        });
    }
    send(payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield this.sendPayload(payload);
            if (utils_1.isJsonRpcResponseError(response)) {
                throw new Error(response.error.message || "Failed or Rejected Request");
            }
            return response.result;
        });
    }
}
exports.default = WCRpcConnection;
//# sourceMappingURL=index.js.map