"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("@walletconnect/utils");
const AES_ALGORITHM = "AES-CBC";
const AES_LENGTH = 256;
const HMAC_ALGORITHM = "SHA-256";
function exportKey(cryptoKey) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const buffer = yield window.crypto.subtle.exportKey("raw", cryptoKey);
        return buffer;
    });
}
exports.exportKey = exportKey;
function importKey(buffer, type = AES_ALGORITHM) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const aesParams = { length: AES_LENGTH, name: AES_ALGORITHM };
        const hmacParams = {
            hash: { name: HMAC_ALGORITHM },
            name: "HMAC",
        };
        const algoParams = type === AES_ALGORITHM ? aesParams : hmacParams;
        const usages = type === AES_ALGORITHM ? ["encrypt", "decrypt"] : ["sign", "verify"];
        const cryptoKey = yield window.crypto.subtle.importKey("raw", buffer, algoParams, true, usages);
        return cryptoKey;
    });
}
exports.importKey = importKey;
function generateKey(length) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const _length = length || 256;
        const cryptoKey = yield window.crypto.subtle.generateKey({
            length: _length,
            name: AES_ALGORITHM,
        }, true, ["encrypt", "decrypt"]);
        const key = yield exportKey(cryptoKey);
        return key;
    });
}
exports.generateKey = generateKey;
function createHmac(data, key) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const cryptoKey = yield importKey(key, "HMAC");
        const signature = yield window.crypto.subtle.sign({
            length: 256,
            name: "HMAC",
        }, cryptoKey, data);
        return signature;
    });
}
exports.createHmac = createHmac;
function verifyHmac(payload, key) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const cipherText = utils_1.convertHexToArrayBuffer(payload.data);
        const iv = utils_1.convertHexToArrayBuffer(payload.iv);
        const hmac = utils_1.convertHexToArrayBuffer(payload.hmac);
        const hmacHex = utils_1.convertArrayBufferToHex(hmac, true);
        const unsigned = utils_1.concatArrayBuffers(cipherText, iv);
        const chmac = yield createHmac(unsigned, key);
        const chmacHex = utils_1.convertArrayBufferToHex(chmac, true);
        if (utils_1.removeHexPrefix(hmacHex) === utils_1.removeHexPrefix(chmacHex)) {
            return true;
        }
        return false;
    });
}
exports.verifyHmac = verifyHmac;
function aesCbcEncrypt(data, key, iv) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const cryptoKey = yield importKey(key, AES_ALGORITHM);
        const result = yield window.crypto.subtle.encrypt({
            iv,
            name: AES_ALGORITHM,
        }, cryptoKey, data);
        return result;
    });
}
exports.aesCbcEncrypt = aesCbcEncrypt;
function aesCbcDecrypt(data, key, iv) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const cryptoKey = yield importKey(key, AES_ALGORITHM);
        const result = yield window.crypto.subtle.decrypt({
            iv,
            name: AES_ALGORITHM,
        }, cryptoKey, data);
        return result;
    });
}
exports.aesCbcDecrypt = aesCbcDecrypt;
function encrypt(data, key) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!key) {
            throw new Error("Missing key: required for encryption");
        }
        const iv = yield generateKey(128);
        const ivHex = utils_1.convertArrayBufferToHex(iv, true);
        const contentString = JSON.stringify(data);
        const content = utils_1.convertUtf8ToArrayBuffer(contentString);
        const cipherText = yield aesCbcEncrypt(content, key, iv);
        const cipherTextHex = utils_1.convertArrayBufferToHex(cipherText, true);
        const unsigned = utils_1.concatArrayBuffers(cipherText, iv);
        const hmac = yield createHmac(unsigned, key);
        const hmacHex = utils_1.convertArrayBufferToHex(hmac, true);
        return {
            data: cipherTextHex,
            hmac: hmacHex,
            iv: ivHex,
        };
    });
}
exports.encrypt = encrypt;
function decrypt(payload, key) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!key) {
            throw new Error("Missing key: required for decryption");
        }
        const verified = yield verifyHmac(payload, key);
        if (!verified) {
            return null;
        }
        const cipherText = utils_1.convertHexToArrayBuffer(payload.data);
        const iv = utils_1.convertHexToArrayBuffer(payload.iv);
        const buffer = yield aesCbcDecrypt(cipherText, key, iv);
        const utf8 = utils_1.convertArrayBufferToUtf8(buffer);
        let data;
        try {
            data = JSON.parse(utf8);
        }
        catch (error) {
            return null;
        }
        return data;
    });
}
exports.decrypt = decrypt;
//# sourceMappingURL=index.js.map