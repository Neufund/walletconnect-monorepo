/// <reference types="node" />
import EventEmitter from "events";
interface IXHRPost {
    method: string;
    headers: {
        [key: string]: string;
    };
    body: any;
}
declare class HTTPConnection extends EventEmitter {
    url: string;
    post: IXHRPost;
    constructor(url: string);
    formatError(payload: any, message: string, code?: number): {
        error: {
            message: string;
            code: number;
        };
        id: any;
        jsonrpc: any;
    };
    send(payload: any, internal?: any): Promise<unknown>;
}
export default HTTPConnection;
//# sourceMappingURL=index.d.ts.map