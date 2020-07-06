import {MCTSOptions, ExpectimaxTree} from '../utils/mcts';
import {DiscountFn, Percept, Action} from '../types';
import {Model} from '../models/base';
import {BayesAgent} from './bayes';
import * as util from '../utils/util';
import {Agent} from './base';

export class SquareKSA implements Agent {
  /* TODO(aslanides): docstring. */
  agent: BayesAgent;
  constructor(options: MCTSOptions, model: Model, discountFn: DiscountFn) {
    const opt = util.deepCopy(options);
    opt.minReward = -1;
    opt.maxReward = 0;
    // TODO(aslanides): Explain this.
    const utilityFn = (e: Percept) => model.conditionalDistribution(e);
    this.agent = new BayesAgent(opt, model, utilityFn, discountFn);
  }

  update(a: Action, e: Percept) {
    this.agent.update(a, e);
  }

  selectAction(e: Percept): Action {
    return this.agent.selectAction(e);
  }

  info() {
    return {};
  }
}

export class ShannonKSA implements Agent {
  /* TODO(aslanides): docstring. */
  agent: BayesAgent;
  constructor(options: MCTSOptions, model: Model, discountFn: DiscountFn) {
    const opt = util.deepCopy(options);
    opt.minReward = 0;
    opt.maxReward = 1000; // TODO(aslanides): Fix magic number.
    const utilityFn = (e: Percept) =>
      -1 * Math.log2(model.conditionalDistribution(e));
    this.agent = new BayesAgent(opt, model, utilityFn, discountFn);
  }

  update(a: Action, e: Percept) {
    this.agent.update(a, e);
  }

  selectAction(e: Percept): Action {
    return this.agent.selectAction(e);
  }

  info() {
    return {};
  }
}

export class KullbackLeiblerKSA implements Agent {
  /* TODO(aslanides): docstring. */
  agent: BayesAgent;
  planner: ExpectimaxTree;
  constructor(options: MCTSOptions, model: Model, discountFn: DiscountFn) {
    const opt = util.deepCopy(options);
    opt.minReward = 0;
    opt.maxReward = model.entropy();
    // TODO(aslanides): Explain this.
    const utilityFn = (_: Percept) => model.infoGain();
    this.agent = new BayesAgent(opt, model, utilityFn, discountFn);
    this.planner = this.agent.planner;
  }

  update(a: Action, e: Percept) {
    this.agent.update(a, e);
  }

  selectAction(e: Percept): Action {
    return this.agent.selectAction(e);
  }

  info() {
    return {};
  }
}
