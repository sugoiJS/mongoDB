import { Observable } from "rxjs/Observable";
import { Collection, Db, MongoClient, MongoClientOptions, ObjectID } from "mongodb";
import { ConnectableModel } from "@sugoi/core/dist";
import { MongoConnection } from "./mongo-connection.class";
export declare abstract class MongoModel extends ConnectableModel {
    protected client: MongoClient;
    protected collection: Collection;
    protected _id: ObjectID;
    protected static ConnectionType: typeof MongoConnection;
    constructor();
    static getIdObject(id: string): ObjectID;
    protected static getCollection(connectionName: string, collectionName: string): Observable<Collection>;
    getMongoId(): string;
    protected setCollection(): Promise<Collection<any>>;
    static disconnect(connectionName: string): Promise<any>;
    protected static findEmitter(query: any, options?: MongoClientOptions): Observable<object>;
    saveEmitter(options: any): Promise<any>;
    updateEmitter(options: any): Promise<any>;
    protected removeEmitter(query?: {
        "_id": string;
    }): Promise<any>;
    protected formalize(): {};
    toJSON(): this & {};
    static clone(classIns: any, data: any): any;
    static connectEmitter(connection: MongoConnection): Observable<{
        dbInstance: Db;
        client: MongoClient;
    }>;
}
