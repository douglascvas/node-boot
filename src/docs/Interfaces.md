# Interfaces

Typescript does not offer metadata serialization for interfaces. That means that there is absolutely no way to know in runtime which interfaces a class implements.

Typescript though allows a class to implement an _**abstract**_ class. Doing that, typescript will in fact serialize the abstract class, but will create no link/relationship to the class that is implementing it.

That is where node-boot inters into action. In order to allow node-boot to register/find your service by the interface name you can do two things:

1. Create an abstract class extending the Interface class from node-boot:

```javascript 1.8
export abstract class GreetingService extends Interface {
  greet(name: string): string;
} 
```   

2. Use the abstract class with the @Injectable annotation:

```javascript 1.8
export class GreetingServiceImpl implements GreetingService {
  greet(name: string): string {
    return `A special hello to ${name}`;
  }
} 
```   

Behind the scenes node-boot will extract the name of your abstract class _(GreetingService in our example)_ and use it to register the implementation class to be injected in the services that depend on the former.


```javascript 1.8
export class MyHelloWorldApplication {
  constructor(private _greetingService: GreetingService){
  }
  
  greet(): void {
    console.log(this._greetingService.greet('Bob'));
  }
} 
```  