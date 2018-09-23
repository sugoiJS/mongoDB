import {Connection} from "@sugoi/orm";


export class MongoConnection extends Connection {
    private newParser: boolean = false;


    protected constructor(hostName: string,
                          db: string,
                          port: number = 27017) {
        super(hostName, db, port);
    }

    public useNewParser(useNewParse: boolean) {
        this.newParser = useNewParse;
    }

    public shouldUseNewParser():boolean {
        return this.newParser;
    }

    public disconnect() {
        const connection = this.getConnection();
        if (!connection && connection.client)
            return Promise.resolve(null);
        else {
            return connection.client.close(true)
                .then((disconnectObject) => {
                    super.disconnect();
                    return disconnectObject;
                });
        }

    }

    public getConnectionString() {
        let connString = `mongodb://`;
        if (this.user && this.password) {
            connString += `${this.user}:${this.password}@`;
        }
        connString += `${this.hostName}:${this.port}`;
        return connString;
    }
}