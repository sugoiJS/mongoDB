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
var Dummy_1;
const index_1 = require("../../index");
let Dummy = Dummy_1 = class Dummy extends index_1.MongoModel {
    constructor(name) {
        super();
        this.name = name;
    }
    get id() {
        return this._id;
    }
    set id(id) {
        this._id = id;
    }
    beforeValidate() {
        this.name = this.isUpdate ? "u_" + this.name : this.name;
    }
    beforeUpdate() {
        this.lastUpdated = "today";
        if (!this.name)
            this.addFieldsToIgnore("name");
    }
    afterUpdate(updateResponse) {
        this.updated = this.lastUpdated === "today";
        this.removeFieldsFromIgnored("name");
    }
    beforeSave() {
        this.lastSaved = "today";
        this.lastSavedTime = new Date().getTime();
    }
    afterSave(saveResponse) {
        this.saved = true;
    }
    validate() {
        return Promise.resolve(isNaN(parseInt(this.name)));
    }
    static builder(name) {
        return new Dummy_1(name);
    }
};
__decorate([
    index_1.Ignore(),
    __metadata("design:type", Boolean)
], Dummy.prototype, "saved", void 0);
__decorate([
    index_1.Ignore(),
    __metadata("design:type", Boolean)
], Dummy.prototype, "updated", void 0);
__decorate([
    index_1.Ignore(),
    __metadata("design:type", Boolean)
], Dummy.prototype, "isUpdate", void 0);
__decorate([
    index_1.Required(),
    __metadata("design:type", String)
], Dummy.prototype, "name", void 0);
Dummy = Dummy_1 = __decorate([
    index_1.ConnectionName("TESTING"),
    index_1.ModelName("dummy"),
    __metadata("design:paramtypes", [String])
], Dummy);
exports.Dummy = Dummy;
