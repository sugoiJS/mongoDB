# @Sugoi\mongoDB

![Sugoi logo](https://www.sugoijs.com/assets/logo_inverse.png)


## Introduction
SugoiJS™ is a minimal modular framework.

SugoiJS™ gives you the ability to use only what you need and do it fast.

this is a standalone module that can be functional on its own (as all of the SugoiJS™ modules).


Sugoi mongoDB package provides ORM solutions for mongoDB.

This package relays on Sugoi\ORM infrastructure using the ConnectableModel abstract class.

## Installation

> npm install --save @sugoi/mongoDB

### Bootstrapping

Bootstrapping done by only one line:

    MongoModel.setConnection(configuration:IConnectionConfig,connectionName:string = "default")

The connectionName is used for multiple connection

Example:

    import {MongoModel} from "@sugoi/mongodb";

    MongoModel.setConnection({
                            port: 27017,
                            protocol: "mongodb://",
                            hostName: "my-mongo.services.com",
                            db: "myAuthDB", //authorization DB
                            user: "dbUser",
                            password: "dbPassword"
                          }, "adminDB");


### Create Model

to create a model, all you need is to extend the MongoModel class and set your properties.

Just like that:

    export class Message extends MongoModel {
        public userId:string;
        public body:string;

        constructor(userId:string,body:string){
            super();
            this.userId = userId;
            this.body = body;
        }
    }

By default the collection name is the class name (case sensitive).

For override the collection name, set the collectionName property:

    export class Message extends MongoModel {
            public userId:string;
            public body:string;

        constructor(userId:string,body:string){
            super();
            this.userId = userId;
            this.body = body;
            this.collectionName = "my-app-message";
        }
    }

##### Using connections

For using different connection for each model all you need to do
is override the connnectionName with your connection name

    export class Message extends MongoModel {
                public userId:string;
                public body:string;

        constructor(userId:string,body:string){
            super();
            this.userId = userId;
            this.body = body;
            this.collectionName = "my-app-message";
            this.connectionName = "adminDB";
        }
    }

### Model methods

The model has some main methods:

##### Query
    static find<T>(query?: any): Observable<Array<T>>;
    static findOne<T>(query?: any): Observable<T>;

##### Upsert
    save<T>(options: CollectionInsertOneOptions): Observable<T>;
    update(options?: ReplaceOneOptions): Observable<any>;

##### Remove
    remove<T>(): Observable<T>;


### Model lifecycle

Find information about the model lifecycle under [@sugoi\core documentation](http://www.sugoijs.com/documentation/core/index)

## Documentation

You can find further information on [Sugoi official website](http://www.sugoijs.com)