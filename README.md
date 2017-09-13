## What is node-boot?

Node Boot is a framework for dependency injection (IoC) and REST management. 
 
## What can I do with it?
 
You can simplify [a lot] your Node.JS development with Typescript by using Dependency Injection, and RESTful apis throughout simple annotations.
 
## An example is the best explanation

```typescript

import {Factory} from "node-boot";
export class MyShop {
  
  // defines a method that will create the database client instance
  @Factory('database')
  public databaseFactory(): Mongo {
    return new Mongo();
  }
}

import {Service} from "node-boot";
// define a class to be instantiated by the framework and injected in whatever class needs it
@Service
export class PaymentService {
  public pay(): Promise<void> {
     // ...
  }
}

import {Filter, BasicFilter} from "node-boot";
// Declares a filter class, that will access the request before it is handled by the controller that uses it
@Filter
export class BigPaymentFilter implements BasicFilter {
  public filter(request: any, response: any, next: Function): Promise<any> {
    if(request.body && request.body.amount > 1000){
      console.log('That is a big amount!')
      return next();
    }
  }
}

import {Controller, ResponseBody, RequestMapping, RequestType} from "node-boot";

@Controller({path: '/payment'})
export class PaymentController {
  constructor(private paymentService: PaymentService){
  }
  
  // define a REST api - this will be automatically registered on your REST framework, i.e. expressJs
  // the ResponseBody annotation will take care of the returned value, setting it into the response
  @ResponseBody
  @RequestMapping('/pay', RequestType.POST, filters: [BigPaymentFilter])
  public async paymentApi(request, response): Promise<Payment> {
    // you can use promises here as well
    let paymentData = await this.paymentService.pay();
    return "Your payment succeeded!";
  }
}
```

You can see some little demo application in the test/demo folder.

## How do I use it?

1. First of all you need a main class. Take as example the `MyShop` class. 
2. Now you need to bootstrap your application using node-boot. It will instantiate your main class and resolve the registered dependencies.
```typescript
import {ApplicationManager, ClassProcessor, ExpressWebManagerClassProcessor} from "node-boot";
import * as express from "express";

// Initialize the web manager, used by node-boot to manage RESTful APIs.
// The Express web manager is already provided by node-boot (you can use other frameworks when 
// you want, you just need to implement the ClassProcessor interface)
const expressWebManager: ClassProcessor = ExpressWebManagerClassProcessor.Builder(this.expressApp).build();

// Initialize the node-boot class that will manage your application, doing all the 'magic'
const applicationManager: ApplicationManager = ApplicationManager.Builder(MyApp)
      .withClassProcessors(expressWebManager)
      .build();

applicationManager.configuration().enableAutoScan(`${__dirname}/**/*.ts`, './node_modules/**');


// Start wiring up things and registering your apis (if any)
applicationManager.bootstrap();
```
1. Notice that in the example above we used a web manager. It is optional though, just use it if you want node-boot to handle your REST apis.
2. Notice also that we used `enableAutoScan(...)`. It is optional, and you can use that to tell node-boot to automatically scan all the files in our project that matches the first parameter, excluding from the search the files that match the second parameter. If you opt to not use the auto scanner, you will have to manually register all your dependencies using the `ApplicationManager`.

To see other example how to use it, see the `TestApplication.ts` demo application at `src/test/demo` folder.

## Which annotations are available?

### @Service

Declares a class to be automatically instantiated by node-boot and available for injection.
That means that all the constructor arguments will also be resolved automatically by the injector.

In the example above, bookingService will be instantiated automatically and passed as parameter to the paymentController, that will also be instantiated automatically.

Syntax:
`@Service(string | FilterOptions)`

If the parameter is a string, it will be used as the API URI.

If no parameter is given, or no name is given, the name will be extracted from the class name. So:
```typescript
@Service
class MyService {
}
```
will be registered as `myService`.

### @Factory

Declares a function that will act as a factory for some value. In other words, the value returned by the function will be registered by node-boot so it can be injected in classes that references it.

Syntax:
`@Factory(string | FactoryOptions)`

If the parameter is a string, it will be used as the name of the registered value.

If no parameter is given, or no name is given, the name will be extracted from the function name. So:
```typescript
@Factory
public database() {
}
```
will be registered as `database`.

You can also use parameters in your factory function. Any parameter declared will be resolved and injected by node-boot into the function when calling it.
```typescript
 @Factory
 public database(cache) {
  // node-boot will check if you registered anything named 'cache' and will pass here as parameter 
 }
```

### @Controller

