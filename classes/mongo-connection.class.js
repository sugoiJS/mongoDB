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
var orm_1 = require("@sugoi/orm");
var MongoConnection = /** @class */ (function (_super) {
    __extends(MongoConnection, _super);
    function MongoConnection(hostName, db, port) {
        if (port === void 0) { port = 27017; }
        var _this = _super.call(this, hostName, db, port) || this;
        _this.newParser = false;
        return _this;
    }
    MongoConnection.prototype.useNewParser = function (useNewParse) {
        this.newParser = useNewParse;
    };
    MongoConnection.prototype.shouldUseNewParser = function () {
        return this.newParser;
    };
    MongoConnection.prototype.disconnect = function () {
        var _this = this;
        var connection = this.getConnection();
        if (!connection && connection.client)
            return Promise.resolve(null);
        else {
            return connection.client.close(true)
                .then(function (disconnectObject) {
                _super.prototype.disconnect.call(_this);
                return disconnectObject;
            });
        }
    };
    MongoConnection.prototype.getConnectionString = function () {
        var connString = "mongodb://";
        if (this.user && this.password) {
            connString += this.user + ":" + this.password + "@";
        }
        connString += this.hostName + ":" + this.port;
        return connString;
    };
    MongoConnection = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [String, String, Number])
    ], MongoConnection);
    return MongoConnection;
}(orm_1.Connection));
exports.MongoConnection = MongoConnection;
