import { CONNECTION_STATUS, IConnection } from "@sugoi/orm";
import { Db, MongoClient } from "mongodb";
import { IMongoConnectionConfig } from "../interfaces/mongo-connection-config.interface";
export declare class MongoConnection implements IConnection, IMongoConnectionConfig {
    protocol: string;
    port: number;
    hostName: string;
    status: CONNECTION_STATUS;
    connectionClient: {
        dbInstance: Db;
        client: MongoClient;
    };
    db?: string;
    connectionName?: string;
    user?: string;
    password?: string;
    authDB?: string;
    newParser: boolean;
    connect(): Promise<boolean>;
    isConnected(): Promise<boolean>;
    shouldUseNewParser(): boolean;
    disconnect(): Promise<boolean>;
    getConnectionString(): string;
}
