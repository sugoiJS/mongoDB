# @Sugoi\mongoDB

![Sugoi logo](https://www.sugoijs.com/assets/logo_inverse.png)


## Introduction
Sugoi is a minimal modular framework,

which gives you the ability to use only what you need, fast.

As all of the "Sugoi" modules, this module is stand alone and can act without other Sugoi modules.


Sugoi mongoDB package provide ORM solution for mongoDB.

This package relays on the Sugoi core ORM infrastructure.

## Installation

> npm install --save @sugoi/mongoDB

### Bootstrapping

    import {MongoModel} from "@sugoi/mongodb";

    MongoModel.setConfig({
                            port: 27017,
                            protocol: "mongodb://",
                            hostName: "my-mongo.services.com",
                            db: "myAuthDB", //authorization DB
                            user: "dbUser",
                            password: "dbPassword"
                          });
    MongoModel.connect("myDataDB");


### Create Model

For creating a model all you need is to extend the MongoModel class and set your properties

just like that:

    export class Message extends MongoModel {
        public userId:string;
        public body:string;

        constructor(userId:string,body:string){
            super();
            this.userId = userId;
            this.body = body;
        }
    }

By default the collection name is the class name with case sensitive.

For override the collection name you can just set the collectionName property

    export class Message extends MongoModel {
            public userId:string;
            public body:string;

        constructor(userId:string,body:string){
            super();
            this.userId = userId;
            this.body = body;
            collectionName = "my-app-message"
        }
    }

### Model methods

The model as few main methods:

##### Query
    static find<T>(query?: any): Observable<Array<T>>;
    static findOne<T>(query?: any): Observable<T>;

##### Upsert
    save<T>(options: CollectionInsertOneOptions): Observable<T>;
    update(options?: ReplaceOneOptions): Observable<any>;

##### Remove
    remove<T>(): Observable<T>;


### Model lifecycle

You can find information about the model lifecycle under [@sugoi\core documentation](http://www.sugoijs.com/documentation/core/index)

## Documentation

You can find further information on [Sugoi official website](http://www.sugoijs.com)