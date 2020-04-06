"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = tslib_1.__importDefault(require("@walletconnect/core"));
const cryptoLib = tslib_1.__importStar(require("@walletconnect/node-crypto"));
// import { logDeprecationWarning } from '@walletconnect/utils'
class RNWalletConnect extends core_1.default {
    constructor(connectorOpts, walletOptions) {
        super({
            cryptoLib,
            connectorOpts,
            clientMeta: connectorOpts.clientMeta || walletOptions.clientMeta,
            pushServerOpts: walletOptions.push || undefined,
        });
        // logDeprecationWarning()
    }
}
exports.default = RNWalletConnect;
//# sourceMappingURL=index.js.map