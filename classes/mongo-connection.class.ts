import {CONNECTION_STATUS, IConnection} from "@sugoi/orm";
import {Db, MongoClient, MongoClientOptions} from "mongodb";
import {IMongoConnectionConfig} from "../interfaces/mongo-connection-config.interface";


export class MongoConnection implements IConnection,IMongoConnectionConfig {
    protocol: string = `mongodb://`;
    port: number = 27017;
    hostName: string;
    status: CONNECTION_STATUS;
    connectionClient: {
        dbInstance: Db,
        client:MongoClient
    };
    db?: string;
    connectionName?: string;
    user?: string;
    password?: string;
    authDB?: string;
    additionalConfig?: MongoClientOptions = {};
    public newParser: boolean = false;


    connect(): Promise<boolean> {
        const connectionConfig = {
            authSource: this.authDB || this.db,
            ...this.additionalConfig
        };
        if (this.user && this.password) {
            connectionConfig['auth'] = {
                user: this.user,
                password: this.password
            };
        }
        if (this.shouldUseNewParser()) {
            connectionConfig['useNewUrlParser'] = true;
        }

        return MongoClient.connect(this.getConnectionString(), connectionConfig)
            .then((client: MongoClient) => {
                client.on("error", () => this.disconnect());
                this.connectionClient = {
                    dbInstance: client.db(this.db),
                    client
                };
                this.status = CONNECTION_STATUS.CONNECTED;
                return true
            })
            .catch(err => {
                console.error(err);
                throw err;
            });
    }


    isConnected(): Promise<boolean> {
        return Promise.resolve(this.status === CONNECTION_STATUS.CONNECTED);
    }


    public shouldUseNewParser(): boolean {
        return this.newParser;
    }

    public disconnect() {
        if (!this.connectionClient) {
            this.status = CONNECTION_STATUS.DISCONNECTED;
            return Promise.resolve(false);
        }
        else {
            return this.connectionClient.client.close(true)
                .then((disconnectObject) => {
                    this.status = CONNECTION_STATUS.DISCONNECTED;
                    return true;
                });
        }

    }

    public getConnectionString() {
        let connString = this.protocol;
        if (this.user && this.password) {
            connString += `${this.user}:${this.password}@`;
        }
        connString += this.hostName
        if(this.port) {
            connString += `:${this.port}`;
        }
        return connString;
    }
}