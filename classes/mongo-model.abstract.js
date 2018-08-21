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
var mongodb_1 = require("mongodb");
var mongo_connection_class_1 = require("./mongo-connection.class");
var orm_1 = require("@sugoi/orm");
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
            .then(function (data) { return data.dbInstance; })
            .then(function (db) { return db.collection(collectionName); });
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
                        return [4 /*yield*/, MongoModel.getCollection(this.constructor['connectionName'], this.collectionName)];
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
        else if (typeof query === "string") {
            query = { _id: MongoModel.getIdObject(query) };
        }
        return MongoModel.getCollection(that.connectionName, that.name)
            .then(function (collection) {
            return collection.find(query)
                .toArray()
                .then(function (res) {
                if (res.length === 0) {
                    throw new orm_1.SugoiModelException("Not Found", 404);
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
        if (options === void 0) { options = { upsert: true }; }
        return this.setCollection()
            .then(function () {
            var formalizeValue = _this.formalize();
            formalizeValue["_id"] = MongoModel.getIdObject(_this.id);
            return _this.collection.updateOne({ "_id": formalizeValue["_id"] }, { $set: formalizeValue });
        }).then(function (res) {
            res = res.toJSON();
            if (res.ok && res.nModified)
                return res;
            else
                throw new orm_1.SugoiModelException("Not updated", 5000);
        });
    };
    MongoModel.prototype.removeEmitter = function (query) {
        var _this = this;
        if (query === void 0) { query = { "_id": MongoModel.getIdObject(this.id) }; }
        return this.setCollection().then(function () {
            return _this.collection.deleteOne(query);
        }).then(function (res) {
            res = res.toJSON();
            if (res.ok && res.n)
                return res;
            else
                throw new orm_1.SugoiModelException("Not removed", 5000);
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
        var _this = this;
        var connectionConfig = {
            authSource: connection.authDB || connection.db
        };
        if (connection.user && connection.password) {
            connectionConfig['auth'] = {
                user: connection.user,
                password: connection.password
            };
        }
        if (connection.shouldUseNewParser()) {
            connectionConfig['useNewUrlParser'] = true;
        }
        return mongodb_1.MongoClient.connect(connection.getConnectionString(), connectionConfig)
            .then(function (client) {
            client.on("error", function () { return _this.disconnect(connection.connectionName); });
            return {
                dbInstance: client.db(connection.db),
                client: client
            };
        });
    };
    MongoModel.ConnectionType = mongo_connection_class_1.MongoConnection;
    return MongoModel;
}(orm_1.ConnectableModel));
exports.MongoModel = MongoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ28tbW9kZWwuYWJzdHJhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9jbGFzc2VzL21vbmdvLW1vZGVsLmFic3RyYWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBR2lCO0FBQ2pCLG1FQUF5RDtBQUN6RCxrQ0FBaUU7QUFFakU7SUFBeUMsOEJBQWdCO0lBVXJEO2VBQ0ksaUJBQU87SUFDWCxDQUFDO0lBR2Esc0JBQVcsR0FBekIsVUFBMEIsRUFBVTtRQUNoQyxPQUFPLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRWdCLHdCQUFhLEdBQTlCLFVBQStCLGNBQXNCLEVBQUUsY0FBc0I7UUFDekUsT0FBTyxVQUFVLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQzthQUNwQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsVUFBVSxFQUFmLENBQWUsQ0FBQzthQUM3QixJQUFJLENBQUMsVUFBQyxFQUFNLElBQUssT0FBQSxFQUFFLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxFQUE3QixDQUE2QixDQUFDLENBQUE7SUFDeEQsQ0FBQztJQUVNLCtCQUFVLEdBQWpCO1FBQ0ksT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFZSxrQ0FBYSxHQUE3Qjs7Ozs7O3dCQUNJLElBQUksSUFBSSxDQUFDLFVBQVU7NEJBQUUsc0JBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUM7d0JBQzdELEtBQUEsSUFBSSxDQUFBO3dCQUFjLHFCQUFNLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBQTs7d0JBQXpHLEdB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