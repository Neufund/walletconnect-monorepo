"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = tslib_1.__importDefault(require("events"));
const utils_1 = require("@walletconnect/utils");
// -- StarkwareProvider ---------------------------------------------------- //
class StarkwareProvider extends events_1.default {
    constructor(connection) {
        super();
        this._accounts = [];
        this._connected = false;
        this.connection = connection;
    }
    // -- public ---------------------------------------------------------------- //
    get accounts() {
        return this._accounts;
    }
    set connected(value) {
        this._connected = value;
        if (value === true) {
            this.emit("connect");
        }
        else {
            this.emit("close");
        }
    }
    get connected() {
        return this._connected;
    }
    enable() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.connected) {
                    yield this.open();
                }
                const { accounts } = yield this.register();
                this.emit("enable");
                return accounts;
            }
            catch (err) {
                this.connected = false;
                this.connection.close();
                throw err;
            }
        });
    }
    send(method, params = []) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.connection.send({
                id: utils_1.payloadId(),
                jsonrpc: "2.0",
                method,
                params,
            });
        });
    }
    open() {
        return new Promise((resolve, reject) => {
            this.connection.on("close", () => {
                this.connected = false;
                reject();
            });
            this.connection.on("connect", () => {
                this.connected = true;
                resolve();
            });
            this.connection.open();
        });
    }
    close() {
        this.connected = false;
        this.connection.close();
    }
    getAccounts() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.send("stark_accounts");
            return result;
        });
    }
    register() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.send("stark_register");
            return result;
        });
    }
    deposit(amount, token, vaultId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.send("stark_deposit", { amount, token, vaultId });
            return result;
        });
    }
    transfer(amount, nonce, senderVaultId, token, receiverVaultId, receiverPublicKey, expirationTimestamp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.send("stark_transfer", {
                amount,
                nonce,
                senderVaultId,
                token,
                receiverVaultId,
                receiverPublicKey,
                expirationTimestamp,
            });
            return result;
        });
    }
    createOrder(vaultSell, vaultBuy, amountSell, amountBuy, tokenSell, tokenBuy, nonce, expirationTimestamp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.send("stark_createOrder", {
                vaultSell,
                vaultBuy,
                amountSell,
                amountBuy,
                tokenSell,
                tokenBuy,
                nonce,
                expirationTimestamp,
            });
            return result;
        });
    }
    withdraw(token) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.send("stark_withdraw", { token });
            return result;
        });
    }
}
exports.default = StarkwareProvider;
//# sourceMappingURL=provider.js.map