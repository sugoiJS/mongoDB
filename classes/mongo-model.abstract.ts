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
    QueryOptions, ConnectableModel, getPrimaryKey, ModelAbstract, Primary, SugoiModelException,
    Connection, IConnectionConfig, IConnection
} from "@sugoi/orm";
import {SortOptionsMongo} from "../constants/sort-options-mongo.constant";
import {IMongoConnectionConfig} from "../interfaces/mongo-connection-config.interface";

export abstract class MongoModel extends ConnectableModel {

    protected client: MongoClient;

    @Primary()
    protected _id: ObjectID;

    protected static collection: Collection;

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
                    .limit(options.getLimit() || 0)
                    .skip(options.getOffset() || 0);
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
                        return res;
                    });
            });
    }

    public saveEmitter(options: CollectionInsertOneOptions): Promise<any> {
        return (<any>this).constructor.setCollection()
            .then(() => {
                return (<any>this).constructor.collection.insertOne(this.formalize(), options)
                    .then((value) => {
                        return value.ops[0];
                    })
            });
    }


    public updateEmitter(options: ReplaceOneOptions = {upsert: true}): Promise<any> {
        return (<any>this).constructor.setCollection()
            .then(() => {
                const formalizeValue = this.formalize();
                const primaryKey = getPrimaryKey(this);
                delete formalizeValue[primaryKey];
                const query = {[primaryKey]: MongoModel.getIdObject(this[primaryKey])};
                return (<any>this).constructor.collection.updateOne(query, {$set: formalizeValue}, options)
            }).then((res: any) => {
                res = res.toJSON();
                if (res.ok && res.nModified)
                    return res;
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
            }).then((res: any) => {
                res = res.toJSON();
                if (res.ok && res.n)
                    return res;
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

    public static clone<T=any>(data: any): any;
    public static clone<T=any>(classIns: any, data?: any): any {
        if (arguments.length === 1) {
            data = classIns;
            classIns = this;
        }
        if (data._id)
            data._id = data._id.toString();
        return super.clone(classIns, data);
    }

    private static checkForId(id) {
        return id && id.constructor && ["string", "number", "objectid"].indexOf(id.constructor.name.toLowerCase()) > -1
    }
}