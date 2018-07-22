"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
const mongodb_1 = require("mongodb");
const dist_1 = require("@sugoi/core/dist");
const operators_1 = require("rxjs/operators");
class MongoModel extends dist_1.ConnectableModel {
    constructor() {
        super();
    }
    static getIdObject(id) {
        return new mongodb_1.ObjectID(id);
    }
    static getCollection(connectionName, collectionName) {
        return MongoModel.connect(connectionName)
            .pipe(operators_1.map((connection) => connection.connection.dbInstance), operators_1.map((db) => db.collection(collectionName)));
    }
    getMongoId() {
        return this._id.toString();
    }
    setCollection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.collection)
                return Promise.resolve(this.collection);
            this.collection = yield MongoModel.getCollection(this.constructor['connectionName'], this.collectionName).toPromise();
        });
    }
    static disconnect(connectionName) {
        return this.connections.has(connectionName)
            ? this.connections.get(connectionName).disconnect()
            : Promise.resolve(null);
    }
    static findEmitter(query, options = {}) {
        const that = this;
        if (query.hasOwnProperty("_id")) {
            query._id = MongoModel.getIdObject(query._id);
        }
        return MongoModel.getCollection(that.connectionName, that.name)
            .flatMap(collection => {
            return collection.find(query)
                .toArray()
                .then((res) => {
                if (res.length === 0) {
                    throw new dist_1.ModelException("Not Found", 404);
                }
                return res;
            });
        });
    }
    saveEmitter(options) {
        return this.setCollection()
            .then(() => {
            return new Promise((resolve, reject) => {
                this.collection.insertOne(this.formalize(), options, (err, value) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                    else {
                        resolve(value.ops[0]);
                    }
                });
            });
        });
    }
    updateEmitter(options) {
        return this.setCollection()
            .then(() => {
            return new Promise((resolve, reject) => {
                this.collection.updateOne({ "_id": this.id }, this.formalize(), options, (err, value) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(value);
                    }
                });
            });
        });
    }
    removeEmitter(query = { "_id": this.id }) {
        return this.setCollection().then(() => {
            return new Promise((resolve, reject) => {
                this.collection.deleteOne(query, (err, value) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(value);
                    }
                });
            });
        });
    }
    formalize() {
        const objToReturn = {};
        Object.keys(this).forEach((key) => {
            if (typeof this[key] != "function"
                && !(this[key] && this[key].constructor && this[key].constructor.name == "Collection")) {
                objToReturn[key] = this[key];
            }
        });
        return objToReturn;
    }
    toJSON() {
        const temp = Object.assign({}, this);
        temp.id = this.getMongoId();
        delete temp['collection'];
        delete temp['_id'];
        return temp;
    }
    static clone(classIns, data) {
        data._id = data._id.toString();
        return super.clone(classIns, data);
    }
    static connectEmitter(connection) {
        const connectionConfig = {
            authSource: connection.authDB || connection.db
        };
        if (connection.user && connection.password) {
            connectionConfig['auth'] = {
                user: connection.user,
                password: connection.password
            };
        }
        const promise = mongodb_1.MongoClient.connect(connection.getConnectionString(), connectionConfig)
            .then((client) => {
            return {
                dbInstance: client.db(connection.db),
                client
            };
        });
        return Observable_1.Observable.fromPromise(promise);
    }
}
exports.MongoModel = MongoModel;
