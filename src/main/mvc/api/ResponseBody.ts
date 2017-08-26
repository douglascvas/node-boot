export function ResponseBody(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
  descriptor.value = new Proxy(descriptor.value, {
    apply: async (originalMethod, thisArg, argumentsList) => {
      let returnValue = await originalMethod.apply(thisArg, argumentsList);
      let response = argumentsList[1];
      response.status(200).send(typeof returnValue === 'number' ? returnValue + '' : returnValue);
      return returnValue;
    }
  });
  return descriptor;
}