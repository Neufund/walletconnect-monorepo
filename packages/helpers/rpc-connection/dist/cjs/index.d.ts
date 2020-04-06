/// <reference types="node" />
import EventEmitter from "events";
import { IWCRpcConnection, IWCRpcConnectionOptions, TConnector, IJsonRpcResponseError, IJsonRpcResponseSuccess } from "@walletconnect/types";
declare class WCRpcConnection extends EventEmitter implements IWCRpcConnection {
    bridge: string;
    qrcode: boolean;
    chainId: number;
    wc: TConnector | null;
    connected: boolean;
    constructor(opts?: IWCRpcConnectionOptions);
    openQRCode(): void;
    create(): void;
    onClose(): void;
    open(): Promise<void>;
    close(): Promise<void>;
    onError(payload: any, message?: string, code?: number): IJsonRpcResponseError;
    sendPayload(payload: any): Promise<IJsonRpcResponseSuccess | IJsonRpcResponseError>;
    send(payload: any): Promise<any>;
}
export default WCRpcConnection;
//# sourceMappingURL=index.d.ts.map