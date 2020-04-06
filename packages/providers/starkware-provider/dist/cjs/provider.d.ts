/// <reference types="node" />
import EventEmitter from "events";
import { IRpcConnection } from "@walletconnect/types";
declare class StarkwareProvider extends EventEmitter {
    private _accounts;
    private _connected;
    connection: IRpcConnection;
    constructor(connection: IRpcConnection);
    get accounts(): string[];
    set connected(value: boolean);
    get connected(): boolean;
    enable(): Promise<any>;
    send(method: string, params?: any): Promise<any>;
    open(): Promise<unknown>;
    close(): void;
    getAccounts(): Promise<any>;
    register(): Promise<any>;
    deposit(amount: string, token: string, vaultId: string): Promise<any>;
    transfer(amount: string, nonce: string, senderVaultId: string, token: string, receiverVaultId: string, receiverPublicKey: string, expirationTimestamp: string): Promise<any>;
    createOrder(vaultSell: string, vaultBuy: string, amountSell: string, amountBuy: string, tokenSell: string, tokenBuy: string, nonce: string, expirationTimestamp: string): Promise<any>;
    withdraw(token: string): Promise<any>;
}
export default StarkwareProvider;
//# sourceMappingURL=provider.d.ts.map