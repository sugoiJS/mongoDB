"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const mongo_connection_class_1 = require("./mongo-connection.class");
const orm_1 = require("@sugoi/orm");
const sort_options_mongo_constant_1 = require("../constants/sort-options-mongo.constant");
const mongo_response_1 = require("./mongo-response");
class MongoModel extends orm_1.ConnectableModel {
    constructor() {
        super();
    }
    set nModified(n) {
        this.MongoResponse = this.MongoResponse || new mongo_response_1.MongoResponse();
        this.MongoResponse.nModified = n;
    }
    ;
    get nModified() {
        return this.MongoResponse && this.MongoResponse.nModified;
    }
    ;
    set ok(n) {
        this.MongoResponse = this.MongoResponse || new mongo_response_1.MongoResponse();
        this.MongoResponse.ok = n;
    }
    ;
    get ok() {
        return this.MongoResponse && this.MongoResponse.ok;
    }
    ;
    set n(n) {
        this.MongoResponse = this.MongoResponse || new mongo_response_1.MongoResponse();
        this.MongoResponse.n = n;
    }
    ;
    get n() {
        return this.MongoResponse && this.MongoResponse.n;
    }
    ;
    static setConnection(configData, connectionClass = null, connectionName = "default") {
        let connectionClassTemp = mongo_connection_class_1.MongoConnection;
        if (!connectionClass || typeof connectionClass === "string") {
            connectionName = connectionClass || "default";
        }
        return super.setConnection(configData, connectionClassTemp, connectionName);
    }
    static getIdObject(id) {
        return new mongodb_1.ObjectID(id);
    }
    static getCollection(connectionName, collectionName) {
        return this.connect(connectionName)
            .then((data) => data.connectionClient)
            .then(data => data.dbInstance)
            .then((db) => db.collection(collectionName));
    }
    getMongoId() {
        return this._id.toString();
    }
    static setCollection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.collection)
                return Promise.resolve(this.collection);
            this.collection = yield this.getCollection(this.constructor['connectionName'], this.getCollectionName());
        });
    }
    static findEmitter(query, options = orm_1.QueryOptions.builder()) {
        const id = this.getIdFromQuery(query);
        const sortObject = {};
        if (MongoModel.checkForId(id)) {
            Object.assign(query, { _id: MongoModel.getIdObject(id) });
        }
        else if (id) {
            Object.assign(query, { _id: id });
        }
        return this.getCollection(this.connectionName, this.getCollectionName())
            .then(collection => {
            let queryBuilder = collection.find(query)
                .limit(options.limit || 0)
                .skip(("getOffset" in options && options.getOffset()) || 0);
            if (options.getSortOptions() && options.getSortOptions().length > 0) {
                options.getSortOptions().forEach(sortOption => {
                    sortObject[sortOption.field] = sort_options_mongo_constant_1.SortOptionsMongo[sortOption.sortOption];
                });
                queryBuilder = queryBuilder.sort(sortObject);
            }
            return queryBuilder
                .toArray()
                .then((res) => {
                if (res.length === 0) {
                    throw new orm_1.SugoiModelException("Not Found", 404);
                }
                res.forEach(MongoModel.castIdToString);
                return res;
            });
        });
    }
    saveEmitter(options) {
        return this.constructor.setCollection()
            .then(() => {
            this.addFieldsToIgnore("MongoResponse");
            return this.constructor.collection.insertOne(this, options)
                .then((value) => {
                this.removeFieldsFromIgnored("MongoResponse");
                return value.ops[0];
            }).then(res => {
                MongoModel.castIdToString(res);
                return res;
            });
        });
    }
    static updateAll(query, data, options) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            options.multi = options.hasOwnProperty("multi") ? options.multi : true;
            return _super("updateAll").call(this, query, data, options);
        });
    }
    updateEmitter(options = { upsert: false }, query) {
        return this.constructor.setCollection()
            .then(() => {
            this.addFieldsToIgnore("MongoResponse");
            const formalizeValue = Object.assign({}, this);
            const primaryKey = orm_1.getPrimaryKey(this);
            delete formalizeValue[primaryKey];
            if (query[primaryKey])
                query[primaryKey] = MongoModel.getIdObject(query[primaryKey]);
            return options.multi
                ? this.constructor.collection.updateMany(query, { $set: formalizeValue }, options)
                : this.constructor.collection.updateOne(query, { $set: formalizeValue }, options);
        })
            .then((res) => res.result)
            .then((res) => {
            if (res.ok && res.nModified) {
                this.removeFieldsFromIgnored("MongoResponse");
                MongoModel.castIdToString(res);
                return res;
            }
            else
                throw new orm_1.SugoiModelException("Not updated", 5000);
        });
    }
    static removeEmitter(query, options) {
        const id = this.getIdFromQuery(query);
        if (MongoModel.checkForId(id)) {
            Object.assign(query, { _id: MongoModel.getIdObject(id) });
        }
        else if (id) {
            Object.assign(query, { _id: id });
        }
        return this.setCollection()
            .then(() => {
            return options && options.limit == 1
                ? this.collection.deleteOne(query, options)
                : this.collection.deleteMany(query, options);
        })
            .then((res) => res.result)
            .then((res) => {
            if (res.ok && res.n) {
                return res;
            }
            else
                throw new orm_1.SugoiModelException("Not removed", 5000);
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
        temp["id"] = this._id ? this.getMongoId() : null;
        delete temp['collection'];
        delete temp['_id'];
        return temp;
    }
    static updateById(id, data, options) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            id = this.getIdObject(id);
            data['_id'] = id;
            return _super("updateById").call(this, id, data, options);
        });
    }
    /**
     * Transform data into class(T) instance
     * @param classIns - class instance
     * @param data - data to transform
     * @param {boolean }applyConstructor - should apply class constructor
     * @returns {T}
     */
    static clone(classIns, data, applyConstructor = false) {
        if (arguments.length < 3
            && ((arguments.length === 1) || (arguments.length === 2 && typeof arguments[1] === "boolean"))) {
            data = classIns;
            classIns = this;
        }
        MongoModel.castIdToString(data);
        return super.clone(classIns, data, applyConstructor);
    }
    static castIdToString(mongoModel) {
        if (mongoModel._id)
            mongoModel._id = mongoModel._id.toString();
    }
    static cast(data, applyConstructor = false) {
        return this.clone(data, applyConstructor);
    }
    static checkForId(id) {
        return id && id.constructor && ["string", "number", "objectid"].indexOf(id.constructor.name.toLowerCase()) > -1;
    }
}
__decorate([
    orm_1.Primary(),
    __metadata("design:type", mongodb_1.ObjectID)
], MongoModel.prototype, "_id", void 0);
__decorate([
    orm_1.Ignore(),
    __metadata("design:type", mongodb_1.MongoClient)
], MongoModel.prototype, "client", void 0);
exports.MongoModel = MongoModel;
