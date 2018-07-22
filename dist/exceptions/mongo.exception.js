"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@sugoi/core");
class SugoiMongoError extends core_1.SugoiError {
    constructor(message, code) {
        super(message, code);
    }
}
exports.SugoiMongoError = SugoiMongoError;
