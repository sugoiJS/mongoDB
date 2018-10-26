import {
    IAfterSave,
    IAfterUpdate,
    IBeforeSave,
    IBeforeUpdate,
    IBeforeValidate,
    MongoModel,
    ConnectionName,
    IValidate,
    ModelName,
    Ignore,
    Required
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
    public date:Date;
    @Ignore()
    public saved: boolean;
    @Ignore()
    public updated: boolean;
    @Ignore()
    public isUpdate: boolean;
    @Required()
    public name:string;
    constructor(name: string) {
        super();
        this.name = name;
    }

    beforeValidate(): Promise<any> | void {
        this.name = this.isUpdate ? "u_" + this.name : this.name;
    }

    beforeUpdate(): Promise<any> | void {
        this.lastUpdated = "today";
        if(!this.name)
            this.addFieldsToIgnore("name");
    }

    afterUpdate(updateResponse?: any): Promise<any> | void {
        this.updated = this.lastUpdated === "today";
        this.removeFieldsFromIgnored("name")
    }

    beforeSave(): Promise<any> | void {
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