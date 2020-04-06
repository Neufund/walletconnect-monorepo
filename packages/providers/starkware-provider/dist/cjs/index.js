"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const provider_1 = tslib_1.__importDefault(require("./provider"));
const rpc_connection_1 = tslib_1.__importDefault(require("@walletconnect/rpc-connection"));
class WalletConnectStarkwareProvider extends provider_1.default {
    constructor(opts) {
        const connection = new rpc_connection_1.default(opts);
        super(connection);
    }
}
exports.default = WalletConnectStarkwareProvider;
//# sourceMappingURL=index.js.map