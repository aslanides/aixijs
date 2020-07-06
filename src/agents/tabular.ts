import {Agent} from './base';
import {Percept, Action, Reward} from '../types';
import * as util from '../utils/util';
import {QTable} from '../utils/qtable';

interface TDLearner {
  TDUpdate(e: Percept): Action;
}

interface TabularOptions {
  alpha: number; // Learning rate.
  gamma: number; // Geometric discount factor.
  epsilon: number; // Exploration epsilon.
  initialQ: number; // Initial Q values
}

export class TabularAgent implements Agent, TDLearner {
  /* A tabular learning agent. */

  // How many steps the agent has taken.
  lifetime: number;

  // Number of actions in the environment.
  numActions: number;

  // Agent hyperparameters.
  alpha: number; // Learning rate for TD updates.
  epsilon: number; // Assumes epsilon-greedy policy.
  gamma: number; // Geometric discount factor.

  // Model state.
  Q: QTable;
  lastAction?: Action;

  // Stuff for tracing.
  lastQ: number; // TODO(aslanides): Remove this.
  lastObservation = 0;

  constructor(numActions: number, options: TabularOptions) {
    // Environment metadata.
    this.numActions = numActions;

    // Hyperparameters .
    this.epsilon = options.epsilon;
    this.alpha = options.alpha;
    this.gamma = options.gamma;

    // Agent state.
    this.lifetime = 0;
    this.Q = new QTable(options.initialQ, numActions);
    this.lastQ = 0;
  }

  bestAction(e: Percept): Action {
    return util.argmax(
      this.Q,
      (q: QTable, a: Action) => q.get(e.obs, a),
      this.numActions
    );
  }

  selectAction(e: Percept): Action {
    console.log(e);
    if (Math.random() < this.epsilon) {
      return util.randi(0, this.numActions);
    }
    return this.bestAction(e);
  }

  update(a: Action, e: Percept): void {
    this.lastAction = a;
    this.lifetime++;
    const old = this.Q.get(this.lastObservation, a);
    const Q =
      old +
      this.alpha *
        (e.rew + this.gamma * this.Q.get(e.obs, this.TDUpdate(e)) - old);
    this.Q.set(this.lastObservation, a, Q);
    this.lastQ = Q;
    this.lastObservation = e.obs;
  }

  TDUpdate(e: Percept): Action {
    // On-policy.
    return this.selectAction(e);
  }

  utility(e: Percept): Reward {
    return e.rew;
  }

  info() {
    return {};
  }
}

export class QLearning extends TabularAgent {
  TDUpdate(e: Percept) {
    return this.bestAction(e);
  }
}

export class SARSA extends TabularAgent {
  TDUpdate(e: Percept) {
    return this.selectAction(e);
  }
}
