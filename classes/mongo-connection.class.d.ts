import { Connection } from "@sugoi/orm";
export declare class MongoConnection extends Connection {
    newParser: boolean;
    protected constructor(hostName: string, db: string, port?: number);
    shouldUseNewParser(): boolean;
    disconnect(): any;
    getConnectionString(): string;
}
