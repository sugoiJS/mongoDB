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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@sugoi/core");
var mongodb_1 = require("mongodb");
var mongo_exception_1 = require("../exceptions/mongo.exception");
var MongoConfig = /** @class */ (function () {
    function MongoConfig(hostName, db, port) {
        if (port === void 0) { port = 27017; }
        this.hostName = hostName;
        this.db = db;
        this.port = port;
        this.status = core_1.CONNECTION_STATUS.DISCONNECTED;
        this.connectionName = this.db;
    }
    MongoConfig_1 = MongoConfig;
    Object.defineProperty(MongoConfig.prototype, "authDB", {
        get: function () {
            return this._authDB;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MongoConfig.prototype, "dbInstance", {
        get: function () {
            return this._dbInstance;
        },
        set: function (ins) {
            if (ins instanceof mongodb_1.Db)
                this._dbInstance = ins;
            else {
                throw new mongo_exception_1.SugoiMongoError("Invalid db instance type", 4105);
            }
        },
        enumerable: true,
        configurable: true
    });
    MongoConfig.prototype.setCredentials = function (user, password) {
        this.user = user;
        this.password = password;
        return this;
    };
    MongoConfig.clone = function (config) {
        return Object.assign(MongoConfig_1.builder(null, null), config);
    };
    MongoConfig.builder = function (hostName, db, port) {
        return new MongoConfig_1(hostName, db, port);
    };
    MongoConfig.prototype.setStatus = function (status) {
        this.status = status;
        return this;
    };
    MongoConfig.prototype.setAuthDB = function (db) {
        this._authDB = db;
        return this;
    };
    MongoConfig.prototype.setConnectionName = function (name) {
        if (name === void 0) { name = this.db; }
        this.connectionName = name;
    };
    var MongoConfig_1;
    MongoConfig = MongoConfig_1 = __decorate([
        core_1.inversify.injectable(),
        __metadata("design:paramtypes", [String, String, Number])
    ], MongoConfig);
    return MongoConfig;
}());
exports.MongoConfig = MongoConfig;
