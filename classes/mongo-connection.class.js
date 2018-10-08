"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orm_1 = require("@sugoi/orm");
const mongodb_1 = require("mongodb");
class MongoConnection {
    constructor() {
        this.protocol = `mongodb://`;
        this.port = 27017;
        this.newParser = false;
    }
    connect() {
        const connectionConfig = {
            authSource: this.authDB || this.db
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
        return mongodb_1.MongoClient.connect(this.getConnectionString(), connectionConfig)
            .then((client) => {
            client.on("error", () => this.disconnect());
            this.connectionClient = {
                dbInstance: client.db(this.db),
                client
            };
            this.status = orm_1.CONNECTION_STATUS.CONNECTED;
            return true;
        })
            .catch(err => {
            console.error(err);
            throw err;
        });
    }
    isConnected() {
        return Promise.resolve(this.status === orm_1.CONNECTION_STATUS.CONNECTED);
    }
    shouldUseNewParser() {
        return this.newParser;
    }
    disconnect() {
        if (!this.connectionClient) {
            this.status = orm_1.CONNECTION_STATUS.DISCONNECTED;
            return Promise.resolve(false);
        }
        else {
            return this.connectionClient.client.close(true)
                .then((disconnectObject) => {
                this.status = orm_1.CONNECTION_STATUS.DISCONNECTED;
                return true;
            });
        }
    }
    getConnectionString() {
        let connString = this.protocol;
        if (this.user && this.password) {
            connString += `${this.user}:${this.password}@`;
        }
        connString += `${this.hostName}:${this.port}`;
        return connString;
    }
}
exports.MongoConnection = MongoConnection;
