import * as browserLib from "./browser";
import * as nodeLib from "./node";
declare function open(uri: string, cb: any): void;
declare function close(): void;
export declare const browser: typeof browserLib;
export declare const node: typeof nodeLib;
declare const _default: {
    open: typeof open;
    close: typeof close;
};
export default _default;
//# sourceMappingURL=index.d.ts.map