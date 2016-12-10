import * as mvc from "./src/main/decorator/mvc";
import * as di from "./src/main/decorator/di";

export var RequestType: typeof mvc.RequestType;
export var Service: typeof di.Service;
export var Factory: typeof di.Factory;
export var AutoScan: typeof di.AutoScan;
export var ResponseBody: typeof mvc.ResponseBody;
export var RequestMapping: typeof mvc.RequestMapping;
