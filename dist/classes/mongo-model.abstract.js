"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var mongodb_1 = require("mongodb");
var dist_1 = require("@sugoi/core/dist");
var mongo_connection_class_1 = require("./mongo-connection.class");
var operators_1 = require("rxjs/operators");
var MongoModel = /** @class */ (function (_super) {
    __extends(MongoModel, _super);
    function MongoModel() {
        return _super.call(this) || this;
    }
    MongoModel.getIdObject = function (id) {
        return new mongodb_1.ObjectID(id);
    };
    MongoModel.getCollection = function (connectionName, collectionName) {
        return MongoModel.connect(connectionName)
            .pipe(operators_1.pluck('dbInstance'), operators_1.map(function (db) { return db.collection(collectionName); }));
    };
    MongoModel.prototype.getMongoId = function () {
        return this._id.toString();
    };
    MongoModel.prototype.setCollection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.collection)
                            return [2 /*return*/, Promise.resolve(this.collection)];
                        _a = this;
                        return [4 /*yield*/, MongoModel.getCollection(this.constructor['connectionName'], this.collectionName).toPromise()];
                    case 1:
                        _a.collection = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MongoModel.disconnect = function (connectionName) {
        return this.connections.has(connectionName)
            ? this.connections.get(connectionName).disconnect()
            : Promise.resolve(null);
    };
    MongoModel.findEmitter = function (query, options) {
        if (options === void 0) { options = {}; }
        var that = this;
        if (query.hasOwnProperty("_id")) {
            query._id = MongoModel.getIdObject(query._id);
        }
        return MongoModel.getCollection(that.connectionName, that.name)
            .flatMap(function (collection) {
            return collection.find(query)
                .toArray()
                .then(function (res) {
                if (res.length === 0) {
                    throw new dist_1.ModelException("Not Found", 404);
                }
                return res;
            });
        });
    };
    MongoModel.prototype.saveEmitter = function (options) {
        var _this = this;
        return this.setCollection()
            .then(function () {
            return new Promise(function (resolve, reject) {
                _this.collection.insertOne(_this.formalize(), options, function (err, value) {
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
    };
    MongoModel.prototype.updateEmitter = function (options) {
        var _this = this;
        return this.setCollection()
            .then(function () {
            return new Promise(function (resolve, reject) {
                _this.collection.updateOne({ "_id": _this.id }, _this.formalize(), options, function (err, value) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(value);
                    }
                });
            });
        });
    };
    MongoModel.prototype.removeEmitter = function (query) {
        var _this = this;
        if (query === void 0) { query = { "_id": this.id }; }
        return this.setCollection().then(function () {
            return new Promise(function (resolve, reject) {
                _this.collection.deleteOne(query, function (err, value) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(value);
                    }
                });
            });
        });
    };
    MongoModel.prototype.formalize = function () {
        var _this = this;
        var objToReturn = {};
        Object.keys(this).forEach(function (key) {
            if (typeof _this[key] != "function"
                && !(_this[key] && _this[key].constructor && _this[key].constructor.name == "Collection")) {
                objToReturn[key] = _this[key];
            }
        });
        return objToReturn;
    };
    MongoModel.prototype.toJSON = function () {
        var temp = Object.assign({}, this);
        temp.id = this.getMongoId();
        delete temp['collection'];
        delete temp['_id'];
        return temp;
    };
    MongoModel.clone = function (classIns, data) {
        data._id = data._id.toString();
        return _super.clone.call(this, classIns, data);
    };
    MongoModel.connectEmitter = function (connection) {
        var connectionConfig = {
            authSource: connection.authDB || connection.db
        };
        if (connection.user && connection.password) {
            connectionConfig['auth'] = {
                user: connection.user,
                password: connection.password
            };
        }
        var promise = mongodb_1.MongoClient.connect(connection.getConnectionString(), connectionConfig)
            .then(function (client) {
            return {
                dbInstance: client.db(connection.db),
                client: client
            };
        });
        return Observable_1.Observable.fromPromise(promise);
    };
    MongoModel.ConnectionType = mongo_connection_class_1.MongoConnection;
    return MongoModel;
}(dist_1.ConnectableModel));
exports.MongoModel = MongoModel;
