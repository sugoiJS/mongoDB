import { Collection, CollectionInsertOneOptions, Db, MongoClient, MongoClientOptions, ObjectID, ReplaceOneOptions } from "mongodb";
import { MongoConnection } from "./mongo-connection.class";
import { ConnectableModel } from "@sugoi/orm";
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
    saveEmitter(options: CollectionInsertOneOptions): Promise<any>;
    updateEmitter(options?: ReplaceOneOptions): Promise<any>;
    protected removeEmitter(query?: {
        "_id": ObjectID;
    }): Promise<any>;
    protected formalize(): {};
    toJSON(): this & {};
    static clone(classIns: any, data: any): any;
    static connectEmitter(connection: MongoConnection): Promise<{
        dbInstance: Db;
        client: MongoClient;
    }>;
}
