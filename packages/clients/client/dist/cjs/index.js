"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = tslib_1.__importDefault(require("@walletconnect/core"));
const qrcode_modal_1 = tslib_1.__importDefault(require("@walletconnect/qrcode-modal"));
const cryptoLib = tslib_1.__importStar(require("@walletconnect/iso-crypto"));
class WalletConnect extends core_1.default {
    constructor(connectorOpts, pushServerOpts) {
        super({
            cryptoLib,
            connectorOpts,
            qrcodeModal: qrcode_modal_1.default,
            pushServerOpts,
        });
    }
}
exports.default = WalletConnect;
//# sourceMappingURL=index.js.map