import {Environment} from '../environments/base';
import {Model} from './base';
import {Action, Percept} from '../types';

export class Simulator implements Model {
  /* TODO(aslanides): docstring. */

  environment: Environment;
  numActions: number;

  constructor(environment: Environment) {
    this.environment = environment;
    this.numActions = environment.numActions;
  }

  update(_: Action, __: Percept) {}

  generatePercept(): Percept {
    return this.environment.generatePercept();
  }

  perform(action: Action): void {
    this.environment.perform(action);
  }

  conditionalDistribution(e: Percept): number {
    return this.environment.conditionalDistribution(e);
  }

  save(): void {
    this.environment.save();
  }

  load(): void {
    this.environment.load();
  }

  info(): object {
    return {};
  }

  entropy() {
    return 0;
  }

  infoGain() {
    return 0;
  }
}
