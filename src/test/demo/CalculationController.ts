import {Controller} from "../../main/mvc/controller/Controller";
import {CalculationService} from "./CalculationService";
import {RequestMapping} from "../../main/mvc/api/RequestMapping";
import {ResponseBody} from "../../main/mvc/api/ResponseBody";
import {TestFilter} from "./PositiveValueFilter";
import {RequestType} from "../../main/mvc/api/RequestType";

@Controller({uri: "/calculation"})
export class CalculationController {
  constructor(private _calculationService: CalculationService) {
  }

  @ResponseBody
  @RequestMapping({uri: "/add/:value1/:value2", type: RequestType.GET})
  public async add(request, response) {
    return await this._calculationService.sum(parseInt(request.params.value1), parseInt(request.params.value2));
  }

  @ResponseBody
  @RequestMapping({uri: "/add-positive/:value1/:value2", filters: [TestFilter], type: RequestType.POST})
  public addPositive(request, response) {
    return this._calculationService.sum(parseInt(request.params.value1), parseInt(request.params.value2));
  }
}