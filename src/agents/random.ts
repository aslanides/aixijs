import {Agent} from './base';
import {Percept, Action, Reward} from '../types';
import {randi} from '../utils/util';

export class RandomAgent implements Agent {
  /* A uniform random policy. */

  numActions: number;

  constructor(numActions: number) {
    this.numActions = numActions;
  }

  selectAction(e: Percept): Action {
    return randi(0, this.numActions) as Action;
  }

  update(a: Action, e: Percept) {}

  info(): object {
    return {};
  }
}
