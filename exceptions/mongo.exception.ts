import {SugoiError} from "@sugoi/core";

export class SugoiMongoError extends SugoiError {

    constructor(message: string, code: number) {
        super(message, code);
    }
}