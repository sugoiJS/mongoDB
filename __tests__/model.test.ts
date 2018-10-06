import {IConnectionConfig, QueryOptions, SugoiModelException, SortItem, SortOptions} from "../index";
import {Dummy} from "./models/dummy";
import {MongoModel} from "../classes/mongo-model.abstract";
import MongodbMemoryServer from 'mongodb-memory-server';

export async function connect() {
    let client, connection;
    const config: IConnectionConfig = {
        port: 27017,
        protocol: "mongodb://",
        hostName: "127.0.0.1",
        db: "SUGOIJS-TEST",
        user:   null,
        password: null,
        newParser: true
    };
    const mongod = new MongodbMemoryServer({
        instance: {
            port: config.port,
            ip: config.hostName,
            dbName: config.db,
        }
    });
    return await mongod.getConnectionString().then(connString => {
        console.info(connString);
    })
        .then(() => MongoModel.setConnection(config,"TESTING"))
        .then(_connection => _connection.connectionClient)
        .then(_connection => {
            client = _connection.client;
            connection = _connection.connection;
            return setResources();
        })
        .then(() => ({client, mongod, connection}))

}

export async function disconnect(client, mongod, connection) {
    console.info("Stopping server");
    expect.assertions(2);
    try {
        let disconnectRes = await Dummy.disconnect("t");
        expect(disconnectRes).toEqual(null);
        disconnectRes = await Dummy.disconnect();
        expect(disconnectRes).toBeTruthy();
        //corrupt disconnect
        const connection = Dummy.getConnection();
        delete connection.connectionClient;
        disconnectRes = await connection.disconnect();
        expect(disconnectRes).toEqual(false);
    } catch (err) {
        console.error(err);
    }
    return await mongod.stop();
}

export const exceptionCheck = {
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
};
expect.extend(exceptionCheck);

export const recAmount = 10;
export const recNamePrefix = "read_name_";
export let mockObject;

export async function setResources() {
    const p = [];
    for (let i = 0; i < recAmount; i++) {
        p.push(
            new Promise(resolve => {
                setTimeout(() => Dummy.builder(`${recNamePrefix}${i}`).save().then(resolve), i * 300)
            })
        );
    }
    Promise.race(p).then(first => {
        mockObject = first;
    });
    return Promise.all(p);
}

let mongod;
let MockId;
const validationException = {type: SugoiModelException, message: "INVALID", code: 4000};
const notFoundException = {type: SugoiModelException, message: "Not Found", code: 404};
const notUpdatedException = {type: SugoiModelException, message: "Not updated", code: 5000};
const notRemovedException = {type: SugoiModelException, message: "Not removed", code: 5000};

let client, connection;


beforeAll(async () => {
    const res = await connect();
    client = res.client;
    mongod = res.mongod;
    connection = res.connection;
});
afterAll(async () => disconnect(client, mongod, connection));


//Create test suit
describe("Model save test suit", () => {

    it("model should not be saved validation fail", async () => {
        expect.assertions(1);
        try {
            const dummy = await Dummy.builder("123").save()
        } catch (err) {
            (<any>expect(err)).toBeExceptionOf(validationException);

        }
    });

    it("model should be saved with lifecycle hooks apply", async () => {
        expect.assertions(1);
        const dummy = Dummy.builder("Sugoi");
        const dummyRes = await dummy.save()
            .then((saved) => {
                MockId = saved.getMongoId();
                return {name: saved.name, lastSaved: saved.lastSaved, saved: dummy.saved};
            });
        expect(dummyRes).toEqual({name: "Sugoi", lastSaved: "today", saved: true})
    });
});

