import {Injectable} from "@sugoi/core";
import {Connection} from "@sugoi/orm";


@Injectable()
export class MongoConnection extends Connection{


    protected constructor(hostName: string,
                          db: string,
                          port: number = 27017) {
        super(hostName, db, port);
    }


    public disconnect(){
        const connection = this.getConnection();
        if(!connection && connection.client)
            return Promise.resolve(null);
        else{
            return connection.client.close(true)
                .then((disconnectObject)=> {
                    super.disconnect();
                    return disconnectObject;
                });
        }

    }

    public getConnectionString(){
        let connString = `mongodb://`;
        if (this.user && this.password) {
            connString += `${this.user}:${this.password}@`;
        }
        connString += `${this.hostName}:${this.port}`;
        return connString;
    }
}