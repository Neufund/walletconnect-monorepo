"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = tslib_1.__importDefault(require("@walletconnect/core"));
// import { logDeprecationWarning } from '@walletconnect/utils'
const cryptoLib = tslib_1.__importStar(require("@walletconnect/browser-crypto"));
class WalletConnect extends core_1.default {
    constructor(connectorOpts) {
        super({
            cryptoLib,
            connectorOpts,
            clientMeta: connectorOpts.clientMeta,
        });
        // logDeprecationWarning()
    }
}
exports.default = WalletConnect;
//# sourceMappingURL=index.js.map