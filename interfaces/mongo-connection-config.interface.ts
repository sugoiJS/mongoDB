import {IConnectionConfig} from "@sugoi/orm";

export interface IMongoConnectionConfig extends IConnectionConfig{
    useNewUrlParser?:boolean
    protocol:string
}