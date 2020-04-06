"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@walletconnect/utils");
class SessionStorage {
    constructor() {
        this.storageId = "walletconnect";
        this.storage = null;
        if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
            this.storage = window.localStorage;
        }
    }
    getSession() {
        let session = null;
        let local = null;
        if (this.storage) {
            local = this.storage.getItem(this.storageId);
        }
        if (local && typeof local === "string") {
            try {
                const json = JSON.parse(local);
                if (utils_1.isWalletConnectSession(json)) {
                    session = json;
                }
            }
            catch (error) {
                return null;
            }
        }
        return session;
    }
    setSession(session) {
        const local = JSON.stringify(session);
        if (this.storage) {
            this.storage.setItem(this.storageId, local);
        }
        return session;
    }
    removeSession() {
        if (this.storage) {
            this.storage.removeItem(this.storageId);
        }
    }
}
exports.default = SessionStorage;
//# sourceMappingURL=storage.js.map