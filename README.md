# @Sugoi\mongoDB

![Sugoi logo](https://www.sugoijs.com/assets/logo_inverse.png)

![https://travis-ci.org/sugoiJS/mongoDB](https://travis-ci.org/sugoiJS/mongoDB.svg?branch=master)

## Introduction
SugoiJS is a minimal modular framework.

SugoiJS gives you the ability to use only what you need and do it fast.

this is a standalone module that can be functional on its own (as all of the SugoiJS modules).


Sugoi mongoDB package provides ORM solutions for mongoDB.

This package relays on Sugoi\ORM infrastructure using the ConnectableModel abstract class.

## Installation

> npm install --save @sugoi/mongoDB

### tsconfig.json:

Under your tsconfig - compilerOptions set:

- `"target": "es2015"`

- `"emitDecoratorMetadata": true`

- `"experimentalDecorators": true`

- `"lib": ["es2015","dom"]`


#### Template

You are able to use the config template which was set for the @sugoi/demo application:

    {
      "compilerOptions": {
        "baseUrl": "./src",
        "allowJs": true,
        "target": "es2015",
        "module": "commonjs",
        "moduleResolution": "node",
        "sourceMap": true,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "lib": [
          "es2015",
          "dom"
        ],
        "typeRoots": [
          "./node_modules/@types"
        ],
        "types": [
          "body-parser",
          "express",
          "node"
        ]
      }
    }

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

For override the collection name, use the @ModelName decorator:

    @ModelName("AppMessage")
    export class Message extends MongoModel {
            public userId:string;
            public body:string;

        constructor(userId:string,body:string){
            super();
            this.userId = userId;
            this.body = body;
        }
    }

##### Using connections

For using different connection for model you able to either use all you need to use
`setConnectionName` static method or `ConnectionName` decorator.

    @ModelName("AppMessage")
    @ConnectionName("appDB")
    export class Message extends MongoModel {
                public userId:string;
                public body:string;

        constructor(userId:string,body:string){
            super();
            this.userId = userId;
            this.body = body;
            this.constructor.setConnectionName("adminDB");
        }
    }

### Model methods

Some of the model main methods:

#### Query

> static find<T=any>(query?: any): Promise<Array<T>>;

> static findOne<T=any>(query?: any): Promise<T>;

#### Upsert

> save<T=any>(options: CollectionInsertOneOptions): Promise<T>;

> update<T=any>(options?: ReplaceOneOptions): Promise<T>;

#### Remove

> remove<T=any>(): Promise<T>;

Find information about the model interface on [@sugoi\orm documentation](http://www.sugoijs.com/documentation/orm/index)


### Model lifecycle

@sugoi\mongodb module re-export orm lifecycle interfaces.

Find information about the model lifecycle on [@sugoi\orm documentation](http://www.sugoijs.com/documentation/orm/index)

## Documentation

You can find further information on [Sugoi official website](http://www.sugoijs.com)
