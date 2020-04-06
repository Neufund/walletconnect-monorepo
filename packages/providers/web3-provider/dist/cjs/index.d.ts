import HttpConnection from "@walletconnect/http-connection";
import { IRPCMap, IWCEthRpcConnectionOptions, IConnector, IJsonRpcResponseSuccess } from "@walletconnect/types";
declare const ProviderEngine: any;
interface IWalletConnectProviderOptions extends IWCEthRpcConnectionOptions {
    pollingInterval?: number;
}
declare class WalletConnectProvider extends ProviderEngine {
    bridge: string;
    qrcode: boolean;
    rpc: IRPCMap | null;
    infuraId: string;
    http: HttpConnection | null;
    wc: IConnector;
    isConnecting: boolean;
    connected: boolean;
    isWalletConnect: boolean;
    connectCallbacks: any[];
    accounts: string[];
    chainId: number;
    networkId: number;
    rpcUrl: string;
    constructor(opts?: IWalletConnectProviderOptions);
    enable(): Promise<unknown>;
    send(payload: any, callback: any): Promise<any>;
    onConnect(callback: any): void;
    triggerConnect(result: any): void;
    close(): Promise<void>;
    handleRequest(payload: any): Promise<{
        id: any;
        jsonrpc: any;
        result: any;
    }>;
    formatResponse(payload: any, result: any): {
        id: any;
        jsonrpc: any;
        result: any;
    };
    handleOtherRequests(payload: any): Promise<IJsonRpcResponseSuccess>;
    handleReadRequests(payload: any): Promise<IJsonRpcResponseSuccess>;
    getWalletConnector(opts?: {
        disableSessionCreation?: boolean;
    }): Promise<IConnector>;
    subscribeWalletConnector(): Promise<void>;
    updateState(sessionParams: any): Promise<void>;
    updateRpcUrl(chainId: number, rpcUrl?: string): void;
    updateHttpConnection(): void;
}
export default WalletConnectProvider;
//# sourceMappingURL=index.d.ts.map