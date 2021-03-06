import {
    Collection,
    CollectionInsertOneOptions,
    CommonOptions,
    Db,
    MongoClient,
    ObjectID,
    ReplaceOneOptions,
    FilterQuery
} from "mongodb";
import {MongoConnection} from "./mongo-connection.class";
import {
    QueryOptions,
    ConnectableModel,
    getPrimaryKey,
    Ignore,
    Primary,
    SugoiModelException,
    IConnection
} from "@sugoi/orm";
import {SortOptionsMongo} from "../constants/sort-options-mongo.constant";
import {IMongoConnectionConfig} from "../interfaces/mongo-connection-config.interface";
import {MongoResponse} from "./mongo-response";

export abstract class MongoModel extends ConnectableModel {

    @Primary()
    protected _id: ObjectID;

    @Ignore()
    protected client: MongoClient;

    private MongoResponse: MongoResponse;


    public set nModified(n:number){
        this.MongoResponse = this.MongoResponse || new MongoResponse();
        this.MongoResponse.nModified = n;
    };
    public get nModified():number{
        return this.MongoResponse && this.MongoResponse.nModified;
    };

    public set ok(n:number){
        this.MongoResponse = this.MongoResponse || new MongoResponse();
        this.MongoResponse.ok = n;
    };
    public get ok():number{
        return this.MongoResponse && this.MongoResponse.ok;
    };

    public set n(n:number){
        this.MongoResponse = this.MongoResponse || new MongoResponse();
        this.MongoResponse.n = n;
    };
    public get n():number{
        return this.MongoResponse && this.MongoResponse.n;
    };


    protected static collection: Collection;

    constructor() {
        super();
    }

    public static setConnection(configData: IMongoConnectionConfig, connectionName?: string): Promise<IConnection>;
    public static setConnection(configData: IMongoConnectionConfig, connectionClass: any = null, connectionName: any = "default"): Promise<IConnection> {
        let connectionClassTemp: any = MongoConnection;
        if (!connectionClass || typeof connectionClass === "string") {
            connectionName = (<string>connectionClass) || "default";
        }
        return super.setConnection(configData, connectionClassTemp, connectionName);
    }


    public static getIdObject(id: string | number) {
        return new ObjectID(id);
    }

    protected static getCollection(connectionName: string, collectionName: string): Promise<Collection> {
        return this.connect(connectionName)
            .then((data: any) => data.connectionClient)
            .then(data => data.dbInstance)
            .then((db: Db) => db.collection(collectionName))
    }

    public getMongoId() {
        return this._id.toString();
    }

    protected static async setCollection() {
        if (this.collection) return Promise.resolve(this.collection);
        this.collection = await this.getCollection(this.constructor['connectionName'], this.getCollectionName());
    }


    protected static findEmitter(query: FilterQuery<any>, options: QueryOptions = QueryOptions.builder()): Promise<any> {
        const id = this.getIdFromQuery(query);
        const sortObject = {};
        if (MongoModel.checkForId(id)) {
            Object.assign(query, {_id: MongoModel.getIdObject(id)});
        } else if (id) {
            Object.assign(query, {_id: id});
        }
        return this.getCollection(this.connectionName, this.getCollectionName())
            .then(collection => {
                let queryBuilder = collection.find(query)
                    .limit(options.limit || 0)
                    .skip(("getOffset" in options && options.getOffset()) || 0);
                if (options.getSortOptions() && options.getSortOptions().length > 0) {
                    options.getSortOptions().forEach(sortOption => {
                        sortObject[sortOption.field] = SortOptionsMongo[sortOption.sortOption];
                    });
                    queryBuilder = queryBuilder.sort(sortObject);
                }
                return queryBuilder
                    .toArray()
                    .then((res) => {
                        if (res.length === 0) {
                            throw new SugoiModelException("Not Found", 404);
                        }
                        res.forEach(MongoModel.castIdToString);
                        return res;
                    });
            });
    }

    public saveEmitter(options: CollectionInsertOneOptions): Promise<any> {
        return (<any>this).constructor.setCollection()
            .then(() => {
                this.addFieldsToIgnore("MongoResponse");
                return (<any>this).constructor.collection.insertOne(this, options)
                    .then((value) => {
                        this.removeFieldsFromIgnored("MongoResponse");
                        return value.ops[0];
                    }).then(res=>{
                        MongoModel.castIdToString(res);
                        return res;
                    })
            });
    }


