import {
    IAfterSave,
    IAfterUpdate,
    IBeforeSave,
    IBeforeUpdate,
    IBeforeValidate,
    MongoModel,
    ConnectionName,
    IValidate,
    ModelName
} from "../../index";



@ConnectionName("TESTING")
@ModelName("dummy")
export class Dummy extends MongoModel implements IValidate, IBeforeUpdate, IAfterUpdate, IAfterSave, IBeforeSave, IBeforeValidate {
    public get id(): any {
        return this._id;
    }

    public set id(id) {
        this._id = id;
    }

    public lastUpdated;
    public lastSaved;
    public lastSavedTime;
    public saved: boolean;
    public updated: boolean;
    public isUpdate: boolean;

    constructor(public name: string) {
        super();
    }

    beforeValidate(): Promise<any> | void {
        this.name = this.isUpdate ? "u_" + this.name : this.name;
    }

    beforeUpdate(): Promise<any> | void {
        delete this.isUpdate;
        this.lastUpdated = "today";
    }

    afterUpdate(updateResponse?: any): Promise<any> | void {
        this.updated = this.lastUpdated === "today";
    }

    beforeSave(): Promise<any> | void {
        delete this.isUpdate;
        this.lastSaved = "today";
        this.lastSavedTime = new Date().getTime()
    }

    afterSave(saveResponse?: any): Promise<any> | void {
        this.saved = true;
    }

    validate(): Promise<string | boolean> {
        return Promise.resolve(isNaN(parseInt(<string>this.name)));
    }

    static builder(name) {
        return new Dummy(name);
    }
}