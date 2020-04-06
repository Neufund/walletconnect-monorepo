"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const utils_1 = require("@walletconnect/utils");
const AES_ALGORITHM = "AES-256-CBC";
const HMAC_ALGORITHM = "SHA256";
function randomBytes(length) {
    return new Promise((resolve, reject) => {
        crypto_1.default.randomBytes(length, (error, result) => {
            if (error) {
                reject(error);
            }
            resolve(result);
        });
    });
}
exports.randomBytes = randomBytes;
function generateKey(length) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const _length = (length || 256) / 8;
        const buffer = yield randomBytes(_length);
        const hex = utils_1.convertBufferToHex(buffer, true);
        const result = utils_1.convertHexToArrayBuffer(hex);
        return result;
    });
}
exports.generateKey = generateKey;
function createHmac(data, key) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const hmac = crypto_1.default.createHmac(HMAC_ALGORITHM, key);
        hmac.update(data);
        const hex = hmac.digest("hex");
        const result = utils_1.convertHexToBuffer(hex);
        return result;
    });
}
exports.createHmac = createHmac;
function verifyHmac(payload, key) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const cipherText = utils_1.convertHexToBuffer(payload.data);
        const iv = utils_1.convertHexToBuffer(payload.iv);
        const hmac = utils_1.convertHexToBuffer(payload.hmac);
        const hmacHex = utils_1.convertBufferToHex(hmac, true);
        const unsigned = utils_1.concatBuffers(cipherText, iv);
        const chmac = yield createHmac(unsigned, key);
        const chmacHex = utils_1.convertBufferToHex(chmac, true);
        if (utils_1.removeHexPrefix(hmacHex) === utils_1.removeHexPrefix(chmacHex)) {
            return true;
        }
        return false;
    });
}
exports.verifyHmac = verifyHmac;
function aesCbcEncrypt(data, key, iv) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const cipher = crypto_1.default.createCipheriv(AES_ALGORITHM, key, iv);
        const result = utils_1.concatBuffers(cipher.update(data), cipher.final());
        return result;
    });
}
exports.aesCbcEncrypt = aesCbcEncrypt;
function aesCbcDecrypt(data, key, iv) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const decipher = crypto_1.default.createDecipheriv(AES_ALGORITHM, key, iv);
        const result = utils_1.concatBuffers(decipher.update(data), decipher.final());
        return result;
    });
}
exports.aesCbcDecrypt = aesCbcDecrypt;
function encrypt(data, key) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const _key = utils_1.convertArrayBufferToBuffer(key);
        const ivArrayBuffer = yield generateKey(128);
        const iv = utils_1.convertArrayBufferToBuffer(ivArrayBuffer);
        const ivHex = utils_1.convertBufferToHex(iv, true);
        const contentString = JSON.stringify(data);
        const content = utils_1.convertUtf8ToBuffer(contentString);
        const cipherText = yield aesCbcEncrypt(content, _key, iv);
        const cipherTextHex = utils_1.convertBufferToHex(cipherText, true);
        const unsigned = utils_1.concatBuffers(cipherText, iv);
        const hmac = yield createHmac(unsigned, _key);
        const hmacHex = utils_1.convertBufferToHex(hmac, true);
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
        const _key = utils_1.convertArrayBufferToBuffer(key);
        if (!_key) {
            throw new Error("Missing key: required for decryption");
        }
        const verified = yield verifyHmac(payload, _key);
        if (!verified) {
            return null;
        }
        const cipherText = utils_1.convertHexToBuffer(payload.data);
        const iv = utils_1.convertHexToBuffer(payload.iv);
        const buffer = yield aesCbcDecrypt(cipherText, _key, iv);
        const utf8 = utils_1.convertBufferToUtf8(buffer);
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