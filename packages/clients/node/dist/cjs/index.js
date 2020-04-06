"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = tslib_1.__importDefault(require("@walletconnect/core"));
const cryptoLib = tslib_1.__importStar(require("@walletconnect/node-crypto"));
// import { logDeprecationWarning } from '@walletconnect/utils'
class NodeWalletConnect extends core_1.default {
    constructor(connectorOpts, nodeJsOptions) {
        super({
            cryptoLib,
            connectorOpts,
            clientMeta: connectorOpts.clientMeta || nodeJsOptions.clientMeta,
        });
        // logDeprecationWarning()
    }
}
exports.default = NodeWalletConnect;
//# sourceMappingURL=index.js.map