import {Filter} from "../../main/mvc/filter/Filter";
import {BasicFilter} from "../../main/mvc/filter/BasicFilter";
import * as express from 'express';

@Filter
export class TestFilter implements BasicFilter {
  filter(request: express.Request, response: Response, next: Function): Promise<any> {
    if (request.params.value1 < 0) {
      request.params.value1 = 0;
    }
    if (request.params.value2 < 0) {
      request.params.value2 = 0;
    }
    return next();
  }

}