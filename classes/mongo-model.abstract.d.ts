import { Observable } from "rxjs/Observable";
import { Collection, Db, MongoClient, MongoClientOptions, ObjectID } from "mongodb";
import { ModelAbstract } from "@sugoi/core";
import { IMongoConfig, MongoConfig } from "../index";
export declare abstract class MongoModel extends ModelAbstract {
    protected static connString: string;
    protected static client: MongoClient;
    protected static config: Map<string, MongoConfig>;
    protected static _DBName: string;
    static readonly DBName: string;
    protected collection: Collection;
    protected _id: ObjectID;
    constructor();
    static setConfig(configData: IMongoConfig): void;
    protected static getConnectionString(config: IMongoConfig): string;
    static getIdObject(id: string): ObjectID;
    getMongoId(): string;
    protected setCollection(): Promise<void>;
    protected static getCollection(collectionName: string): Observable<Collection>;
    static connect(db?: string): Observable<Db>;
    static disconnect(): void;
    protected static findEmitter(query: any, options?: MongoClientOptions): Observable<object>;
    saveEmitter(options: any): Promise<any>;
    updateEmitter(options: any): Promise<any>;
    protected removeEmitter(): Promise<any>;
    protected formalize(): {};
    toJSON(): this & {};
    protected static clone(classIns: any, data: any): object;
}
