import {Filter} from "../../main/web/filter/Filter";
import {BasicFilter} from "../../main/web/filter/BasicFilter";
import * as express from 'express';

@Filter
export class TestFilter extends BasicFilter {
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