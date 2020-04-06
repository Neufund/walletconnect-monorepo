"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("@walletconnect/utils");
const socket_transport_1 = tslib_1.__importDefault(require("@walletconnect/socket-transport"));
const errors_1 = require("./errors");
const events_1 = tslib_1.__importDefault(require("./events"));
const storage_1 = tslib_1.__importDefault(require("./storage"));
// -- Connector ------------------------------------------------------------ //
class Connector {
    // -- constructor ----------------------------------------------------- //
    constructor(opts) {
        this.cryptoLib = opts.cryptoLib;
        this.protocol = "wc";
        this.version = 1;
        this._bridge = opts.connectorOpts.bridge || "https://bridge.walletconnect.org";
        this._key = null;
        this._nextKey = null;
        this._clientId = "";
        this._clientMeta = utils_1.getMeta() || opts.clientMeta || null;
        this._peerId = "";
        this._peerMeta = null;
        this._handshakeId = 0;
        this._handshakeTopic = "";
        this._accounts = [];
        this._chainId = 0;
        this._networkId = 0;
        this._rpcUrl = "";
        this._eventManager = new events_1.default();
        this._connected = false;
        this._sessionStorage = opts.sessionStorage || new storage_1.default();
        this._qrcodeModal = opts.qrcodeModal || null;
        if (!this.bridge && !opts.connectorOpts.uri && !opts.connectorOpts.session) {
            throw new Error(errors_1.ERROR_MISSING_REQUIRED);
        }
        if (opts.connectorOpts.uri) {
            this.uri = opts.connectorOpts.uri;
        }
        let session = opts.connectorOpts.session || null;
        if (!session) {
            session = this._getStorageSession();
        }
        if (session) {
            this.session = session;
        }
        if (this.handshakeId) {
            this._subscribeToSessionResponse(this.handshakeId, "Session request rejected");
        }
        this._transport =
            opts.transport ||
                new socket_transport_1.default({
                    url: this.bridge,
                    subscriptions: [this.clientId],
                    netMonitor: opts.connectorOpts.netMonitor,
                });
        if (opts.connectorOpts.uri) {
            this._subscribeToSessionRequest();
        }
        this._subscribeToInternalEvents();
        this._transport.open();
        if (opts.pushServerOpts) {
            this._registerPushServer(opts.pushServerOpts);
        }
    }
    // -- setters / getters ----------------------------------------------- //
    set bridge(value) {
        if (!value) {
            return;
        }
        this._bridge = value;
    }
    get bridge() {
        return this._bridge;
    }
    set key(value) {
        if (!value) {
            return;
        }
        const key = utils_1.convertHexToArrayBuffer(value);
        this._key = key;
    }
    get key() {
        if (this._key) {
            const key = utils_1.convertArrayBufferToHex(this._key, true);
            return key;
        }
        return "";
    }
    set nextKey(value) {
        if (!value) {
            return;
        }
        const nextKey = utils_1.convertHexToArrayBuffer(value);
        this._nextKey = nextKey;
    }
    get nextKey() {
        if (this._nextKey) {
            const nextKey = utils_1.convertArrayBufferToHex(this._nextKey);
            return nextKey;
        }
        return "";
    }
    set clientId(value) {
        if (!value) {
            return;
        }
        this._clientId = value;
    }
    get clientId() {
        let clientId = this._clientId;
        if (!clientId) {
            clientId = this._clientId = utils_1.uuid();
        }
        return this._clientId;
    }
    set peerId(value) {
        if (!value) {
            return;
        }
        this._peerId = value;
    }
    get peerId() {
        return this._peerId;
    }
    set clientMeta(value) {
        // empty
    }
    get clientMeta() {
        let clientMeta = this._clientMeta;
        if (!clientMeta) {
            clientMeta = this._clientMeta = utils_1.getMeta();
        }
        return clientMeta;
    }
    set peerMeta(value) {
        this._peerMeta = value;
    }
    get peerMeta() {
        const peerMeta = this._peerMeta;
        return peerMeta;
    }
    set handshakeTopic(value) {
        if (!value) {
            return;
        }
        this._handshakeTopic = value;
    }
    get handshakeTopic() {
        return this._handshakeTopic;
    }
    set handshakeId(value) {
        if (!value) {
            return;
        }
        this._handshakeId = value;
    }
    get handshakeId() {
        return this._handshakeId;
    }
    get uri() {
        const _uri = this._formatUri();
        return _uri;
    }
    set uri(value) {
        if (!value) {
            return;
        }
        const { handshakeTopic, bridge, key } = this._parseUri(value);
        this.handshakeTopic = handshakeTopic;
        this.bridge = bridge;
        this.key = key;
    }
    set chainId(value) {
        this._chainId = value;
    }
    get chainId() {
        const chainId = this._chainId;
        return chainId;
    }
    set networkId(value) {
        this._networkId = value;
    }
    get networkId() {
        const networkId = this._networkId;
        return networkId;
    }
    set accounts(value) {
        this._accounts = value;
    }
    get accounts() {
        const accounts = this._accounts;
        return accounts;
    }
    set rpcUrl(value) {
        this._rpcUrl = value;
    }
    get rpcUrl() {
        const rpcUrl = this._rpcUrl;
        return rpcUrl;
    }
    set connected(value) {
        // empty
    }
    get connected() {
        return this._connected;
    }
    set pending(value) {
        // empty
    }
    get pending() {
        return !!this._handshakeTopic;
    }
    get session() {
        return {
            connected: this.connected,
            accounts: this.accounts,
            chainId: this.chainId,
            bridge: this.bridge,
            key: this.key,
            clientId: this.clientId,
            clientMeta: this.clientMeta,
            peerId: this.peerId,
            peerMeta: this.peerMeta,
            handshakeId: this.handshakeId,
            handshakeTopic: this.handshakeTopic,
        };
    }
    set session(value) {
        if (!value) {
            return;
        }
        this._connected = value.connected;
        this.accounts = value.accounts;
        this.chainId = value.chainId;
        this.bridge = value.bridge;
        this.key = value.key;
        this.clientId = value.clientId;
        this.clientMeta = value.clientMeta;
        this.peerId = value.peerId;
        this.peerMeta = value.peerMeta;
        this.handshakeId = value.handshakeId;
        this.handshakeTopic = value.handshakeTopic;
    }
    // -- public ---------------------------------------------------------- //
    on(event, callback) {
        const eventEmitter = {
            event,
            callback,
        };
        this._eventManager.subscribe(eventEmitter);
    }
    createInstantRequest(instantRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this._key = yield this._generateKey();
            const request = this._formatRequest({
                method: "wc_instantRequest",
                params: [
                    {
                        peerId: this.clientId,
                        peerMeta: this.clientMeta,
                        request: this._formatRequest(instantRequest),
                    },
                ],
            });
            this.handshakeId = request.id;
            this.handshakeTopic = utils_1.uuid();
            if (this._qrcodeModal) {
                this._qrcodeModal.open(this.uri, () => {
                    throw new Error("QR Code Modal closed");
                });
            }
            this._eventManager.trigger({
                event: "display_uri",
                params: [{ uri: this.uri }],
            });
            const endInstantRequest = () => {
                this.killSession();
                if (this._qrcodeModal) {
                    this._qrcodeModal.close();
                }
            };
            try {
                const result = yield this._sendCallRequest(request);
                if (result) {
                    endInstantRequest();
                }
                return result;
            }
            catch (error) {
                endInstantRequest();
                throw error;
            }
        });
    }
    connect(opts) {
        if (!this._qrcodeModal) {
            throw new Error("QR Code Modal not provided");
        }
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.connected) {
                try {
                    yield this.createSession(opts);
                    if (this._qrcodeModal) {
                        this._qrcodeModal.open(this.uri, () => {
                            reject(new Error("QR Code Modal closed"));
                        });
                    }
                }
                catch (error) {
                    reject(error);
                }
            }
            this.on("connect", (error, payload) => {
                if (error) {
                    return reject(error);
                }
                if (this._qrcodeModal) {
                    this._qrcodeModal.close();
                }
                resolve(payload.params[0]);
            });
        }));
    }
    createSession(opts) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._connected) {
                throw new Error(errors_1.ERROR_SESSION_CONNECTED);
            }
            if (this.pending) {
                return;
            }
            this._key = yield this._generateKey();
            const request = this._formatRequest({
                method: "wc_sessionRequest",
                params: [
                    {
                        peerId: this.clientId,
                        peerMeta: this.clientMeta,
                        chainId: opts && opts.chainId ? opts.chainId : null,
                    },
                ],
            });
            this.handshakeId = request.id;
            this.handshakeTopic = utils_1.uuid();
            this._sendSessionRequest(request, "Session update rejected", {
                topic: this.handshakeTopic,
            });
            this._eventManager.trigger({
                event: "display_uri",
                params: [this.uri],
            });
        });
    }
    approveSession(sessionStatus) {
        if (this._connected) {
            throw new Error(errors_1.ERROR_SESSION_CONNECTED);
        }
        this.chainId = sessionStatus.chainId;
        this.accounts = sessionStatus.accounts;
        this.networkId = sessionStatus.networkId || 0;
        this.rpcUrl = sessionStatus.rpcUrl || "";
        const sessionParams = {
            approved: true,
            chainId: this.chainId,
            networkId: this.networkId,
            accounts: this.accounts,
            rpcUrl: this.rpcUrl,
            peerId: this.clientId,
            peerMeta: this.clientMeta,
        };
        const response = {
            id: this.handshakeId,
            jsonrpc: "2.0",
            result: sessionParams,
        };
        this._sendResponse(response);
        this._connected = true;
        this._eventManager.trigger({
            event: "connect",
            params: [
                {
                    peerId: this.peerId,
                    peerMeta: this.peerMeta,
                    chainId: this.chainId,
                    accounts: this.accounts,
                },
            ],
        });
        if (this._connected) {
            this._setStorageSession();
        }
    }
    rejectSession(sessionError) {
        if (this._connected) {
            throw new Error(errors_1.ERROR_SESSION_CONNECTED);
        }
        const message = sessionError && sessionError.message ? sessionError.message : errors_1.ERROR_SESSION_REJECTED;
        const response = this._formatResponse({
            id: this.handshakeId,
            error: { message },
        });
        this._sendResponse(response);
        this._connected = false;
        this._eventManager.trigger({
            event: "disconnect",
            params: [{ message }],
        });
        this._removeStorageSession();
    }
    updateSession(sessionStatus) {
        if (!this._connected) {
            throw new Error(errors_1.ERROR_SESSION_DISCONNECTED);
        }
        this.chainId = sessionStatus.chainId;
        this.accounts = sessionStatus.accounts;
        this.networkId = sessionStatus.networkId || 0;
        this.rpcUrl = sessionStatus.rpcUrl || "";
        const sessionParams = {
            approved: true,
            chainId: this.chainId,
            networkId: this.networkId,
            accounts: this.accounts,
            rpcUrl: this.rpcUrl,
        };
        const request = this._formatRequest({
            method: "wc_sessionUpdate",
            params: [sessionParams],
        });
        this._sendSessionRequest(request, "Session update rejected");
        this._eventManager.trigger({
            event: "session_update",
            params: [
                {
                    chainId: this.chainId,
                    accounts: this.accounts,
                },
            ],
        });
        this._manageStorageSession();
    }
    killSession(sessionError) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const message = sessionError ? sessionError.message : "Session Disconnected";
            // this needs a topic or a peerId to be present.
            // we need to be able to close the socket and cleanup even before peerId received
            if (this.peerId) {
                const sessionParams = {
                    approved: false,
                    chainId: null,
                    networkId: null,
                    accounts: null,
                };
                const request = this._formatRequest({
                    method: "wc_sessionUpdate",
                    params: [sessionParams],
                });
                yield this._sendRequest(request);
            }
            this._handleSessionDisconnect(message);
        });
    }
    sendTransaction(tx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._connected) {
                throw new Error(errors_1.ERROR_SESSION_DISCONNECTED);
            }
            const parsedTx = utils_1.parseTransactionData(tx);
            const request = this._formatRequest({
                method: "eth_sendTransaction",
                params: [parsedTx],
            });
            const result = yield this._sendCallRequest(request);
            return result;
        });
    }
    signTransaction(tx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._connected) {
                throw new Error(errors_1.ERROR_SESSION_DISCONNECTED);
            }
            const parsedTx = utils_1.parseTransactionData(tx);
            const request = this._formatRequest({
                method: "eth_signTransaction",
                params: [parsedTx],
            });
            const result = yield this._sendCallRequest(request);
            return result;
        });
    }
    signMessage(params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._connected) {
                throw new Error(errors_1.ERROR_SESSION_DISCONNECTED);
            }
            const request = this._formatRequest({
                method: "eth_sign",
                params,
            });
            const result = yield this._sendCallRequest(request);
            return result;
        });
    }
    signPersonalMessage(params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._connected) {
                throw new Error(errors_1.ERROR_SESSION_DISCONNECTED);
            }
            params = utils_1.parsePersonalSign(params);
            const request = this._formatRequest({
                method: "personal_sign",
                params,
            });
            const result = yield this._sendCallRequest(request);
            return result;
        });
    }
    signTypedData(params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._connected) {
                throw new Error(errors_1.ERROR_SESSION_DISCONNECTED);
            }
            const request = this._formatRequest({
                method: "eth_signTypedData",
                params,
            });
            const result = yield this._sendCallRequest(request);
            return result;
        });
    }
    updateChain(chainParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._connected) {
                throw new Error("Session currently disconnected");
            }
            const request = this._formatRequest({
                method: "wallet_updateChain",
                params: [chainParams],
            });
            const result = yield this._sendCallRequest(request);
            return result;
        });
    }
    unsafeSend(request, options) {
        this._sendRequest(request, options);
        return new Promise((resolve, reject) => {
            this._subscribeToResponse(request.id, (error, payload) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (!payload) {
                    throw new Error(errors_1.ERROR_MISSING_JSON_RPC);
                }
                resolve(payload);
            });
        });
    }
    sendCustomRequest(request, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._connected) {
                throw new Error(errors_1.ERROR_SESSION_DISCONNECTED);
            }
            switch (request.method) {
                case "eth_accounts":
                    return this.accounts;
                case "eth_chainId":
                    return utils_1.convertNumberToHex(this.chainId);
                case "eth_sendTransaction":
                case "eth_signTransaction":
                    if (request.params) {
                        request.params[0] = utils_1.parseTransactionData(request.params[0]);
                    }
                    break;
                case "personal_sign":
                    if (request.params) {
                        request.params = utils_1.parsePersonalSign(request.params);
                    }
                    break;
                default:
                    break;
            }
            const formattedRequest = this._formatRequest(request);
            const result = yield this._sendCallRequest(formattedRequest, options);
            return result;
        });
    }
    approveRequest(response) {
        if (utils_1.isJsonRpcResponseSuccess(response)) {
            const formattedResponse = this._formatResponse(response);
            this._sendResponse(formattedResponse);
        }
        else {
            throw new Error(errors_1.ERROR_MISSING_RESULT);
        }
    }
    rejectRequest(response) {
        if (utils_1.isJsonRpcResponseError(response)) {
            const formattedResponse = this._formatResponse(response);
            this._sendResponse(formattedResponse);
        }
        else {
            throw new Error(errors_1.ERROR_MISSING_ERROR);
        }
    }
    // -- private --------------------------------------------------------- //
    _sendRequest(request, options) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const callRequest = this._formatRequest(request);
            const encryptionPayload = yield this._encrypt(callRequest);
            const topic = typeof ((_a = options) === null || _a === void 0 ? void 0 : _a.topic) !== "undefined" ? options.topic : this.peerId;
            const payload = JSON.stringify(encryptionPayload);
            const silent = typeof ((_b = options) === null || _b === void 0 ? void 0 : _b.forcePushNotification) !== "undefined"
                ? !options.forcePushNotification
                : utils_1.isSilentPayload(callRequest);
            this._transport.send(payload, topic, silent);
        });
    }
    _sendResponse(response) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const encryptionPayload = yield this._encrypt(response);
            const topic = this.peerId;
            const payload = JSON.stringify(encryptionPayload);
            const silent = true;
            this._transport.send(payload, topic, silent);
        });
    }
    _sendSessionRequest(request, errorMsg, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this._sendRequest(request, options);
            this._subscribeToSessionResponse(request.id, errorMsg);
        });
    }
    _sendCallRequest(request, options) {
        this._sendRequest(request, options);
        return this._subscribeToCallResponse(request.id);
    }
    _formatRequest(request) {
        if (typeof request.method === "undefined") {
            throw new Error(errors_1.ERROR_MISSING_METHOD);
        }
        const formattedRequest = {
            id: typeof request.id === "undefined" ? utils_1.payloadId() : request.id,
            jsonrpc: "2.0",
            method: request.method,
            params: typeof request.params === "undefined" ? [] : request.params,
        };
        return formattedRequest;
    }
    _formatResponse(response) {
        if (typeof response.id === "undefined") {
            throw new Error(errors_1.ERROR_MISSING_ID);
        }
        if (utils_1.isJsonRpcResponseError(response)) {
            const error = utils_1.formatRpcError(response.error);
            const errorResponse = Object.assign(Object.assign({ id: response.id, jsonrpc: "2.0" }, response), { error });
            return errorResponse;
        }
        else if (utils_1.isJsonRpcResponseSuccess(response)) {
            const successResponse = Object.assign({ id: response.id, jsonrpc: "2.0" }, response);
            return successResponse;
        }
        throw new Error(errors_1.ERROR_INVALID_RESPONSE);
    }
    _handleSessionDisconnect(errorMsg) {
        const message = errorMsg || "Session Disconnected";
        if (this._connected) {
            this._connected = false;
        }
        this._eventManager.trigger({
            event: "disconnect",
            params: [{ message }],
        });
        this._removeStorageSession();
        this._transport.close();
    }
    _handleSessionResponse(errorMsg, sessionParams) {
        if (sessionParams) {
            if (sessionParams.approved) {
                if (!this._connected) {
                    this._connected = true;
                    if (sessionParams.chainId) {
                        this.chainId = sessionParams.chainId;
                    }
                    if (sessionParams.accounts) {
                        this.accounts = sessionParams.accounts;
                    }
                    if (sessionParams.peerId && !this.peerId) {
                        this.peerId = sessionParams.peerId;
                    }
                    if (sessionParams.peerMeta && !this.peerMeta) {
                        this.peerMeta = sessionParams.peerMeta;
                    }
                    this._eventManager.trigger({
                        event: "connect",
                        params: [
                            {
                                peerId: this.peerId,
                                peerMeta: this.peerMeta,
                                chainId: this.chainId,
                                accounts: this.accounts,
                            },
                        ],
                    });
                }
                else {
                    if (sessionParams.chainId) {
                        this.chainId = sessionParams.chainId;
                    }
                    if (sessionParams.accounts) {
                        this.accounts = sessionParams.accounts;
                    }
                    this._eventManager.trigger({
                        event: "session_update",
                        params: [
                            {
                                chainId: this.chainId,
                                accounts: this.accounts,
                            },
                        ],
                    });
                }
                this._manageStorageSession();
            }
            else {
                this._handleSessionDisconnect(errorMsg);
            }
        }
        else {
            this._handleSessionDisconnect(errorMsg);
        }
    }
    _handleIncomingMessages(socketMessage) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const activeTopics = [this.clientId, this.handshakeTopic];
            if (!activeTopics.includes(socketMessage.topic)) {
                return;
            }
            let encryptionPayload;
            try {
                encryptionPayload = JSON.parse(socketMessage.payload);
            }
            catch (error) {
                return;
            }
            const payload = yield this._decrypt(encryptionPayload);
            if (payload) {
                this._eventManager.trigger(payload);
            }
        });
    }
    _subscribeToSessionRequest() {
        if (this._transport.subscribe) {
            this._transport.subscribe(this.handshakeTopic);
        }
    }
    _subscribeToResponse(id, callback) {
        this.on(`response:${id}`, callback);
    }
    _subscribeToSessionResponse(id, errorMsg) {
        this._subscribeToResponse(id, (error, payload) => {
            if (error) {
                this._handleSessionResponse(error.message);
                return;
            }
            if (payload.result) {
                this._handleSessionResponse(errorMsg, payload.result);
            }
            else if (payload.error && payload.error.message) {
                this._handleSessionResponse(payload.error.message);
            }
            else {
                this._handleSessionResponse(errorMsg);
            }
        });
    }
    _subscribeToCallResponse(id) {
        return new Promise((resolve, reject) => {
            this._subscribeToResponse(id, (error, payload) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (payload.result) {
                    resolve(payload.result);
                }
                else if (payload.error && payload.error.message) {
                    reject(new Error(payload.error.message));
                }
                else {
                    reject(new Error(errors_1.ERROR_INVALID_RESPONSE));
                }
            });
        });
    }
    _subscribeToInternalEvents() {
        this._transport.on("message", (socketMessage) => this._handleIncomingMessages(socketMessage));
        this._transport.on("open", () => this._eventManager.trigger({ event: "transport_open", params: [] }));
        this._transport.on("close", () => this._eventManager.trigger({ event: "transport_close", params: [] }));
        this.on("wc_sessionRequest", (error, payload) => {
            if (error) {
                this._eventManager.trigger({
                    event: "error",
                    params: [
                        {
                            code: "SESSION_REQUEST_ERROR",
                            message: error.toString(),
                        },
                    ],
                });
            }
            this.handshakeId = payload.id;
            this.peerId = payload.params[0].peerId;
            this.peerMeta = payload.params[0].peerMeta;
            const internalPayload = Object.assign(Object.assign({}, payload), { method: "session_request" });
            this._eventManager.trigger(internalPayload);
        });
        this.on("wc_sessionUpdate", (error, payload) => {
            if (error) {
                this._handleSessionResponse(error.message);
            }
            this._handleSessionResponse("Session disconnected", payload.params[0]);
        });
    }
    // -- uri ------------------------------------------------------------- //
    _formatUri() {
        const protocol = this.protocol;
        const handshakeTopic = this.handshakeTopic;
        const version = this.version;
        const bridge = encodeURIComponent(this.bridge);
        const key = this.key;
        const uri = `${protocol}:${handshakeTopic}@${version}?bridge=${bridge}&key=${key}`;
        return uri;
    }
    _parseUri(uri) {
        const result = utils_1.parseWalletConnectUri(uri);
        if (result.protocol === this.protocol) {
            if (!result.handshakeTopic) {
                throw Error("Invalid or missing handshakeTopic parameter value");
            }
            const handshakeTopic = result.handshakeTopic;
            if (!result.bridge) {
                throw Error("Invalid or missing bridge url parameter value");
            }
            const bridge = decodeURIComponent(result.bridge);
            if (!result.key) {
                throw Error("Invalid or missing kkey parameter value");
            }
            const key = result.key;
            return { handshakeTopic, bridge, key };
        }
        else {
            throw new Error(errors_1.ERROR_INVALID_URI);
        }
    }
    // -- crypto ---------------------------------------------------------- //
    _generateKey() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.cryptoLib) {
                const result = yield this.cryptoLib.generateKey();
                return result;
            }
            return null;
        });
    }
    _encrypt(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const key = this._key;
            if (this.cryptoLib && key) {
                const result = yield this.cryptoLib.encrypt(data, key);
                return result;
            }
            return null;
        });
    }
    _decrypt(payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const key = this._key;
            if (this.cryptoLib && key) {
                const result = yield this.cryptoLib.decrypt(payload, key);
                return result;
            }
            return null;
        });
    }
    // -- sessionStorage --------------------------------------------------------- //
    _getStorageSession() {
        let result = null;
        if (this._sessionStorage) {
            result = this._sessionStorage.getSession();
        }
        return result;
    }
    _setStorageSession() {
        if (this._sessionStorage) {
            this._sessionStorage.setSession(this.session);
        }
    }
    _removeStorageSession() {
        if (this._sessionStorage) {
            this._sessionStorage.removeSession();
        }
    }
    _manageStorageSession() {
        if (this._connected) {
            this._setStorageSession();
        }
        else {
            this._removeStorageSession();
        }
    }
    // -- pushServer ------------------------------------------------------------- //
    _registerPushServer(pushServerOpts) {
        if (!pushServerOpts.url || typeof pushServerOpts.url !== "string") {
            throw Error("Invalid or missing pushServerOpts.url parameter value");
        }
        if (!pushServerOpts.type || typeof pushServerOpts.type !== "string") {
            throw Error("Invalid or missing pushServerOpts.type parameter value");
        }
        if (!pushServerOpts.token || typeof pushServerOpts.token !== "string") {
            throw Error("Invalid or missing pushServerOpts.token parameter value");
        }
        const pushSubscription = {
            bridge: this.bridge,
            topic: this.clientId,
            type: pushServerOpts.type,
            token: pushServerOpts.token,
            peerName: "",
            language: pushServerOpts.language || "",
        };
        this.on("connect", (error, payload) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (error) {
                throw error;
            }
            if (pushServerOpts.peerMeta) {
                const peerName = payload.params[0].peerMeta.name;
                pushSubscription.peerName = peerName;
            }
            try {
                const response = yield fetch(`${pushServerOpts.url}/new`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(pushSubscription),
                });
                const json = yield response.json();
                if (!json.success) {
                    throw Error("Failed to register in Push Server");
                }
            }
            catch (error) {
                throw Error("Failed to register in Push Server");
            }
        }));
    }
}
exports.default = Connector;
//# sourceMappingURL=index.js.map