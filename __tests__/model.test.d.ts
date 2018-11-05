import MongodbMemoryServer from 'mongodb-memory-server';
export declare function connect(): Promise<{
    client: any;
    mongod: MongodbMemoryServer;
    connection: any;
}>;
export declare function disconnect(client: any, mongod: any, connection: any): Promise<any>;
export declare const exceptionCheck: {
    toBeExceptionOf(received: any, expected: {
        type: any;
        message: string;
        code: number;
    }): {
        pass: boolean;
        message: () => string;
    };
};
export declare const recAmount = 10;
export declare const recNamePrefix = "read_name_";
export declare let mockObject: any;
export declare function setResources(): Promise<any[]>;