//Read test suit
describe("Model read test suit", () => {

    // beforeAll(() => {
    //     return setResources()
    // });

    it("Find all - check amount", async () => {
        expect.assertions(1);
        const resAmount = await Dummy.findAll({name: {$regex: `${recNamePrefix}`}}, QueryOptions
            .builder()
            .setSortOptions(new SortItem(SortOptions.DESC, "lastSavedTime"))
        )
            .then(res => res.length);
        expect(resAmount).toBe(recAmount);
    });

    it("Find - check amount", async () => {
        expect.assertions(1);
        const resAmount = await Dummy.find({name: {$regex: `${recNamePrefix}`}})
            .then(res => res.length);
        expect(resAmount).toBe(recAmount)
    });

    it("Find one", async () => {
        expect.assertions(1);
        const dummyRes = await Dummy.findOne({name: {$regex: `${recNamePrefix}`}}, QueryOptions
            .builder()
            .setSortOptions(new SortItem(SortOptions.ASC, "lastSavedTime"))
        );
        expect(dummyRes).toEqual(mockObject);
    });

    it("Find by Id", async () => {
        expect.assertions(1);
        const dummy = await Dummy.findById(mockObject.id, QueryOptions
            .builder()
            .setSortOptions(new SortItem(SortOptions.DESC, "lastSavedTime"))
        );
        expect(dummy).toEqual(mockObject)
    });

    it("Find by Id $in", async () => {
        expect.assertions(1);
        const dummy = await Dummy.find({_id: {$in: [MongoModel.getIdObject(mockObject.id)]}}, QueryOptions
            .builder()
            .setLimit(1)
            .setSortOptions(new SortItem(SortOptions.DESC, "lastSavedTime"))
        ).then(res => res[0]);
        expect(dummy).toEqual(mockObject)
    });
});

//Update test suit
describe("Model update test suit", () => {

    it("update by id - validation fail", async () => {
        expect.assertions(1);
        try {
            const dummy = await Dummy.updateById<Dummy>(MockId, {name: "12"});
        } catch (err) {
            (<any>expect(err)).toBeExceptionOf(validationException);
        }

    });

    it("update by id - validation pass", async () => {
        expect.assertions(1);
        const dummy = await Dummy.updateById<any>(MockId, {name: "12", isUpdate: true})
            .then(r=>{
                console.log(r)
                return r;
            })
            .then(res => res.ok ? Dummy.findOne({_id: MockId}, QueryOptions.builder().setLimit(1)) : null)
            .then(res => {
                console.log(res)
                if (!res) res = {};
                return {name: res.name, lastUpdated: res.lastUpdated};
            });
        expect(dummy).toEqual({name: "u_12", lastUpdated: "today"});
    });

    it("update - validation invalid Id", async () => {
        expect.assertions(1);
        try {
            const dummy = await Dummy.updateById<any>("5b8c520c875d534870ab3417", {name: "12", isUpdate: true});
        } catch (err) {
            (<any>expect(err)).toBeExceptionOf(notUpdatedException);
        }
    });

    it("update after find ", async () => {
        expect.assertions(1);
        let dummy;
        const dummyRes = await Dummy.findById(MockId)
            .then(_dummy => {
                dummy = _dummy;
                dummy.name = "MyTest";
                return dummy.update()
            })
            .then(_ => Dummy.findById(dummy.id))
            .then(res => {
                return {name: res.name, updated: dummy.updated, lastUpdated: res.lastUpdated}
            });
        expect(dummyRes).toEqual({name: "MyTest", lastUpdated: "today", updated: true})
    });

    // it("update all",async ()=>{})

});

//Remove test suit
describe("Model remove test suit", () => {

    it("remove by id", async () => {
        expect.assertions(1);
        const dummy = await Dummy.builder("test").save()
            .then(dummy => Dummy.removeById<any>(dummy.id))
            .then(res => res.n);
        expect(dummy).toBe(1)
    });

    it("remove by id $in", async () => {
        expect.assertions(1);
        const dummy = await Dummy.builder("test2").save()
            .then(dummy => Dummy.removeAll<any>({_id: {$in: [Dummy.getIdObject(dummy.id)]}}))
            .then((res: any) => res.n);
        expect(dummy).toBe(1)
    });

    it("remove one - invalid Id", async () => {
        expect.assertions(1);
        try {
            const dummyRes = await Dummy.removeById<any>("5b8c520c875d5348aaaaaaaa")
        } catch (err) {
            (<any>expect(err)).toBeExceptionOf(notRemovedException);
        }
    });

    it("remove one - name", async () => {
        expect.assertions(1);
        const dummy = await Dummy.removeOne<any>(
            {name: {$regex: recNamePrefix}},
            QueryOptions.builder().setSortOptions(new SortItem(SortOptions.ASC, "lastSavedTime"))
        )
            .then(res => res.n);
        expect(dummy).toBe(1);
    });

    it("remove after find ", async () => {
        expect.assertions(1);
        const dummyRes = await Dummy.findOne({name: {$regex: recNamePrefix}},
            QueryOptions.builder().setSortOptions(new SortItem(SortOptions.DESC, "lastSavedTime")))
            .then(dummy => dummy.remove())
            .then(res => res.n)
        expect(dummyRes).toBe(1);

    });

    it("remove all", async () => {
        expect.assertions(1);
        const dummy = await
            Dummy.removeAll({name: {$regex: recNamePrefix}})
                .then((res: any) => res.n);
        expect(dummy).toBe(recAmount - 2)

    });
});

