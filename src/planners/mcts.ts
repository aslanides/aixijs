/* Monte Carlo tree search.

This implements the rho-UCT algorithm described in [1].

Specifically, this is a variant of UCT that:

- Doesn't assume the environment dynamics are deterministic
- Doesn't assume that we can identify percepts with states.

[1] Veness et al., 2011 - A Monte Carlo AIXI implementation.
*/


import * as util from "../utils/util";
import { Percept, Action, Reward, UtilityFn, DiscountFn, Integer } from "../types";
import { Model } from "../models/base";

// A reward function combines utility and discount.
type RewardFn = (e: Percept, dfr: number, t?: number) => Reward;

export interface MCTSOptions {
  // Search configuration.
  horizon: number;  // Planning horizon in steps for MCTS.
  samples: number;  // Number of MCTS rollouts to do per action.
  ucb: number;  // UCB constant for exploration within the search tree.
  timeout?: number;  // Optional timeout (in seconds) for MCTS rollouts.

  // Environment properties.
  maxReward: number;
  minReward: number;
  numActions: number;
}

export class ExpectimaxTree {
  /* An MCTS planner. */

  // Stateful environment model.
  model: Model;

  // Search hyperparameters.
  horizon: number;
  samples: number;
  timeout?: number;
  ucb: number;

  // Planner state.
  sampled = false;
  totalSamples = 0;

  // 
  root: DecisionNode;
  rewardFn: RewardFn;

  // Metadata
  numActions: number;
  rewardRange: Reward;
  minReward: Reward;

  constructor(
    options: MCTSOptions,
    model: Model,
    utilityFn: UtilityFn,
    discountFn: DiscountFn,
    t = 0
  ) {

    // MCTS options.
    this.model = model;
    this.horizon = options.horizon;
    this.ucb = options.ucb;
    this.samples = options.samples;
    this.timeout = options.timeout;

    // Environment metadata.
    this.rewardRange = options.maxReward - options.minReward;
    this.numActions = options.numActions;
    this.minReward = options.minReward;

    // Agent reward function.
    this.rewardFn = (e: Percept, dfr: Integer, t?: Integer) => discountFn(dfr, t) * utilityFn(e);

    this.root = this.reset();
  }

  getValueEstimate(): number {
    if (!this.sampled) {
      this.model.save();
      if (this.timeout) {
        // time budget
        const t0 = performance.now();
        let n = 0;
        while (performance.now() - t0 < this.timeout) {
          this.sample1(this.root, 0);
          this.model.load();
          n++;
        }
        this.totalSamples += n;
      } else {
        // sample budget
        for (let iter = 0; iter < this.samples; iter++) {
          this.sample1(this.root, 0);
          this.model.load();
        }
      }

      this.sampled = true;
    }

    return (this.root.mean / this.horizon - this.minReward) / this.rewardRange;
  }

  bestAction() {
    this.getValueEstimate();

    const values = [];
    for (const a of this.root.children.keys()) {
      const child = this.root.getChild(a);
      values.push(child ? child.mean : 0);
    }
    
    const accessor = (n: DecisionNode, a: Action) => {
      const child = n.getChild(a);
      return child ? child.mean : 0;
    };
    return util.argmax(this.root, accessor, this.numActions);
  }

  reset(): DecisionNode {
    const root = new DecisionNode(this.numActions, this.rewardRange, undefined);
    this.sampled = false;
    return root;
  }

  prune(a: Action, e: Percept): void {
    const cn = this.root.getChild(a);
    if (!cn) {
      this.reset();
      return;
    }

    const root = cn.getChild(e);
    if (!root) {
      this.reset();
      return;
    }
    this.root = root;

    this.sampled = false;
  }

  private rollout(horizon: number, dfr: number): Reward {
    // Performs a rollout with a random policy up to some horizon.
    let reward = 0;
    for (let i = dfr; i <= horizon; i++) {
      const action = Math.floor(Math.random() * this.numActions);
      this.model.perform(action);
      const e = this.model.generatePercept();
      this.model.update(action, e);
      reward += this.rewardFn(e, i);
    }

    return reward;
  }


  private selectAction(node: DecisionNode, dfr: number): Action {
    let a;
    if (node.nChildren !== this.numActions) {
      a = node.actionSet[node.nChildren];
      node.addChild(a);
      node.nChildren++;
    } else {
      let max = Number.NEGATIVE_INFINITY;
      for (let action = 0, A = this.numActions; action < A; action++) {
        const child = node.getChild(action);
        const normalization = (this.horizon - dfr + 1) * this.rewardRange;
        const value =
          child.mean / normalization +
          this.ucb * Math.sqrt(Math.log2(node.visits) / child.visits);
        if (value > max) {
          max = value;
          a = action;
        }
      }
    }
    util.assert(a !== undefined);

    return a as Action;
  }

  private sample1(node: DecisionNode, dfr: number): Reward {
    let reward = 0;
    if (dfr > this.horizon) {
      return 0;
    }
    if (node.visits === 0) {
      reward = this.rollout(this.horizon, dfr);
    } else {
      const action = this.selectAction(node, dfr);
      reward = this.sample2(node.getChild(action), dfr);
    }

    node.mean = (1 / (node.visits + 1)) * (reward + node.visits * node.mean);
    node.visits++;
    return reward;
  }

  private sample2(node: ChanceNode, dfr: number): Reward {
    let reward = 0;
    if (dfr > this.horizon) {
      return reward;
    } else {
      this.model.perform(node.action);
      const e = this.model.generatePercept();
      this.model.update(node.action, e);
      if (!node.getChild(e)) {
        node.addChild(e);
      }

      reward = this.rewardFn(e, dfr) + this.sample1(node.getChild(e) as DecisionNode, dfr + 1);
    }

    node.mean = (1 / (node.visits + 1)) * (reward + node.visits * node.mean);
    node.visits++;
    return reward;
  }
}

class DecisionNode {
  /* A decision node for MCTS. */

  visits: number;  // Visit count.
  mean: number;  // Mean value.
  e?: Percept;
  children: ChanceNode[]; // Child nodes.
  nChildren: number;
  numActions: number;
  rewardRange: number;

  actionSet: Action[];

  constructor(numActions: number, rewardRange: number, e?: Percept) {
    this.visits = 0;
    this.mean = 0;
    this.e = e;
    this.children = new Array(numActions);
    this.nChildren = 0;
    this.actionSet = util.randInts(numActions);
    this.numActions = numActions;
    this.rewardRange = rewardRange;
  }

  addChild(a: Action) {
    this.children[a] = new ChanceNode(this.numActions, this.rewardRange, a);
  }

  getChild(a: Action): ChanceNode {
    return this.children[a];
  }

}

class ChanceNode {
  /* A chance node for MCTS. */

  visits: number;  // Visit count.
  mean: number;  // Mean value.
  action: Action;   // The action taken to get here.
  children: Map<Action, DecisionNode>;
  rewardRange: number;
  numActions: number;

  constructor(numActions: number, rewardRange: number, action: Action) {
    this.visits = 0;
    this.mean = 0;
    this.children = new Map();
    this.action = action;
    this.numActions = numActions;
    this.rewardRange = rewardRange;
  }

  addChild(e: Percept): void {
    const key = e.obs * this.rewardRange + e.rew;
    const node = new DecisionNode(this.numActions, this.rewardRange, e);
    this.children.set(key, node);
  }

  getChild(e: Percept): DecisionNode | undefined {
    const key = e.obs * this.rewardRange + e.rew;
    return this.children.get(key);
  }
}
