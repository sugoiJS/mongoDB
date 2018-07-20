import { SugoiError } from "@sugoi/core";
export declare class SugoiMongoError extends SugoiError {
    constructor(message: string, code: number);
}