    public static async updateAll<T = any>(query: any, data: any, options?: Partial<QueryOptions | any>): Promise<T> {
        options.multi = options.hasOwnProperty("multi")? options.multi : true;
        return super.updateAll(query,data,options);
    }
    public updateEmitter(options: any|ReplaceOneOptions = {upsert: false}, query: any): Promise<any> {
        return (<any>this).constructor.setCollection()
            .then(() => {
                this.addFieldsToIgnore("MongoResponse");
                const formalizeValue = Object.assign({}, this);
                const primaryKey = getPrimaryKey(this);
                delete formalizeValue[primaryKey];
                if (query[primaryKey])
                    query[primaryKey] = MongoModel.getIdObject(query[primaryKey]);
                return options.multi
                    ? (<any>this).constructor.collection.updateMany(query, {$set: formalizeValue}, options)
                    : (<any>this).constructor.collection.updateOne(query, {$set: formalizeValue}, options)
            })
            .then((res: any) => res.result)
            .then((res: any) => {
                if (res.ok && res.nModified) {
                    this.removeFieldsFromIgnored("MongoResponse");
                    MongoModel.castIdToString(res);
                    return res;
                }
                else
                    throw new SugoiModelException("Not updated", 5000)

            });

    }

    protected static removeEmitter(query?, options?: QueryOptions & CommonOptions): Promise<any> {
        const id = this.getIdFromQuery(query);
        if (MongoModel.checkForId(id)) {
            Object.assign(query, {_id: MongoModel.getIdObject(id)});
        } else if (id) {
            Object.assign(query, {_id: id});
        }
        return this.setCollection()
            .then(() => {
                return options && options.limit == 1
                    ? this.collection.deleteOne(query, options)
                    : this.collection.deleteMany(query, options);
            })
            .then((res: any) => res.result)
            .then((res: any) => {
                if (res.ok && res.n) {
                    return res;
                }
                else
                    throw new SugoiModelException("Not removed", 5000)

            });

    }

    protected formalize() {
        const objToReturn = {};
        Object.keys(this).forEach((key) => {
            if (typeof this[key] != "function"
                && !(this[key] && this[key].constructor && this[key].constructor.name == "Collection")) {
                objToReturn[key] = this[key];
            }
        });
        return objToReturn;
    }

    public toJSON() {
        const temp = Object.assign({}, this);
        temp["id"] = this._id ? this.getMongoId() : null;
        delete temp['collection'];
        delete temp['_id'];
        return temp;
    }

    public static async updateById<T =any>(id: string, data: any, options?: Partial<QueryOptions | any>): Promise<T> {
        id = this.getIdObject(id) as any;
        (<any>data)['_id'] = id;
        return super.updateById(id, data, options);
    }


    public static clone<T=any>(data: any): T;
    public static clone<T=any>(data: any, applyConstructor: boolean): T;
    public static clone<T=any>(classInstance: any, data: any): T;
    public static clone<T=any>(classInstance: any, data: any, applyConstructor: boolean): T;

    /**
     * Transform data into class(T) instance
     * @param classIns - class instance
     * @param data - data to transform
     * @param {boolean }applyConstructor - should apply class constructor
     * @returns {T}
     */
    public static clone<T = any>(classIns: any, data?: any, applyConstructor: boolean = false): T {
        if (
            arguments.length < 3
            && ((arguments.length === 1) || (arguments.length === 2 && typeof arguments[1] === "boolean"))
        ) {
            data = classIns;
            classIns = this;
        }
        MongoModel.castIdToString(data);
        return super.clone<T>(classIns, data,applyConstructor);
    }

    public static castIdToString(mongoModel:{_id:Buffer|string}){
        if(mongoModel._id) mongoModel._id = mongoModel._id.toString();
    }

    public static cast<T = any>(data: any, applyConstructor: boolean = false): T {
        return this.clone<T>(data,applyConstructor);
    }

    private static checkForId(id) {
        return id && id.constructor && ["string", "number", "objectid"].indexOf(id.constructor.name.toLowerCase()) > -1
    }
}