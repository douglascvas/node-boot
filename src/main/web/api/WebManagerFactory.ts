import {JsObject} from "../../core/JsObject";

export abstract class WebManagerFactory extends JsObject {
  abstract create(): any;
}