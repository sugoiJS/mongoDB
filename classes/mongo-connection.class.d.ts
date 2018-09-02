import { Connection } from "@sugoi/orm";
export declare class MongoConnection extends Connection {
    private newParser;
    protected constructor(hostName: string, db: string, port?: number);
    useNewParser(useNewParse: boolean): void;
    shouldUseNewParser(): boolean;
    disconnect(): any;
    getConnectionString(): string;
}
