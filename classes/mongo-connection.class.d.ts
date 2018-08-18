import { Connection } from "@sugoi/orm";
export declare class MongoConnection extends Connection {
    protected constructor(hostName: string, db: string, port?: number);
    disconnect(): any;
    getConnectionString(): string;
}
