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
let MockId;
const validationException = {type: SugoiModelException, message: "INVALID", code: 4000};
const notFoundException = {type: SugoiModelException, message: "Not Found", code: 404};
const notUpdatedException = {type: SugoiModelException, message: "Not updated", code: 5000};

beforeAll(() => {
    const config: IConnectionConfig = {
        port: 27017,
        protocol: "mongodb://",
        hostName: "127.0.0.1",
        db: "SUGOIJS-TEST",
        user: null,
        password: null,
        newParser: true
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

    test("model should not be saved validation fail", async () => {
        return await Dummy.builder("123").save()
            .catch(err => {
                (<any>expect(err)).toBeExceptionOf(validationException);
                return true;
            });
    });

    test("model should be saved with lifecycle hooks apply", async () => {
        const dummy = Dummy.builder("Sugoi");
        return await dummy.save()
            .then((saved) => {
                MockId = saved.id.toString();
                expect(saved.name).toBe("Sugoi");
                expect(saved.lastSaved).toBe("today");
                expect(dummy.saved).toBe(saved.id);
                return true
            })
            .catch(err => {
                console.debug(err);
                expect(true).toBeFalsy();
                return false;
            })
    });
})

describe("Model update test suit", () => {
    test("update by id - validation fail", async () => {
        return await Dummy.updateById<any>(MockId, {name: "12"})
            .catch(err => {
                (<any>expect(err)).toBeExceptionOf(validationException);
                return true;
            });
    });

    test("update by id - validation pass", async () => {
        return await  Dummy.updateById<any>(MockId, {name: "12", isUpdate: true})
            .then(res=>res.ok ? Dummy.findById(MockId) : null)
            .then(res => {
                expect(res).not.toBe(null);
                expect(res.name).toBe("u_12");
                expect(res.lastUpdated).toBe("today");
            })
    });

    test("update - validation invalid Id", async () => {
        return await Dummy.updateById<any>("5b8c520c875d534870ab3417", {name: "12", isUpdate: true})
            .catch(err => {
                (<any>expect(err)).toBeExceptionOf(notUpdatedException);
                return err;
            })
    });

})
