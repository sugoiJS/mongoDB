import {MongoModel,ConnectionName, IValidate} from "../../dist/index";

@ConnectionName("TESTING")
export class Dummy extends MongoModel implements IValidate{
    constructor(public name:string){
        super();
    }

    validate(): Promise<string | boolean> {
        return Promise.resolve(isNaN(parseInt(<string>this.name)));
    }

    static builder(name){
        return new Dummy(name);
    }
}