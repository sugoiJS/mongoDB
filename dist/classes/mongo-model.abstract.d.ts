import { Collection, Db, MongoClient, MongoClientOptions, ObjectID } from "mongodb";
import { MongoConnection } from "./mongo-connection.class";
import { ConnectableModel } from "@sugoi/core";
export declare abstract class MongoModel extends ConnectableModel {
    protected client: MongoClient;
    protected collection: Collection;
    protected _id: ObjectID;
    protected static ConnectionType: typeof MongoConnection;
    constructor();
    static getIdObject(id: string): ObjectID;
    protected static getCollection(connectionName: string, collectionName: string): Promise<Collection>;
    getMongoId(): string;
    protected setCollection(): Promise<Collection<any>>;
    static disconnect(connectionName: string): Promise<any>;
    protected static findEmitter(query: any, options?: MongoClientOptions): Promise<any>;
    saveEmitter(options: any): Promise<any>;
    updateEmitter(options: any): Promise<any>;
    protected removeEmitter(query?: {
        "_id": string;
    }): Promise<any>;
    protected formalize(): {};
    toJSON(): this & {};
    static clone(classIns: any, data: any): any;
    static connectEmitter(connection: MongoConnection): Promise<{
        dbInstance: Db;
        client: MongoClient;
    }>;
}
