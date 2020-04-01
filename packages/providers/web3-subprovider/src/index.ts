import WalletConnect from "@walletconnect/browser";
import NodeWalletConnect from "@walletconnect/node";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import { IWCEthRpcConnectionOptions, IConnector } from "@walletconnect/types";
import { isNode } from "@walletconnect/utils";
import { EventEmitter } from "events";

const HookedWalletSubprovider = require("web3-provider-engine/subproviders/hooked-wallet");

class WalletConnectSubprovider extends HookedWalletSubprovider {
  private _connected = false;

  constructor(opts?: IWCEthRpcConnectionOptions) {
    super({
      getAccounts: async (cb: any) => {
        try {
          const wc = await this.getWalletConnector();
          const accounts = wc.accounts;
          if (accounts && accounts.length) {
            cb(null, accounts);
          } else {
            cb(new Error("Failed to get accounts"));
          }
        } catch (error) {
          cb(error);
        }
      },
      processMessage: async (msgParams: { from: string; data: string }, cb: any) => {
        try {
          const wc = await this.getWalletConnector();
          const result = await wc.signMessage([msgParams.from, msgParams.data]);
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      },
      processPersonalMessage: async (msgParams: { from: string; data: string }, cb: any) => {
        try {
          const wc = await this.getWalletConnector();
          const result = await wc.signPersonalMessage([msgParams.data, msgParams.from]);
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      },
      processSignTransaction: async (txParams: any, cb: any) => {
        try {
          const wc = await this.getWalletConnector();
          const result = await wc.signTransaction(txParams);
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      },
      processTransaction: async (txParams: any, cb: any) => {
        try {
          const wc = await this.getWalletConnector();
          const result = await wc.sendTransaction(txParams);
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      },
      processTypedMessage: async (msgParams: { from: string; data: string }, cb: any) => {
        try {
          const wc = await this.getWalletConnector();
          const result = await wc.signTypedData([msgParams.from, msgParams.data]);
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      },
    });
    this.eventEmitter = new EventEmitter();
    this.on = this.eventEmitter.on;
    this.emit = this.eventEmitter.emit;

    this.bridge = opts?.bridge || "https://bridge.walletconnect.org";
    this.qrcode = typeof opts?.qrcode === "undefined" || opts?.qrcode !== false;

    this.isNode = isNode();

    const nodeOpts = {
      clientMeta: {
        name: "wallet-connect-provider",
        description: "WalletConnect provider",
        url: "#",
        icons: ["https://walletconnect.org/walletconnect-logo.png"],
      },
    };

    this.wc = this.isNode
      ? new NodeWalletConnect({ bridge: this.bridge }, nodeOpts)
      : new WalletConnect({ bridge: this.bridge });
    this.chainId = typeof opts?.chainId !== "undefined" ? opts?.chainId : 1;
    this.networkId = this.chainId;

    this.isConnecting = false;
    this.connectCallbacks = [];
  }


  get isWalletConnect() {
    return true;
  }

  get connected() {
    return this._connected;
  }

  get uri() {
    return this.wc.uri;
  }

  get accounts() {
    return this.wc.accounts;
  }

  onConnect(callback: any) {
    this.connectCallbacks.push(callback);
  }

  triggerConnect(result: any) {
    if (this.connectCallbacks && this.connectCallbacks.length) {
      this.connectCallbacks.forEach((callback: any) => callback(result));
    }
  }

  enable() {
    return new Promise(async (resolve, reject) => {
      try {
        const wc = await this.getWalletConnector();
        if (wc) {
          this.start();
          this.subscribeWalletConnector();
          resolve(wc.accounts);
        } else {
          return reject(new Error("Failed to connect"));
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  async close() {
    const wc = await this.getWalletConnector({ disableSessionCreation: true });
    await wc.killSession();
    // tslint:disable-next-line:await-promise
    await this.stop();
    this.emit("close", 1000, "Connection closed");
  }

  async cancelSession() {
    await this.wc.killSession();
    await this.stop();
    this.emit("close", 1000, "Connection closed");
  }

  connect(): Promise<IConnector>  {
    const wc = this.wc;
    this.isConnecting = true;
    const sessionRequestOpions = this.chainId ? { chainId: this.chainId } : undefined;
    return new Promise((resolve, reject) => {
      wc.createSession(sessionRequestOpions)
        .then(() => {
          this.emit("sessionRequest", wc.uri);

          if (this.qrcode) {
            WalletConnectQRCodeModal.open(wc.uri, () => {
              reject(new Error("User closed WalletConnect modal"));
            });
          }
          wc.on('disconnect', (error: any, _: any) => {
            if (this.qrcode) {
              WalletConnectQRCodeModal.close();
            }
            this.isConnecting = false;
            wc.connected = false;
            this.emit("reject");
            return reject(error);
          });
          wc.on("connect", (error: any, payload: any) => {
            if (this.qrcode) {
              WalletConnectQRCodeModal.close();
            }
            if (error) {
              this.isConnecting = false;
              return reject(error);
            }
            this.isConnecting = false;
            this._connected = true;

            if (payload) {
              // Handle session update
              this.updateState(payload.params[0]);
            }
            // Emit connect event
            // @ts-ignore
            this.emit("connect");

            this.triggerConnect(wc);
            resolve(wc);
          });
        })
        .catch((error: any) => {
          this.isConnecting = false;
          reject(error);
        });
    })
  }

  // disableSessionCreation - if true, getWalletConnector won't try to create a new session
  // in case the connector is disconnected
  getWalletConnector(opts: { disableSessionCreation?: boolean } = {}): Promise<IConnector> {
    const { disableSessionCreation = false } = opts;
    const wc = this.wc;
    if (this.isConnecting) {
      return new Promise((resolve, _) => {
        this.onConnect((x: any) => resolve(x));
      })

    } else if (!wc.connected && !disableSessionCreation) {
      return this.connect()
    } else {
      return new Promise((resolve, _) => {
        if (!this.connected) {
          this._connected = true;
          this.updateState(wc.session);
        }
        resolve(wc);
      })
    }

  }

  async updateState(sessionParams: any) {
    const { accounts, chainId, networkId } = sessionParams;
    // Check if accounts changed and trigger event
    if (!this.accounts || (accounts && this.accounts !== accounts)) {
      this.wc.accounts = accounts;
      this.emit("accountsChanged", accounts);
    }
    // Check if chainId changed and trigger event
    if (!this.chainId || (chainId && this.chainId !== chainId)) {
      this.chainId = chainId;
      this.emit("chainChanged", chainId);
    }
    // Check if networkId changed and trigger event
    if (!this.networkId || (networkId && this.networkId !== networkId)) {
      this.networkId = networkId;
      this.emit("networkChanged", networkId);
    }
  }

  async subscribeWalletConnector() {
    const wc = await this.getWalletConnector();
    wc.on("disconnect", error => {
      if (error) {
        this.emit("error", error);
        return;
      } else {
        this.emit("disconnect", error);
        this.stop();
        // this.close()
      }
    });
    wc.on("session_update", (error, payload) => {
      if (error) {
        this.emit("error", error);
        return;
      }
      // Handle session update
      this.updateState(payload.params[0]);
    });
  }
}


export default WalletConnectSubprovider;
