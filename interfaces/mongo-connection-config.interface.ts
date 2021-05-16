import {IConnectionConfig} from "@sugoi/orm";

export interface IMongoConnectionConfig extends IConnectionConfig{
    newParser?:boolean
    protocol?:string
    connectionString?: string
}