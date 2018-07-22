import { IMongoConfig } from "../interfaces/mongo-config.interface";
import { CONNECTION_STATUS } from "@sugoi/core";
import { Db } from "mongodb";
export declare class MongoConfig implements IMongoConfig {
    hostName: string;
    db: string;
    port: number;
    user?: string;
    password?: string;
    _authDB?: string;
    readonly authDB: string;
    status: CONNECTION_STATUS;
    connectionName: string;
    protected _dbInstance: Db;
    dbInstance: Db;
    protected constructor(hostName: string, db: string, port?: number);
    setCredentials(user: string, password: string): this;
    static clone(config: IMongoConfig): MongoConfig;
    static builder(hostName: string, db: string, port?: number): MongoConfig;
    setStatus(status: CONNECTION_STATUS): this;
    setAuthDB(db: string): this;
    setConnectionName(name?: string): void;
}
