"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orm_1 = require("@sugoi/orm");
class MongoConnection extends orm_1.Connection {
    constructor(hostName, db, port = 27017) {
        super(hostName, db, port);
        this.newParser = false;
    }
    shouldUseNewParser() {
        return this.newParser;
    }
    disconnect() {
        const connection = this.getConnection();
        if (!(connection && connection.client))
            return Promise.resolve(null);
        else {
            return connection.client.close(true)
                .then((disconnectObject) => {
                super.disconnect();
                return disconnectObject;
            });
        }
    }
    getConnectionString() {
        let connString = `mongodb://`;
        if (this.user && this.password) {
            connString += `${this.user}:${this.password}@`;
        }
        connString += `${this.hostName}:${this.port}`;
        return connString;
    }
}
exports.MongoConnection = MongoConnection;
