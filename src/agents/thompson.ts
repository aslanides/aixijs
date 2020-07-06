import {BayesAgent} from './bayes';
import {MCTSOptions} from '../utils/mcts';
import {sample} from '../utils/util';
import {BayesMixture} from '../models/mixture';
import {Action, Percept} from '../types';
import {NoDiscount} from '../utils/discount';
import {Model} from '../models/base';

export class ThompsonAgent extends BayesAgent {
  rho: Model;
  model: BayesMixture;

  horizon: number;
  t = 0; // Lifetime.

  constructor(options: MCTSOptions, model: BayesMixture, horizon: number) {
    super(options, model, (e: Percept) => e.rew, NoDiscount());
    this.rho = this.thompsonSample();
    this.horizon = horizon;
    this.model = model;
  }

  thompsonSample(): Model {
    const idx = sample(this.model.weights);
    const rho = this.model.modelClass[idx];
    this.planner.model = rho;
    this.planner.reset();
    return rho;
  }

  update(a: Action, e: Percept) {
    super.update(a, e);
    this.rho.perform(a);
    this.t++;
  }

  selectAction(e: Percept): Action {
    if (this.t % this.horizon === 0) {
      this.rho = this.thompsonSample();
    } else {
      this.planner.reset();
    }

    return this.planner.bestAction();
  }
}
