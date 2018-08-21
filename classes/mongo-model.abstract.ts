import {
    Collection, CollectionInsertOneOptions, Db, MongoClient, MongoClientOptions, ObjectID,
    ReplaceOneOptions
} from "mongodb";
import {MongoConnection} from "./mongo-connection.class";
import {ConnectableModel, SugoiModelException} from "@sugoi/orm";

export abstract class MongoModel extends ConnectableModel {

    protected client: MongoClient;

    protected collection: Collection;

    protected _id: ObjectID;

    protected static ConnectionType = MongoConnection;

    constructor() {
        super();
    }


    public static getIdObject(id: string) {
        return new ObjectID(id);
    }

    protected static getCollection(connectionName: string, collectionName: string): Promise<Collection> {
        return MongoModel.connect(connectionName)
            .then(data => data.dbInstance)
            .then((db: Db) => db.collection(collectionName))
    }

    public getMongoId() {
        return this._id.toString();
    }

    protected async setCollection() {
        if (this.collection) return Promise.resolve(this.collection);
        this.collection = await MongoModel.getCollection(this.constructor['connectionName'], this.collectionName);
    }


    public static disconnect(connectionName: string): Promise<any> {
        return this.connections.has(connectionName)
            ? this.connections.get(connectionName).disconnect()
            : Promise.resolve(null)
    }

    protected static findEmitter(query: any, options: MongoClientOptions = {}): Promise<any> {
        const that = this;
        if (query.hasOwnProperty("_id")) {
            query._id = MongoModel.getIdObject(query._id);
        } else if (typeof query === "string") {
            query = {_id: MongoModel.getIdObject(query)};
        }
        return MongoModel.getCollection(that.connectionName, that.name)
            .then(collection => {
                return collection.find(query)
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


    public updateEmitter(options: ReplaceOneOptions = {upsert: true}): Promise<any> {
        return this.setCollection()
            .then(() => {
                const formalizeValue = this.formalize();
                formalizeValue["_id"] = MongoModel.getIdObject(this.id);
                return this.collection.updateOne({"_id": formalizeValue["_id"]}, {$set: formalizeValue})
            }).then((res: any) => {
                res = res.toJSON();
                if (res.ok && res.nModified)
                    return res;
                else
                    throw new SugoiModelException("Not updated", 5000)

            });

    }

    protected removeEmitter(query = {"_id": MongoModel.getIdObject(this.id)}): Promise<any> {
        return this.setCollection().then(() => {
            return this.collection.deleteOne(query)
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
        temp.id = this.getMongoId();
        delete temp['collection'];
        delete temp['_id'];
        return temp;
    }

    public static clone(classIns: any, data: any): any {
        data._id = data._id.toString();
        return super.clone(classIns, data);
    }

    public static connectEmitter(connection: MongoConnection): Promise<{ dbInstance: Db, client: MongoClient }> {
        const connectionConfig = {
            authSource: connection.authDB || connection.db
        };
        if (connection.user && connection.password) {
            connectionConfig['auth'] = {
                user: connection.user,
                password: connection.password
            };
        }
        if (connection.shouldUseNewParser()) {
            connectionConfig['useNewUrlParser'] = true;
        }

        return MongoClient.connect(connection.getConnectionString(), connectionConfig)
            .then((client: MongoClient) => {
                client.on("error", () => this.disconnect(connection.connectionName));
                return {
                    dbInstance: client.db(connection.db),
                    client
                }
            });
    }
}