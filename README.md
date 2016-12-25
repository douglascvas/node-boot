## What is node-boot?

Node Boot is a framework for dependency injection (IoC) and REST management. 
 
## What can I do with it?
 
You can simplify [a lot] your Node.JS development with Typescript by using Dependency Injection, and RESTful apis throughout simple annotations.
 
## An example is the best explanation

```typescript

@AutoScan(`${__dirname}/**/*.js`)
export class MyShop {
  
  @Factory('database')
  public databaseFactory(): Mongo {
    return new Mongo();
  }
}

@Service
export class PaymentService {
  public pay(): Promise<void> {
     // do whatever
  }
}

@Service
export class PaymentController {
  constructor(private paymentService: PaymentService){
  }
  
  @ResponseBody
  @RequestMapping('/payment', RequestType.POST)
  public paymentApi(request, response): Payment {
    this.paymentService.pay();
    return "Your payment succeeded!";
  }
}
```

## Which annotations are available?

### @Service

Declares a class to be automatically instantiated by node-boot and available for injection.
That means that all the constructor arguments will also be resolved automatically by the injector.

In the example above, bookingService will be instantiated automatically and passed as parameter to the paymentController, that will also be instantiated automatically.

### @AutoScan

Tells the application to scan all the files that match the glob pattern passed as parameter to the annotation.

In the example node-boot will load all the javascript files, recursively, that are located in the current directory. Notice that it will scan **.js** files, and not **ts**, as our source code will be transpiled from typescript to javascript, right?

Syntax:
`@RequestMapping(includePaths, excludePaths)`
* `includePaths: string|Array<string>` - Glob syntax used to match the files to load.
* `excludePaths: string|Array<string>` - Glob syntax used to match the files to **not** load.

### @ResponseBody

Tells node-boot to handle the return value of the annotated function and set it in the http response. Therefore, you don't need to do `response.send(200, payment)`, but instead just return the `payment` object.

### @RequestMapping

This annotations tells node-boot to register a REST api with the path passed as first parameter to the annotation, and using the request type passed as second.

Syntax:
`@RequestMapping(path, requestType)`
* `path: string` - Path to the REST api.
* `requestType: RequestType` - HTTP method.
 
## How do I use it?

1. First of all you need a main class. Take as example the `MyShop` class. You don't need to use file scan if you don't want, but if you don't you will need to register all your classes manually into node-boot.
2. Now you need to bootstrap your application using node-boot. It will instantiate your main class and resolve the registered dependencies.
```typescript
import {ApplicationManager} from "node-boot";
import * as express from "express";

// Initialize the web manager, used by node-boot in the ApplicationManager to manage RESTful APIs.
// The Express web manager is already provided by node-boot (you can use other frameworks when 
// you want, you just need to implement the webManager interface)
const webManager: WebManager = new ExpressWebManager(express());

// Initialize the node-boot class that will manage your application, doing all the 'magic'
const applicationManager: ApplicationManager = new ApplicationManager(MyApp, webManager);

// Start wiring up things and registering your apis (if any)
applicationManager.bootstrap();
```
Notice that in the example above we used a web manager. It is optional though, just use it if you want node-boot to handle your REST apis.

## What about NOT using the AutoScanner?
Then you have to register your classes manually. Example:

```typescript
applicationManager.registerService(PaymentService)
applicationManager.registerService(PaymentController)
applicationManager.registerFactory('database', MyShop.prototype.databaseFactory, 'myShop')
```

It doesn't matter in which order you register them. Just make sure you register all before calling `applicatinManager.bootstrap()`.

## ApplicationManager 
This is the bridge between your application and node-boot. 
 
* `constructor(mainApplicationClass: Function, webManager?: WebManager, loggerFactory?: LoggerFactory, dependencyInjector?: DependencyInjector, moduleScannerService?: ModuleScannerService)`
  * `mainApplicationClass: Function` - The main application class, that will be instantiated and managed by node-boot. 
  * `webManager?: WebManager` - Class that will be used for operations related to web management, as registration of REST APIs. Only required when using web related annotations, as @RequestMapping 
  * `loggerFactory?: LoggerFactory` - Optional factory responsible for creating the Logger, to be used for logging.
  * `dependencyInjector?: DependencyInjector` - Optional injector, in case you want to give a personalized injector. If not given, the DefaultDependencyInjector will be used.
  * `moduleScannerService?: ModuleScannerService`- Optional service that is responsible for scanning files (used in conjunction with @AutoScan). If not given, a DefaultModuleScanner will be used. 
 
* `registerService(classz: Function, name?: string)` - registers a class to be automatically instantiated
  * `classz: any` - Class to be instantiated by node-boot.
  * `name: string` - Optional name for the instance. If not given, it will be extracted from the class name. PaymentService class will be named *`paymentService`*, for instance.

* `registerFactory(name: string|Function, factoryFn: Function, instance?: any)` - registers a function to be used a factory, so to be called to generate an instance for such name
  * `name: string|Function` - The name of the instance that will be produced. If it is a class, the name will be extracted from the class name. Example: *`database`*
  * `factoryFn: string` - The function that will be called to construct the instance. Example: *`MyShop.prototype.databaseFactory`*
  * `context` - Optional parameter. This defines the instance from which the factory function will be called (consider it as the *`this`* from the function). It will be most probably a string, representing the name of the instance if you want node-boot to find/instantiate it automatically. It can also be a Class reference though, if you want that node-boot extracts the name for you. Example: *`myShop`*.

* `registerValue(name: string, value: any)` - registers a value so that node-boot can use it to inject in other instances.
  * `name: string` - Name for the value. Whenever node-boot finds a parameter with this name in the constructor of a class being instantiated, it will inject the value passed as second parameter to this function. 
  * `value: any` - Value to be registered.


## How do I install?

Simple:
```
npm install node-boot --save
 
typings install node-boot=github:douglascvas/node-boot/index.d.ts --global
```


