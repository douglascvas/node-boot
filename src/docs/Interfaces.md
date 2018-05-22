# Interfaces

Typescript does not offer metadata serialization for interfaces. That means that there is absolutely no way to know in runtime which interfaces a class implements.

Typescript allows a class to implement an _**abstract**_ class though. By doing that typescript will in fact serialize the abstract class, but will create no link/relationship to the class that is implementing it.

That is where node-boot comes into action. In order to allow node-boot to register/find your service by the interface name you can do two things:

`1` - Create an abstract class instead of an interface

```javascript 1.8
export abstract class GreetingService {
  greet(name: string): string;
} 
```   

`2` - When declaring your injectable class, use the `nameFrom` parameter to specify from which class node-boot must get the name from.

The advantage of doing that instead of declaring the name as a string is that it can be renamed automatically when doing refactorings (renaming the abstract class), as well as making easier to identify code usage.

```javascript 1.8
@Injectable({nameFrom: GreetingService})
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