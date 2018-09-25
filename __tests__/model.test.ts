import {IConnectionConfig, MongoModel} from "../index";
import {Dummy} from "./models/dummy";
import MongodbMemoryServer from 'mongodb-memory-server';
import {SugoiModelException} from "@sugoi/orm";

expect.extend({
    toBeExceptionOf(received, expected: { type: any, message: string, code: number }) {
        const type = expected.type;
        const message = expected.message;
        const code = expected.code;
        const isInstance = received instanceof type;
        if (!isInstance) {
            return {
                pass: false,
                message: () => `expected not of type ${type}`,
            }
        }

        if (received.message !== message) {
            return {
                pass: false,
                message: () => `expected ${message} got ${received.message}`,
            }
        }

        if (received.code !== code) {
            return {
                pass: false,
                message: () => `expected ${code} got ${received.code}`,
            }
        }

        return {
            pass: true,
            message: () => `expected equal to what got`,
        }


    }
});
let mongod;
beforeAll(() => {
    const config: IConnectionConfig = {
        port: 27017,
        protocol: "mongodb://",
        hostName: "127.0.0.1",
        db: "SUGOIJS-TEST",
        user: null,
        password: null,
        newParser:true
    };
    mongod = new MongodbMemoryServer({
        instance: {
            port: config.port,
            ip: config.hostName,
            dbName: config.db,
            debug: true,
        }
    });
    MongoModel.setConnection(config, "TESTING")
});

describe("Model save test suit", () => {


    test("model should not be saved", async () => {
        return await Dummy.builder("123").save()
            .catch(err => {
                (<any>expect(err)).toBeExceptionOf({type: SugoiModelException, message: "INVALID", code: 4000});
                return true;
            });
    });

    test("model should be saved", async () => {
        return await Dummy.builder("Sugoi")
            .save()
            .then(saved => {
                expect(saved.name).toBe("Sugoi");
                return true
            })
            .catch(err => {
                console.debug(err);
                expect(true).toBeFalsy();
                return false;
            })
    });
})

describe("Model update test suit",()=>{

})
