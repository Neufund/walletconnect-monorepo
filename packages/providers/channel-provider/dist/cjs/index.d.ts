import { IWCRpcConnectionOptions } from "@walletconnect/types";
import { ChannelProvider } from "@connext/channel-provider";
declare class WalletConnectChannelProvider extends ChannelProvider {
    isWalletConnect: boolean;
    constructor(opts?: IWCRpcConnectionOptions);
}
export default WalletConnectChannelProvider;
//# sourceMappingURL=index.d.ts.map