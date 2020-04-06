"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rpc_connection_1 = tslib_1.__importDefault(require("@walletconnect/rpc-connection"));
const channel_provider_1 = require("@connext/channel-provider");
class WalletConnectChannelProvider extends channel_provider_1.ChannelProvider {
    constructor(opts) {
        const connection = new rpc_connection_1.default(opts);
        super(connection);
        this.isWalletConnect = true;
    }
}
exports.default = WalletConnectChannelProvider;
//# sourceMappingURL=index.js.map