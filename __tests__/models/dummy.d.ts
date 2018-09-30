import { IAfterSave, IAfterUpdate, IBeforeSave, IBeforeUpdate, IBeforeValidate, MongoModel, IValidate } from "../../index";
export declare class Dummy extends MongoModel implements IValidate, IBeforeUpdate, IAfterUpdate, IAfterSave, IBeforeSave, IBeforeValidate {
    name: string;
    id: any;
    lastUpdated: any;
    lastSaved: any;
    lastSavedTime: any;
    saved: boolean;
    updated: boolean;
    isUpdate: boolean;
    constructor(name: string);
    beforeValidate(): Promise<any> | void;
    beforeUpdate(): Promise<any> | void;
    afterUpdate(updateResponse?: any): Promise<any> | void;
    beforeSave(): Promise<any> | void;
    afterSave(saveResponse?: any): Promise<any> | void;
    validate(): Promise<string | boolean>;
    static builder(name: any): Dummy;
}
