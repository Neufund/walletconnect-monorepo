"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const network_1 = tslib_1.__importDefault(require("./network"));
// @ts-ignore
const WS = global.WebSocket || require("ws");
// -- SocketTransport ------------------------------------------------------ //
class SocketTransport {
    // -- constructor ----------------------------------------------------- //
    constructor(opts) {
        this._queue = [];
        this._events = [];
        this._subscriptions = [];
        this._initiating = false;
        this._url = "";
        this._netMonitor = null;
        this._socket = null;
        this._nextSocket = null;
        this._subscriptions = opts.subscriptions || [];
        this._netMonitor = opts.netMonitor || new network_1.default();
        if (!opts.url || typeof opts.url !== "string") {
            throw new Error("Missing or invalid WebSocket url");
        }
        this._url = opts.url;
        this._netMonitor.on("online", () => this._socketCreate());
    }
    set readyState(value) {
        // empty
    }
    get readyState() {
        return this._socket ? this._socket.readyState : -1;
    }
    set connecting(value) {
        // empty
    }
    get connecting() {
        return this.readyState === 0;
    }
    set connected(value) {
        // empty
    }
    get connected() {
        return this.readyState === 1;
    }
    set closing(value) {
        // empty
    }
    get closing() {
        return this.readyState === 2;
    }
    set closed(value) {
        // empty
    }
    get closed() {
        return this.readyState === 3;
    }
    // -- public ---------------------------------------------------------- //
    open() {
        this._socketCreate();
    }
    close() {
        this._socketClose();
    }
    send(message, topic, silent) {
        if (!topic || typeof topic !== "string") {
            throw new Error("Missing or invalid topic field");
        }
        this._socketSend({
            topic: topic,
            type: "pub",
            payload: message,
            silent: !!silent,
        });
    }
    subscribe(topic) {
        this._socketSend({
            topic: topic,
            type: "sub",
            payload: "",
            silent: true,
        });
    }
    on(event, callback) {
        this._events.push({ event, callback });
    }
    // -- private ---------------------------------------------------------- //
    _socketCreate() {
        if (this._initiating) {
            return;
        }
        this._initiating = true;
        const url = this._url.startsWith("https")
            ? this._url.replace("https", "wss")
            : this._url.startsWith("http")
                ? this._url.replace("http", "ws")
                : this._url;
        this._nextSocket = new WS(url);
        if (!this._nextSocket) {
            throw new Error("Failed to create socket");
        }
        this._nextSocket.onmessage = (event) => this._socketReceive(event);
        this._nextSocket.onopen = () => this._socketOpen();
    }
    _socketOpen() {
        this._socketClose();
        this._initiating = false;
        this._socket = this._nextSocket;
        this._nextSocket = null;
        this._queueSubscriptions();
        this._pushQueue();
    }
    _socketClose() {
        if (this._socket) {
            this._socket.onclose = () => {
                // empty
            };
            this._socket.close();
        }
    }
    _socketSend(socketMessage) {
        const message = JSON.stringify(socketMessage);
        if (this._socket && this._socket.readyState === 1) {
            this._socket.send(message);
        }
        else {
            this._setToQueue(socketMessage);
            this._socketCreate();
        }
    }
    _socketReceive(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let socketMessage;
            try {
                socketMessage = JSON.parse(event.data);
            }
            catch (error) {
                return;
            }
            this._socketSend({
                topic: socketMessage.topic,
                type: "ack",
                payload: "",
                silent: true,
            });
            if (this._socket && this._socket.readyState === 1) {
                const events = this._events.filter(event => event.event === "message");
                if (events && events.length) {
                    events.forEach(event => event.callback(socketMessage));
                }
            }
        });
    }
    _queueSubscriptions() {
        const subscriptions = this._subscriptions;
        subscriptions.forEach((topic) => this._queue.push({
            topic: topic,
            type: "sub",
            payload: "",
            silent: true,
        }));
        this._subscriptions = [];
    }
    _setToQueue(socketMessage) {
        this._queue.push(socketMessage);
    }
    _pushQueue() {
        const queue = this._queue;
        queue.forEach((socketMessage) => this._socketSend(socketMessage));
        this._queue = [];
    }
}
exports.default = SocketTransport;
//# sourceMappingURL=index.js.map