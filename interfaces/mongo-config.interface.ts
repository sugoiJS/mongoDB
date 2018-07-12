export interface IMongoConfig{
    port: number;
    hostName: string;
    db: string;
    connectionName?: string;
    user?:string;
    password?:string;
    authDB?:string;
}