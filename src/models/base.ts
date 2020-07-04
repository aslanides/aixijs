import {Environment} from "../environments/base";
import { Action, Percept } from "../types";

export interface Model extends Environment {
  // TODO(aslanides): Do we need both of these?
  update(a: Action, e: Percept): void;

  // 
  entropy(): number;
  infoGain(): number;

}