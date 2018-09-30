import { Collection, CollectionInsertOneOptions, CommonOptions, Db, MongoClient, ObjectID, ReplaceOneOptions, FilterQuery } from "mongodb";
import { MongoConnection } from "./mongo-connection.class";
import { QueryOptions, ConnectableModel } from "@sugoi/orm";
export declare abstract class MongoModel extends ConnectableModel {
    protected client: MongoClient;
    protected _id: ObjectID;
    protected static collection: Collection;
    protected static ConnectionType: typeof MongoConnection;
    constructor();
    static getIdObject(id: string | number): ObjectID;
    protected static getCollection(connectionName: string, collectionName: string): Promise<Collection>;
    getMongoId(): string;
    protected static setCollection(): Promise<Collection<any>>;
    static disconnect(connectionName?: string): Promise<any>;
    protected static findEmitter(query: FilterQuery<any>, options?: QueryOptions): Promise<any>;
    saveEmitter(options: CollectionInsertOneOptions): Promise<any>;
    updateEmitter(options?: ReplaceOneOptions): Promise<any>;
    protected static removeEmitter(query?: any, options?: QueryOptions & CommonOptions): Promise<any>;
    protected formalize(): {};
    toJSON(): this & {};
    static updateById<T = any>(id: string, data: any, options?: Partial<QueryOptions | any>): Promise<T>;
    static clone<T = any>(data: any): any;
    static connectEmitter(connection: MongoConnection): Promise<{
        dbInstance: Db;
        client: MongoClient;
    }>;
    private static checkForId;
}