This annotation extends the `@Service` annotation, what means that the annotated class will be registered as a service.
You **must** use this annotation in classes where you have REST endpoints to be managed by node-boot.

For the available annotation parameters see the ControllerOptions interface.

Syntax:
`@Controller(ControllerOptions)`

If no parameter is given, or no name is given, the name will be extracted from the class name. So:
```typescript
@Controller
class MyController {
}
```
will be registered as `myController`.

### @Filter

This annotation extends the `@Service` annotation, what means that the annotated class will be registered as a service.
Use this annotation for defining classes whose `filter` function will be used as a middleware to those APIs that reference this filter.
The annotated class **must** implement the `BasicFilter` interface.

For the available annotation parameters see the FilterOptions interface.

```typescript
@Filter('myTestFilter')
class TestFilter implements BasicFilter {
  public filter(request: any, response: any, next: Function): Promise<any> {
    //...
  }
}

@Controller
class TestFilter implements BasicFilter {
  @RequestMapping({uri: '/foo', filters: ['myTestFilter']})
  public filter(request: any, response: any, next: Function): Promise<any> {
    //...
  }
}
```

Syntax:
`@Filter(string | FilterOptions)`

If the parameter is a string, it will be used as the API URI.

If no parameter is given, or no name is given, the name will be extracted from the class name. So:
```typescript
@Filter
class MyFilter {
}
```
will be registered as `myFilter`.

### @ResponseBody

Tells node-boot to handle the return value of the annotated function and set it in the http response. Therefore, you don't need to do `response.send(200, payment)`, but instead just return the `payment` object.

Syntax:
`@ResponseBody`

### @RequestMapping

This annotations tells node-boot to register a REST api with the path passed as first parameter to the annotation, and using the request type passed as second.
The final API URL will be the concatenation of the path declared in the `@Controller` if any and the path attribute from the `@RequestPath`

For the available annotation parameters, see the RequestMappingOptions interface.

Syntax:
`@RequestMapping(string | RequestMappingOptions)`

If the parameter is a string, it will be used as the API URI.

In case you want to use a filter, you can use the `RequestMappingOptions` `filters` parameter, which takes an array containing either the filter class or the filter name. Example:

```typescript
@Filter('fooFilter')
class MyFilter { /*...*/ }
```

`@RequestMapping({..., filters: [ MyFilter ]})`
and
`@RequestMapping({..., filters: [ 'fooFilter' ]})`
will do the same thing. 

## Registering classes manually
Then you have to register your classes manually. Example:

```typescript
applicationManager.registerService(PaymentService)
applicationManager.registerService(PaymentController)
applicationManager.registerFactory({
  name: 'database', 
  factoryFn: MyShop.prototype.databaseFactory,
  context: MyShop
})
```

> It doesn't matter in which order you register. Just make sure you register all before calling `applicationManager.bootstrap()`.

## ApplicationManager 
This is the bridge between your application and node-boot. 
 
* `registerService(Function | ServiceOptions)` - registers a class to be automatically instantiated
  You can pass either the class to be registered, or a ServiceOptions object containing more options.

* `registerFactory(Function | FactoryOptions)` - registers a function to be used a factory, so to be called to generate an instance for such name
  You can pass either the function to be used as factory, or a FactoryOptions object containing more options.

* `registerValue(name: string, value: any)` - registers a static value so that node-boot can use it to inject in other instances.
  * `name: string` - Name for the value. Whenever node-boot finds a parameter with this name in the constructor of a class being instantiated, it will inject the value passed as second parameter to this function. 
  * `value: any` - Value to be registered.


## How do I install?

Simple:
```
npm install node-boot --save
```

## Todo:

* Add error handler support
* Add authentication/authorization mechanism


## Contribute 
Do you want to contribute? Please open an issue or send a pull request... let's make it great!



## Changelog

**2.0**:
- <sup>Major rewrite of code.</sup> 
- <sup>Created support for plugins (class processors and class providers).</sup> 
- <sup>Classes are instantiated now using builder pattern.</sup> 
- <sup>Created support for filters.</sup> 
- <sup>Changed signature for ApplicationManager</sup> 
- <sup>All classes are now built with Builder pattern.</sup> 
- <sup>WebManager became an interface, which is implemented by ExpressWebManager</sup> 
- <sup>Changed signature of methods in DependencyManager.</sup> 
- <sup>Changed signature of methods in ApplicationManager.</sup> 
- <sup>Removed @AutoScan in favor of configuring directly when building ApplicationManager.</sup>
- <sup>Some minor fixes.</sup> 
- <sup>Adjusted documentation accordingly.</sup>


