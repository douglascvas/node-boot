## What is springify?

Well, it is an attempt to borrow some functionalities from Spring, a Java framework for IOC (invesion of controll / dependency injection), MVC (Model View Controller), bringing it to typescript.
 
## Ok, what can I do with it?
 
You can simplify [a lot] your Node.JS development by using Dependency Injection, and RESTful apis using simple annotations.
 
## Sounds nice, could you give me an example?

Sure:

```typescript

@AutoScan(`${__dirname}/**/*.js`)
export class MyShop {
  
  @Produces('database')
  public databaseFactory(): Mongo {
    return new Mongo();
  }
}

@Named
export class PaymentService {
  public pay(): Promise<void> {
     // do whatever
  }
}

@Named
export class PaymentController {
  constructor(private bookingService: BookingService){
  }
  
  @RequestBody
  @RequestMapping('/payment', RequestType.POST)
  public paymentApi(request, response): Payment {
  }
}
```

## What are those annotations?

### @Named

Declares a class to be automatically instantiated by springify and available for injection.
That means that all the constructor arguments will also be resolved automatically by the injector.

In the example above, bookingService will be instantiated automatically and passed as parameter to the paymentController, that will also be instantiated automatically.

### @AutoScan

Tell the application to scan all the files that match the glob pattern passed as parameter to the annotation.

In the example springify will load all the javascript files, recursively, that are located in the current directory. Notice that it will scan **.js** files, and not **ts**, as our source code will be transpiled from typescript to javascript, right?

Syntax:
`@RequestMapping(includePaths, excludePaths)`
* `includePaths: string|Array<string>` - Glob syntax used to match the files to load.
* `excludePaths: string|Array<string>` - Glob syntax used to match the files to **not** load.

### @ResponseBody

Tells springify to handle the return value of the annotated function and set it in the http response. Therefore, you don't need to do `response.send(200, payment)`, but instead just return the `payment` object.

### @RequestMapping

This annotations tells springify to register a REST api with the path passed as first parameter to the annotation, and using the request type passed as second.

Syntax:
`@RequestMapping(path, requestType)`
* `path: string` - Path to the REST api.
* `requestType: RequestType` - HTTP method.
 
## How do I use it?

1. You need a main class. Let's suppose it is the `MyShop` class from the example. You don't need to use file scan if you want. But if you not, you will need to register manually all your classes into springify.
2. Now you need to bootstrap your application using springify.
```typescript
import {ApplicationManager} from "springify";
import * as express from "express";

// Initialize an express application (you can use other frameworks when you want, 
// you just need to implement the routerManager interface)
const app: any = express();

// Initialize the router manager, used by springigy in the ApplicationManager.
// The Express router manager is already provided by springify
const routerManager: RouteManager = new ExpressRouterManager(express.Router());

// Initialize the springify class that will manage your application, doing all the 'magic'
const applicationManager: ApplicationManager = new ApplicationManager(MyApp, routerManager);

// Start wiring up things and registering your apis
applicationManager.bootstrap();
```
Notice that in the example above we used a route manager. It is optional though, just use it if you want springify to handle your REST apis.

## What about NOT using the AutoScanner?
Then you have to register your classes manually. Let's use the examples from this page, and assume that we have no `@AutoScan` annotation:

```typescript
applicationManager.registerService(PaymentService)
applicationManager.registerService(PaymentController)
applicationManager.registerFactory('myShop', MyShop.prototype.databaseFactory)
```

It doesn't matter in which order you register them. Just make sure you register all before calling `applicatinManager.bootstrap()`.

## What is the ApplicationManager syntax?
 
* `registerService(classz: Function, name?: string)` - registers a class to be automatically instantiated
  * `classz: any` - Class to be instantiated by springify.
  * `name: string` - Optional name for the instance. If not given, it will be extracted from the class name. PaymentService class will be named *`paymentService`*, for instance.

* `registerFactory(name: string|Function, factoryFn: Function, instance?: any)` - registers a function to be used a factory, so to be called to generate an instance for such name
  * `name: string|Function` - The name of the instance that will be produced. If it is a class, the name will be extracted from the class name. Example: *`database`*
  * `factoryFn: string` - The function that will be called to construct the instance. Example: *`MyShop.prototype.databaseFactory`*
  * `holder` - Optional parameter. This defines the instance from which the factory function will be called (consider it as the *`this`* from the function). It will be most probably a string, representing the name of the instance if you want springify to find/instantiate it automatically. Example: *`myShop`*.

* `registerValue(name: string, value: any)` - registers a value so that springify can use it to inject in other instances.
  * `name: string` - Name for the value. Whenever springify finds a parameter with this name in the constructor of a class being instantiated, it will inject the value passed as second parameter to this function. 
  * `value: any` - Value to be registered.


## How do I install?

Simple:
```
npm install springify --save 
```


