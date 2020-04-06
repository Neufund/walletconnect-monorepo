"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
const detect_browser_1 = require("detect-browser");
const bytes_1 = require("@ethersproject/bytes");
const address_1 = require("@ethersproject/address");
const strings_1 = require("@ethersproject/strings");
// -- ArrayBuffer ------------------------------------------ //
function convertArrayBufferToBuffer(arrayBuffer) {
    const hex = convertArrayBufferToHex(arrayBuffer);
    const result = convertHexToBuffer(hex);
    return result;
}
exports.convertArrayBufferToBuffer = convertArrayBufferToBuffer;
function convertArrayBufferToUtf8(arrayBuffer) {
    const utf8 = strings_1.toUtf8String(new Uint8Array(arrayBuffer));
    return utf8;
}
exports.convertArrayBufferToUtf8 = convertArrayBufferToUtf8;
function convertArrayBufferToHex(arrayBuffer, noPrefix) {
    let hex = bytes_1.hexlify(new Uint8Array(arrayBuffer));
    if (noPrefix) {
        hex = removeHexPrefix(hex);
    }
    return hex;
}
exports.convertArrayBufferToHex = convertArrayBufferToHex;
function convertArrayBufferToNumber(arrayBuffer) {
    const hex = convertArrayBufferToHex(arrayBuffer);
    const num = convertHexToNumber(hex);
    return num;
}
exports.convertArrayBufferToNumber = convertArrayBufferToNumber;
function concatArrayBuffers(...args) {
    const hex = args.map(b => convertArrayBufferToHex(b, true)).join("");
    const result = convertHexToArrayBuffer(hex);
    return result;
}
exports.concatArrayBuffers = concatArrayBuffers;
// -- Buffer ----------------------------------------------- //
function convertBufferToArrayBuffer(buffer) {
    const hex = convertBufferToHex(buffer);
    const result = convertHexToArrayBuffer(hex);
    return result;
}
exports.convertBufferToArrayBuffer = convertBufferToArrayBuffer;
function convertBufferToUtf8(buffer) {
    const result = buffer.toString("utf8");
    return result;
}
exports.convertBufferToUtf8 = convertBufferToUtf8;
function convertBufferToHex(buffer, noPrefix) {
    let hex = buffer.toString("hex");
    if (!noPrefix) {
        hex = addHexPrefix(hex);
    }
    return hex;
}
exports.convertBufferToHex = convertBufferToHex;
function convertBufferToNumber(buffer) {
    const hex = convertBufferToHex(buffer);
    const num = convertHexToNumber(hex);
    return num;
}
exports.convertBufferToNumber = convertBufferToNumber;
function concatBuffers(...args) {
    const result = Buffer.concat(args);
    return result;
}
exports.concatBuffers = concatBuffers;
// -- Utf8 ------------------------------------------------- //
function convertUtf8ToArrayBuffer(utf8) {
    const arrayBuffer = strings_1.toUtf8Bytes(utf8).buffer;
    return arrayBuffer;
}
exports.convertUtf8ToArrayBuffer = convertUtf8ToArrayBuffer;
function convertUtf8ToBuffer(utf8) {
    const result = Buffer.from(utf8, "utf8");
    return result;
}
exports.convertUtf8ToBuffer = convertUtf8ToBuffer;
function convertUtf8ToHex(utf8, noPrefix) {
    const arrayBuffer = convertUtf8ToArrayBuffer(utf8);
    const hex = convertArrayBufferToHex(arrayBuffer, noPrefix);
    return hex;
}
exports.convertUtf8ToHex = convertUtf8ToHex;
function convertUtf8ToNumber(utf8) {
    const num = new bignumber_js_1.default(utf8).toNumber();
    return num;
}
exports.convertUtf8ToNumber = convertUtf8ToNumber;
// -- Number ----------------------------------------------- //
function convertNumberToBuffer(num) {
    const hex = convertNumberToHex(num);
    const buffer = convertHexToBuffer(hex);
    return buffer;
}
exports.convertNumberToBuffer = convertNumberToBuffer;
function convertNumberToArrayBuffer(num) {
    const hex = convertNumberToHex(num);
    const arrayBuffer = convertHexToArrayBuffer(hex);
    return arrayBuffer;
}
exports.convertNumberToArrayBuffer = convertNumberToArrayBuffer;
function convertNumberToUtf8(num) {
    const utf8 = new bignumber_js_1.default(num).toString();
    return utf8;
}
exports.convertNumberToUtf8 = convertNumberToUtf8;
function convertNumberToHex(num, noPrefix) {
    let hex = new bignumber_js_1.default(num).toString(16);
    hex = sanitizeHex(hex);
    if (noPrefix) {
        hex = removeHexPrefix(hex);
    }
    return hex;
}
exports.convertNumberToHex = convertNumberToHex;
// -- Hex -------------------------------------------------- //
function convertHexToBuffer(hex) {
    hex = removeHexPrefix(hex);
    const buffer = Buffer.from(hex, "hex");
    return buffer;
}
exports.convertHexToBuffer = convertHexToBuffer;
function convertHexToArrayBuffer(hex) {
    hex = addHexPrefix(hex);
    const arrayBuffer = bytes_1.arrayify(hex).buffer;
    return arrayBuffer;
}
exports.convertHexToArrayBuffer = convertHexToArrayBuffer;
function convertHexToUtf8(hex) {
    const arrayBuffer = convertHexToArrayBuffer(hex);
    const utf8 = convertArrayBufferToUtf8(arrayBuffer);
    return utf8;
}
exports.convertHexToUtf8 = convertHexToUtf8;
function convertHexToNumber(hex) {
    const num = new bignumber_js_1.default(hex).toNumber();
    return num;
}
exports.convertHexToNumber = convertHexToNumber;
// -- Misc ------------------------------------------------- //
function isMobile() {
    let mobile = false;
    function hasTouchEvent() {
        try {
            document.createEvent("TouchEvent");
            return true;
        }
        catch (e) {
            return false;
        }
    }
    function hasMobileUserAgent() {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(navigator.userAgent.substr(0, 4))) {
            return true;
        }
        else if (hasTouchEvent()) {
            return true;
        }
        return false;
    }
    mobile = hasMobileUserAgent();
    return mobile;
}
exports.isMobile = isMobile;
function getQueryString(url) {
    const pathEnd = url.indexOf("?") !== -1 ? url.indexOf("?") : undefined;
    const queryString = typeof pathEnd !== "undefined" ? url.substr(pathEnd) : "";
    return queryString;
}
exports.getQueryString = getQueryString;
function appendToQueryString(queryString, newQueryParams) {
    let queryParams = parseQueryString(queryString);
    queryParams = Object.assign(Object.assign({}, queryParams), newQueryParams);
    queryString = formatQueryString(queryParams);
    return queryString;
}
exports.appendToQueryString = appendToQueryString;
function formatQueryString(queryParams) {
    let result = "";
    const keys = Object.keys(queryParams);
    if (keys) {
        keys.forEach((key, idx) => {
            const value = queryParams[key];
            if (idx === 0) {
                result = `?${key}=${value}`;
            }
            else {
                result = result + `&${key}=${value}`;
            }
        });
    }
    return result;
}
exports.formatQueryString = formatQueryString;
function detectEnv(userAgent) {
    return detect_browser_1.detect(userAgent);
}
exports.detectEnv = detectEnv;
function sanitizeHex(hex) {
    hex = removeHexPrefix(hex);
    hex = hex.length % 2 !== 0 ? "0" + hex : hex;
    if (hex) {
        hex = addHexPrefix(hex);
    }
    return hex;
}
exports.sanitizeHex = sanitizeHex;
function addHexPrefix(hex) {
    if (hex.toLowerCase().substring(0, 2) === "0x") {
        return hex;
    }
    return "0x" + hex;
}
exports.addHexPrefix = addHexPrefix;
function removeHexPrefix(hex) {
    if (hex.toLowerCase().substring(0, 2) === "0x") {
        return hex.substring(2);
    }
    return hex;
}
exports.removeHexPrefix = removeHexPrefix;
function removeHexLeadingZeros(hex) {
    hex = removeHexPrefix(hex);
    hex = hex.startsWith("0") ? hex.substring(1) : hex;
    hex = addHexPrefix(hex);
    return hex;
}
exports.removeHexLeadingZeros = removeHexLeadingZeros;
function isHexString(value) {
    return bytes_1.isHexString(value);
}
exports.isHexString = isHexString;
function isEmptyString(value) {
    return value === "" || (typeof value === "string" && value.trim() === "");
}
exports.isEmptyString = isEmptyString;
function payloadId() {
    const datePart = new Date().getTime() * Math.pow(10, 3);
    const extraPart = Math.floor(Math.random() * Math.pow(10, 3));
    const id = datePart + extraPart;
    return id;
}
exports.payloadId = payloadId;
function uuid() {
    const result = ((a, b) => {
        for (b = a = ""; a++ < 36; b += (a * 51) & 52 ? (a ^ 15 ? 8 ^ (Math.random() * (a ^ 20 ? 16 : 4)) : 4).toString(16) : "-") {
            // empty
        }
        return b;
    })();
    return result;
}
exports.uuid = uuid;
exports.toChecksumAddress = (address) => {
    return address_1.getAddress(address);
};
exports.isValidAddress = (address) => {
    function isAddressAllLowercase(str) {
        return /^(0x)?[0-9a-f]{40}$/i.test(str);
    }
    if (!address) {
        return false;
    }
    else if (address.toLowerCase().substring(0, 2) !== "0x") {
        return false;
    }
    else if (!isAddressAllLowercase(address)) {
        return false;
    }
    else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        return true;
    }
    else {
        return address === exports.toChecksumAddress(address);
    }
};
function getMeta() {
    var _a, _b;
    if (typeof window === "undefined" ||
        typeof ((_a = window) === null || _a === void 0 ? void 0 : _a.document) === "undefined" ||
        typeof ((_b = window) === null || _b === void 0 ? void 0 : _b.location) === "undefined") {
        return null;
    }
    function getIcons() {
        const links = document.getElementsByTagName("link");
        const icons = [];
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const rel = link.getAttribute("rel");
            if (rel) {
                if (rel.toLowerCase().indexOf("icon") > -1) {
                    const href = link.getAttribute("href");
                    if (href) {
                        if (href.toLowerCase().indexOf("https:") === -1 &&
                            href.toLowerCase().indexOf("http:") === -1 &&
                            href.indexOf("//") !== 0) {
                            let absoluteHref = window.location.protocol + "//" + window.location.host;
                            if (href.indexOf("/") === 0) {
                                absoluteHref += href;
                            }
                            else {
                                const path = window.location.pathname.split("/");
                                path.pop();
                                const finalPath = path.join("/");
                                absoluteHref += finalPath + "/" + href;
                            }
                            icons.push(absoluteHref);
                        }
                        else if (href.indexOf("//") === 0) {
                            const absoluteUrl = window.location.protocol + href;
                            icons.push(absoluteUrl);
                        }
                        else {
                            icons.push(href);
                        }
                    }
                }
            }
        }
        return icons;
    }
    function getMetaOfAny(...args) {
        const metaTags = document.getElementsByTagName("meta");
        for (let i = 0; i < metaTags.length; i++) {
            const tag = metaTags[i];
            const attributes = ["itemprop", "property", "name"]
                .map(target => tag.getAttribute(target))
                .filter(attr => {
                if (attr) {
                    args.includes(attr);
                }
            });
            if (attributes.length && attributes) {
                const content = tag.getAttribute("content");
                if (content) {
                    return content;
                }
            }
        }
        return "";
    }
    function getName() {
        let name = getMetaOfAny("name", "og:site_name", "og:title", "twitter:title");
        if (!name) {
            name = document.title;
        }
        return name;
    }
    function getDescription() {
        const description = getMetaOfAny("description", "og:description", "twitter:description", "keywords");
        return description;
    }
    const name = getName();
    const description = getDescription();
    const url = window.location.origin;
    const icons = getIcons();
    const meta = {
        description,
        url,
        icons,
        name,
    };
    return meta;
}
exports.getMeta = getMeta;
function parseQueryString(queryString) {
    const result = {};
    const pairs = (queryString[0] === "?" ? queryString.substr(1) : queryString).split("&");
    for (let i = 0; i < pairs.length; i++) {
        const keyArr = pairs[i].match(/\w+(?==)/i) || [];
        const valueArr = pairs[i].match(/=.+/i) || [];
        if (keyArr[0]) {
            result[decodeURIComponent(keyArr[0])] = decodeURIComponent(valueArr[0].substr(1));
        }
    }
    return result;
}
exports.parseQueryString = parseQueryString;
function parseWalletConnectUri(str) {
    const pathStart = str.indexOf(":");
    const pathEnd = str.indexOf("?") !== -1 ? str.indexOf("?") : undefined;
    const protocol = str.substring(0, pathStart);
    const path = str.substring(pathStart + 1, pathEnd);
    function parseRequiredParams(path) {
        const separator = "@";
        const values = path.split(separator);
        const requiredParams = {
            handshakeTopic: values[0],
            version: parseInt(values[1], 10),
        };
        return requiredParams;
    }
    const requiredParams = parseRequiredParams(path);
    const queryString = typeof pathEnd !== "undefined" ? str.substr(pathEnd) : "";
    function parseQueryParams(queryString) {
        const result = parseQueryString(queryString);
        const parameters = {
            key: result.key || "",
            bridge: result.bridge || "",
        };
        return parameters;
    }
    const queryParams = parseQueryParams(queryString);
    const result = Object.assign(Object.assign({ protocol }, requiredParams), queryParams);
    return result;
}
exports.parseWalletConnectUri = parseWalletConnectUri;
function promisify(originalFn, thisArg) {
    const promisifiedFunction = (...callArgs) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const callback = (err, data) => {
                if (err === null || typeof err === "undefined") {
                    reject(err);
                }
                resolve(data);
            };
            originalFn.apply(thisArg, [...callArgs, callback]);
        });
    });
    return promisifiedFunction;
}
exports.promisify = promisify;
function isEmptyArray(array) {
    return !(array && array.length);
}
exports.isEmptyArray = isEmptyArray;
function parsePersonalSign(params) {
    if (!isEmptyArray(params) && !isHexString(params[0])) {
        params[0] = convertUtf8ToHex(params[0]);
    }
    return params;
}
exports.parsePersonalSign = parsePersonalSign;
function parseTransactionData(txData) {
    if (typeof txData.from === "undefined" || !exports.isValidAddress(txData.from)) {
        throw new Error(`Transaction object must include a valid 'from' value.`);
    }
    function parseHexValues(value) {
        let result = value;
        if (typeof value === "number" || (typeof value === "string" && !isEmptyString(value))) {
            if (!isHexString(value)) {
                result = convertNumberToHex(value);
            }
            else if (typeof value === "string") {
                result = sanitizeHex(value);
            }
        }
        if (typeof result === "string") {
            result = removeHexLeadingZeros(result);
        }
        return result;
    }
    const txDataRPC = {
        from: sanitizeHex(txData.from),
        to: typeof txData.to === "undefined" ? "" : sanitizeHex(txData.to),
        gasPrice: typeof txData.gasPrice === "undefined" ? "" : parseHexValues(txData.gasPrice),
        gasLimit: typeof txData.gasLimit === "undefined"
            ? typeof txData.gas === "undefined"
                ? ""
                : parseHexValues(txData.gas)
            : parseHexValues(txData.gasLimit),
        value: typeof txData.value === "undefined" ? "" : parseHexValues(txData.value),
        nonce: typeof txData.nonce === "undefined" ? "" : parseHexValues(txData.nonce),
        data: typeof txData.data === "undefined" ? "" : sanitizeHex(txData.data) || "0x",
    };
    const prunable = ["gasPrice", "gasLimit", "value", "nonce"];
    Object.keys(txDataRPC).forEach((key) => {
        if (!txDataRPC[key].trim().length && prunable.includes(key)) {
            delete txDataRPC[key];
        }
    });
    return txDataRPC;
}
exports.parseTransactionData = parseTransactionData;
function formatRpcError(error) {
    const message = error.message || "Failed or Rejected Request";
    let code = -32000;
    if (error && !error.code) {
        switch (message) {
            case "Parse error":
                code = -32700;
                break;
            case "Invalid request":
                code = -32600;
                break;
            case "Method not found":
                code = -32601;
                break;
            case "Invalid params":
                code = -32602;
                break;
            case "Internal error":
                code = -32603;
                break;
            default:
                code = -32000;
                break;
        }
    }
    const result = {
        code,
        message,
    };
    return result;
}
exports.formatRpcError = formatRpcError;
// -- typeGuards ----------------------------------------------------------- //
function isJsonRpcSubscription(object) {
    return typeof object.params === "object";
}
exports.isJsonRpcSubscription = isJsonRpcSubscription;
function isJsonRpcRequest(object) {
    return typeof object.method !== "undefined";
}
exports.isJsonRpcRequest = isJsonRpcRequest;
function isJsonRpcResponseSuccess(object) {
    return typeof object.result !== "undefined";
}
exports.isJsonRpcResponseSuccess = isJsonRpcResponseSuccess;
function isJsonRpcResponseError(object) {
    return typeof object.error !== "undefined";
}
exports.isJsonRpcResponseError = isJsonRpcResponseError;
function isInternalEvent(object) {
    return typeof object.event !== "undefined";
}
exports.isInternalEvent = isInternalEvent;
function isWalletConnectSession(object) {
    return typeof object.bridge !== "undefined";
}
exports.isWalletConnectSession = isWalletConnectSession;
function isReservedEvent(event) {
    const reservedEvents = [
        "session_request",
        "session_update",
        "exchange_key",
        "connect",
        "disconnect",
        "display_uri",
        "transport_open",
        "transport_close",
    ];
    return reservedEvents.includes(event) || event.startsWith("wc_");
}
exports.isReservedEvent = isReservedEvent;
exports.signingMethods = [
    "eth_sendTransaction",
    "eth_signTransaction",
    "eth_sign",
    "eth_signTypedData",
    "eth_signTypedData_v1",
    "eth_signTypedData_v3",
    "personal_sign",
];
exports.stateMethods = ["eth_accounts", "eth_chainId", "net_version"];
function isSilentPayload(request) {
    if (request.method.startsWith("wc_")) {
        return true;
    }
    if (exports.signingMethods.includes(request.method)) {
        return false;
    }
    return true;
}
exports.isSilentPayload = isSilentPayload;
function logDeprecationWarning() {
    console.warn("DEPRECATION WARNING: This WalletConnect client library will be deprecated in favor of @walletconnect/client. Please check docs.walletconnect.org to learn more about this migration!");
}
exports.logDeprecationWarning = logDeprecationWarning;
function isIOS() {
    const env = detectEnv();
    const result = env && env.os ? env.os.toLowerCase() === "ios" : false;
    return result;
}
exports.isIOS = isIOS;
function isAndroid() {
    const env = detectEnv();
    const result = env && env.os ? env.os.toLowerCase() === "android" : false;
    return result;
}
exports.isAndroid = isAndroid;
function isNode() {
    const env = detectEnv();
    const result = env && env.name ? env.name.toLowerCase() === "node" : false;
    return result;
}
exports.isNode = isNode;
function isBrowser() {
    const result = !isNode() && typeof window !== "undefined" && typeof window.navigator !== "undefined";
    return result;
}
exports.isBrowser = isBrowser;
//# sourceMappingURL=index.js.map