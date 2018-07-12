import {IMongoConfig} from "../interfaces/mongo-config.interface";
import {CONNECTION_STATUS,inversify} from "@sugoi/core";
import {Db} from "mongodb";
import {SugoiMongoError} from "../exceptions/mongo.exception";


@inversify.injectable()
export class MongoConfig implements IMongoConfig {
    public user?: string;

    public password?: string;

    public _authDB?: string;
    get authDB() {
        return this._authDB;
    }

    public status: CONNECTION_STATUS = CONNECTION_STATUS.DISCONNECTED;

    public connectionName: string;


    protected _dbInstance: Db;
    get dbInstance() {
        return this._dbInstance;
    }
    set dbInstance(ins:Db) {
        if(ins instanceof Db)
            this._dbInstance = ins;
        else{
            throw new SugoiMongoError("Invalid db instance type",4105)
        }
    }

    protected constructor(public hostName: string,
                          public db: string,
                          public port: number = 27017) {
        this.connectionName = this.db;
    }

    public setCredentials(user: string, password: string) {
        this.user = user;
        this.password = password;
        return this;
    }

    public static clone(config: IMongoConfig): MongoConfig {
        return Object.assign(MongoConfig.builder(null, null), config);
    }

    public static builder(hostName: string, db: string, port?: number) {
        return new MongoConfig(hostName, db, port);
    }

    public setStatus(status: CONNECTION_STATUS) {
        this.status = status;
        return this;
    }

    public setAuthDB(db: string) {
        this._authDB = db;
        return this;
    }

    public setConnectionName(name: string = this.db) {
        this.connectionName = name;
    }

}