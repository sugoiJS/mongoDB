import {QueryOptions, SugoiModelException, IConnectionConfig, MongoModel, SortItem, SortOptions} from "../index";
import {Dummy} from "./models/dummy";
import MongodbMemoryServer from 'mongodb-memory-server';

expect.extend({
    toBeExceptionOf(received, expected: { type: any, message: string, code: number }) {
        const type = expected.type;
        const message = expected.message;
        const code = expected.code;
        const isInstance = received instanceof type;
        if (!isInstance) {
            return {
                pass: false,
                message: () => `expected ${received.name} not of type ${type.nanme}`,
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

const recAmount = 10;
const recNamePrefix = "read_name_";
let mock,client;

async function setResources() {
    const p = [];
    for (let i = 0; i < recAmount; i++) {
        p.push(
            Dummy.builder(`${recNamePrefix}${i}`).save()
        );
    }
    Promise.race(p).then(first => {
        mock = first;
    });
    return await Promise.all(p);
}

beforeAll(async () => {
    const config: IConnectionConfig = {
        port: 27017,
        protocol: "mongodb://",
        hostName: "127.0.0.1",
        db: "SUGOIJS-TEST",
        user: null,
        password: null
    };
    mongod = new MongodbMemoryServer({
        instance: {
            port: config.port,
            ip: config.hostName,
            dbName: config.db
        }
    });
    return await mongod.getConnectionString().then(connString => {
        console.info(connString);
    })
        .then(() => MongoModel.setConnection(config, "TESTING"))
        .then(connection => {
            client = connection.client;
            return setResources()
        })

});
afterAll(async () => {
    console.info("Stopping server");
    await client.close(true);
    return await mongod.stop();
});

//Create test suit
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
            .catch(err => expect(true).toBeFalsy())
    });
});


//Read test suit
describe("Model read test suit", () => {

    // beforeAll(() => {
    //     return setResources()
    // });

    test("Find all - check amount", async () => {
        return Dummy.findAll({name: {$regex: `${recNamePrefix}`}}, QueryOptions
            .builder()
            .setSortOption(new SortItem(SortOptions.DESC, "lastSavedTime")))
            .then(res => {
                return expect(res.length).toBe(recAmount);
            })
    });

    test("Find - check amount", async () => {
        return Dummy.find({name: {$regex: `${recNamePrefix}`}}, QueryOptions
            .builder()
            .setSortOption(new SortItem(SortOptions.DESC, "lastSavedTime")))
            .then(res => {
                return expect(res.length).toBe(recAmount);
            })
    });

    test("Find one", async () => {
        return Dummy.findOne({name: {$regex: `${recNamePrefix}`}}, QueryOptions
            .builder()
            .setSortOption(new SortItem(SortOptions.ASC, "lastSavedTime"))
        )
            .then(res => {
                return expect(res).toEqual(mock);
            })
    });

    test("Find by Id", async () => {
        return Dummy.findById(mock.id, QueryOptions
            .builder()
            .setSortOption(new SortItem(SortOptions.DESC, "lastSavedTime"))
        )
            .then(res => {
                return expect(res).toEqual(mock);
            })
    });
});

//Update test suit
describe("Model update test suit", () => {
    test("update by id - validation fail", async () => {
        return await Dummy.updateById<Dummy>(MockId, {name: "12"})
            .catch(err => (<any>expect(err)).toBeExceptionOf(validationException));
    });

    test("update by id - validation pass", async () => {
        return await  Dummy.updateById<any>(MockId, {name: "12", isUpdate: true})
            .then(res => res.ok ? Dummy.findById(MockId) : null)
            .then(res => {
                expect(res).not.toBe(null);
                expect(res.name).toBe("u_12");
                expect(res.lastUpdated).toBe("today");
                return null
            })
    });

    test("update - validation invalid Id", async () => {
        return await Dummy.updateById<any>("5b8c520c875d534870ab3417", {name: "12", isUpdate: true})
            .catch(err => (<any>expect(err)).toBeExceptionOf(notUpdatedException))
    });

    test("update after find ", async () => {
        let dummy;
        return await Dummy.findById(MockId)
            .then(_dummy => {
                dummy = _dummy;
                dummy.name = "MyTest";
                return dummy.update().then(_ => Dummy.findById(dummy.id));
            })
            .then((dummyRes: Dummy) => {
                expect(dummyRes.name).toBe("MyTest");
                expect(dummyRes.lastUpdated).toBe("today");
                expect(dummy.updated).toBe(true);
                return null;
            })
    });

    // test("update all",async ()=>{})

});

//Remove test suit
describe("Model remove test suit", () => {

    test("remove by id", async () => {
        return await Dummy.removeById<any>(MockId)
            .then(res => expect(res.n).toBe(1));
    });

    test("remove one - invalid Id", async () => {
        return await Dummy.removeById<any>("5b8c520c875d534870ab3417")
            .catch(err => {
                console.error(err);
                (<any>expect(err)).toBeExceptionOf(notFoundException);
            })
    });

    test("remove one - name", async () => {
        return await Dummy.removeOne<any>(
            {name: {$regex: recNamePrefix}},
            QueryOptions.builder().setSortOption(new SortItem(SortOptions.ASC, "lastSavedTime"))
        )
            .then(res => expect(res.n).toBe(1))
    });

    test("remove after find ", async () => {
        return await Dummy.findOne({name: {$regex: recNamePrefix}},
            QueryOptions.builder().setSortOption(new SortItem(SortOptions.DESC, "lastSavedTime"))
        )
            .then(dummy => dummy.remove())
            .then(res => expect(res.n).toBe(1))

    });

    test("remove all", async () => {
        return await Dummy.removeAll({name: {$regex: recNamePrefix}})
            .then((res: any) => expect(res.n).toBe(recAmount - 2));

    });
});

describe("Model extra functions", () => {
    test("Model name", () => {
        const originalModelName = "dummy";
        let modelName = originalModelName;
        expect(Dummy.getModelName()).toBe(modelName);
        modelName += "_updated";
        Dummy.setModelName(modelName);
        expect(Dummy.getModelName()).toBe(modelName);
        Dummy.setModelName(originalModelName);
        return;
    });

    test("Clone no Id", async () => {
        const dummy = Dummy.clone({name: "t"});
        expect(dummy.constructor.name).toBe("Dummy");
        return await dummy.save().then(res => {
            expect(res.id).not.toBeFalsy()
        });
    });

    test("Clone with Id", async () => {
        const name = "test_clone";
        const d = await Dummy.builder("test").save();
        const dummy = Dummy.clone({name, id: d.id});
        expect(dummy.constructor.name).toBe("Dummy");
        return await dummy.update()
            .then(res => Dummy.findById(d.id))
            .then(res => {
                expect(res.id).not.toBeFalsy();
                expect(res.name).toBe(name);
            });
    });

});
