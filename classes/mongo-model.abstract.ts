import {Observable} from "rxjs/Observable";
import {Collection, Db, MongoClient, MongoClientOptions, ObjectID} from "mongodb";
import {CONNECTION_STATUS, ModelAbstract, ModelException} from "@sugoi/core";
import {IMongoConfig, SugoiMongoError, Exceptions, MongoConfig} from "../index";

export abstract class MongoModel extends ModelAbstract {
    protected static connString: string;

    protected static client: MongoClient;

    protected static config: Map<string, MongoConfig> = new Map();

    protected static _DBName: string;

    static get DBName(): string {
        return this._DBName || MongoModel.config.values().next().value.db;
    }

    protected collection: Collection;

    protected _id: ObjectID;

    constructor() {
        super();
    }

    public static setConfig(configData: IMongoConfig) {
        const castConfigData: MongoConfig = MongoConfig.clone(configData);
        MongoModel.config.set(configData.db, castConfigData);

    }

    protected static getConnectionString(config: IMongoConfig) {
        let connString = `mongodb://`;
        if (config.user && config.password) {
            connString += `${config.user}:${config.password}@`;
        }
        connString += `${config.hostName}:${config.port}`;
        return connString;
    }

    public static getIdObject(id: string) {
        return new ObjectID(id);
    }

    public getMongoId() {
        return this._id.toString();
    }

    protected async setCollection() {
        if (this.collection) return Promise.resolve();
        this.collection = await MongoModel.getCollection(this.collectionName).toPromise();
    }

    protected static getCollection(collectionName: string): Observable<Collection> {
        return MongoModel.connect(this.DBName)
            .map((db: Db) => db.collection(collectionName));
    }

    public static connect(db?: string): Observable<Db> {
        if(!db){
            db = this.DBName;
        }
        const config = MongoModel.config.get(db);
        if (!config) {
            throw new SugoiMongoError(Exceptions.CONFIGURATION_MISSING.message, Exceptions.CONFIGURATION_MISSING.code);
        }
        const connectionConfig = {
            authSource: config.authDB || config.db
        };
        if (config.user && config.password) {
            connectionConfig['auth'] = {
                user: config.user,
                password: config.password
            };
        }

        if (config.status === CONNECTION_STATUS.CONNECTED) {
            return Observable.of(config.dbInstance);
        } else {
            const promise = MongoClient.connect(MongoModel.getConnectionString(config), connectionConfig)
                .then((client) => {
                    config.dbInstance = client.db(this.DBName);
                    config.setStatus(CONNECTION_STATUS.CONNECTED);
                    return config.dbInstance;
                });
            return Observable.fromPromise(promise);
        }
    }


    public static disconnect() {
        MongoModel.client.close(true)
            .then(() => {
                MongoModel.status = CONNECTION_STATUS.DISCONNECTED;
            });
    }

    protected static findEmitter(query: any, options: MongoClientOptions = {}): Observable<object> {
        const that = this;
        if (query.hasOwnProperty("_id")) {
            query._id = MongoModel.getIdObject(query._id);
        }
        return MongoModel.getCollection(that.name)
            .flatMap(collection => {
                return collection.find(query)
                    .toArray()
                    .then((res) => {
                        if (res.length === 0) {
                            throw new ModelException("Not Found", 404);
                        }
                        return res;
                    });
            });
    }

    public saveEmitter(options): Promise<any> {
        return this.setCollection()
            .then(() => {
                return new Promise((resolve, reject) => {
                    this.collection.insertOne(this.formalize(), options, (err, value) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            resolve(value.ops[0])
                        }
                    });
                })
            });
    }


    public updateEmitter(options): Promise<any> {
        return this.setCollection()
            .then(() => {
                return new Promise((resolve, reject) => {
                    this.collection.updateOne({"_id": this.id}, this.formalize(),
                        options,
                        (err, value) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(value);
                            }
                        });
                });
            })
    }

    protected removeEmitter(): Promise<any> {
        return this.setCollection().then(() => {
            return new Promise((resolve, reject) => {
                this.collection.deleteOne({"_id": this.id},
                    (err, value) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(value);
                        }
                    });
            });
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
        temp.id = this.getMongoId();
        delete temp['collection'];
        delete temp['_id'];
        return temp;
    }

    protected static clone(classIns: any, data: any): object {
        data._id = data._id.toString();
        return super.clone(classIns, data);
    }
}