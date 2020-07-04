import { Agent } from "../agents/base";
import { Environment } from "../environments/base";

export interface Visualisation {
  update(agent: Agent, environment: Environment): void;
}