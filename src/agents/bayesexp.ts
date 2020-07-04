import { Percept, Action, DiscountFn } from "../types";
import { Agent } from "./base";
import { Model } from "../models/base";
import { KullbackLeiblerKSA } from "./ksa";
import { BayesAgent } from "./bayes";
import { MCTSOptions } from "../planners/mcts";



export class BayesExp implements Agent {
	/* The BayesExp agent. */
	// TODO(aslanides): Add more info.

	// This agent is composed of two sub-agents, the RL and IG agents.
	rewardAgent: BayesAgent
	infoGainAgent: KullbackLeiblerKSA

	// Agent state
	explore: boolean // Whether to switch to exploration mode.
	t = 0  // Lifetime.

	// Hyperparameters
	epsilon: number // Exploration rate.
	horizon: number;


	constructor(options: MCTSOptions,
		model: Model,
		epsilon: number,
		horizon: number,
		discountFn: DiscountFn) {
		this.explore = false;
		this.epsilon = epsilon;
		this.horizon = horizon;
		const utilityFn = (e: Percept) => e.rew
		this.rewardAgent = new BayesAgent(options, model, utilityFn, discountFn);
		this.infoGainAgent = new KullbackLeiblerKSA(options, model, discountFn);
	}

	selectAction(e: Percept) {
		if (this.t % this.horizon === 0) {
			const value = this.infoGainAgent.planner.getValueEstimate();
			this.explore = value > this.epsilon;
		}

		if (this.explore) {
			return this.infoGainAgent.selectAction(e);
		}

		return this.rewardAgent.selectAction(e);
	}

	update(a: Action, e: Percept) {
		this.rewardAgent.update(a, e);
	}

	info() { return {} }
}
