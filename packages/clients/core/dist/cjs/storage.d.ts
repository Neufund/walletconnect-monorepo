import { IWalletConnectSession } from "@walletconnect/types";
declare class SessionStorage {
    storageId: string;
    storage: Storage | null;
    constructor();
    getSession(): IWalletConnectSession | null;
    setSession(session: IWalletConnectSession): IWalletConnectSession;
    removeSession(): void;
}
export default SessionStorage;
//# sourceMappingURL=storage.d.ts.map