import { Collection, CollectionInsertOneOptions, CommonOptions, MongoClient, ObjectID, ReplaceOneOptions, FilterQuery } from "mongodb";
import { QueryOptions, ConnectableModel, IConnection } from "@sugoi/orm";
import { IMongoConnectionConfig } from "../interfaces/mongo-connection-config.interface";
export declare abstract class MongoModel extends ConnectableModel {
    protected _id: ObjectID;
    protected client: MongoClient;
    protected static collection: Collection;
    constructor();
    static setConnection(configData: IMongoConnectionConfig, connectionName?: string): Promise<IConnection>;
    static getIdObject(id: string | number): ObjectID;
    protected static getCollection(connectionName: string, collectionName: string): Promise<Collection>;
    getMongoId(): string;
    protected static setCollection(): Promise<Collection<any>>;
    protected static findEmitter(query: FilterQuery<any>, options?: QueryOptions): Promise<any>;
    saveEmitter(options: CollectionInsertOneOptions): Promise<any>;
    updateEmitter(options?: ReplaceOneOptions): Promise<any>;
    protected static removeEmitter(query?: any, options?: QueryOptions & CommonOptions): Promise<any>;
    protected formalize(): {};
    toJSON(): this & {};
    static updateById<T = any>(id: string, data: any, options?: Partial<QueryOptions | any>): Promise<T>;
    static clone<T = any>(data: any): any;
    private static checkForId;
}