describe("Model extra functions", () => {
    it("Model name", () => {
        const originalModelName = "dummy";
        let modelName = originalModelName;
        expect(Dummy.getModelName()).toBe(modelName);
        modelName += "_updated";
        Dummy.setModelName(modelName);
        expect(Dummy.getModelName()).toBe(modelName);
        Dummy.setModelName(originalModelName);
        return;
    });

    it("Clone without Id", async () => {
        expect.assertions(2);
        const dummy = Dummy.clone({name: "t"});
        expect(dummy.constructor.name).toBe("Dummy");
        const dummyId = await dummy.save().then(res => res.id);
        expect(dummyId).toBeDefined()
    });

    it("Clone with Id", async () => {
        expect.assertions(2);
        const name = "test_clone";
        const d = await Dummy.builder("test").save();
        const dummy = Dummy.clone({name, id: d.id});
        const JSONDummy = {...dummy.toJSON()};
        expect(dummy.constructor.name).toBe("Dummy");
        const dummyRes = await dummy.update()
            .then(res => Dummy.findById(d.id))
            .then(res => res.toJSON());
        expect({name: dummyRes.name, id: dummyRes.id}).toEqual({name: JSONDummy.name, id: JSONDummy.id});
    });

    it("Ignored fields", async () => {
        expect.assertions(10);
        const dummy = Dummy.builder("TestIgnore");
        dummy.addFieldsToIgnore("lastUpdated");
        expect(dummy.getIgnoredFields().indexOf("lastUpdated")).toBeGreaterThan(-1);
        let res = await dummy.save();
        dummy.isUpdate = true;
        expect(res.saved).not.toBeDefined();
        res = await dummy.update().then(() => Dummy.findById(res.id));
        expect(res.lastUpdated).not.toBeDefined();
        expect(res.updated).not.toBeDefined();
        expect(res.isUpdate).not.toBeDefined();
        dummy.removeFieldsFromIgnored("lastUpdated", "updated");
        expect(dummy.getIgnoredFields().indexOf("lastUpdated")).toEqual(-1);
        expect(dummy.getIgnoredFields().indexOf("updated")).toEqual(-1);
        res = await dummy.update().then(() => Dummy.findById(res.id));
        expect(res.lastUpdated).toEqual("today");
        expect(res.isUpdate).not.toBeDefined();
        expect(res.updated).toBeDefined();
    });

    it("Ignored fields init", async () => {
        expect.assertions(8);
        const dummy = Dummy.builder("TestIgnore");
        dummy.addFieldsToIgnore("lastUpdated");
        dummy.removeFieldsFromIgnored("isUpdate");
        expect(dummy.getIgnoredFields().length).toEqual(5);
        let res = await dummy.save();
        dummy.isUpdate = true;
        expect(res.saved).not.toBeDefined();
        res = await dummy.update().then(() => Dummy.findById(res.id));
        expect(res.lastUpdated).not.toBeDefined();
        expect(res.updated).not.toBeDefined();
        expect(res.isUpdate).toBeTruthy();
        dummy.initIgnoredFields();
        res.isUpdate = false;
        expect(dummy.getIgnoredFields().length).toEqual(5);
        res = await res.update().then((res) => res.ok ? Dummy.findById(res.id): {});
        expect(res.lastUpdated).toBeDefined();
        expect(res.isUpdate).toBeTruthy();
    })

});
