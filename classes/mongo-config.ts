import {ConnectionConfig, injectable} from "@sugoi/core";
import {Db} from "mongodb";
import {SugoiMongoError} from "../exceptions/mongo.exception";


@injectable()
export class MongoConfig extends ConnectionConfig {
    protected _dbInstance: Db;

    get dbInstance() {
        return this._dbInstance;
    }

    set dbInstance(ins: Db) {
        if (ins instanceof Db)
            this._dbInstance = ins;
        else {
            throw new SugoiMongoError("Invalid db instance type", 4105)
        }
    }

    protected constructor(public hostName: string,
                          public db: string,
                          public port: number = 27017) {
        super(hostName, db, port);
    }

}