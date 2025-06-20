"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMessage = hasMessage;
exports.hasStack = hasStack;
function hasMessage(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'message' in obj &&
        typeof obj.message === 'string');
}
function hasStack(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'stack' in obj &&
        typeof obj.stack === 'string');
}
