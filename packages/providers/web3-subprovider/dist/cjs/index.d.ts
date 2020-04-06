import { IWCEthRpcConnectionOptions, IConnector } from "@walletconnect/types";
declare const HookedWalletSubprovider: any;
declare class WalletConnectSubprovider extends HookedWalletSubprovider {
    private _connected;
    constructor(opts?: IWCEthRpcConnectionOptions);
    get isWalletConnect(): boolean;
    get connected(): boolean;
    get uri(): any;
    get accounts(): any;
    onConnect(callback: any): void;
    triggerConnect(result: any): void;
    enable(): Promise<unknown>;
    getMeta(): Promise<import("@walletconnect/types").IClientMeta | null>;
    close(): Promise<void>;
    cancelSession(): Promise<void>;
    connect(): Promise<IConnector>;
    getWalletConnector(opts?: {
        disableSessionCreation?: boolean;
    }): Promise<IConnector>;
    updateState(sessionParams: any): Promise<void>;
    subscribeWalletConnector(): Promise<void>;
}
export default WalletConnectSubprovider;
//# sourceMappingURL=index.d.ts.map