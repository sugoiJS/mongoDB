import {IBeforeValidate} from "@sugoi/orm";

export {EXCEPTIONS} from "./constants/exceptions.constant";

export {MongoConnection} from "./classes/mongo-connection.class";

export {MongoModel} from "./classes/mongo-model.abstract";

export {IMongoConnectionConfig as IConnectionConfig} from "./interfaces/mongo-connection-config.interface";

export {
    IBeforeValidate,
    IValidate,
    IAfterSave,
    IAfterUpdate,
    IBeforeSave,
    IBeforeUpdate,
    Primary,
    ConnectionName,
    ModelName,
    getPrimaryKey,
    QueryOptions,
    SortItem,
    SortOptions,
    SugoiModelException
} from "@sugoi/orm";

