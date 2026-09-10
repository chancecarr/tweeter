"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLambdaError = void 0;
function handleLambdaError(error) {
    if (error instanceof Error) {
        if (error.message.includes("[unauthorized]") ||
            error.message.includes("[bad-request]")) {
            throw error;
        }
        throw new Error(`[internal-server-error]: ${error.message}`);
    }
    throw new Error(`[internal-server-error]: ${String(error)}`);
}
exports.handleLambdaError = handleLambdaError;
