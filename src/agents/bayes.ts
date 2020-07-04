import {Agent} from "./base";
import { Model } from "../models/base";
import { Action, Percept, Reward, UtilityFn , DiscountFn} from "../types";
import { ExpectimaxTree, MCTSOptions } from "../utils/mcts";


export class BayesAgent implements Agent {
	/* A Bayesian model-based reinforcement learner. */

	// Agent state
	model: Model;
	planner: ExpectimaxTree;
	lastAction?: Action;

	// Stuff for logging DO NOT SUBMIT without fixing up.
	informationGain: number;

	constructor(options: MCTSOptions,
						  model: Model,
						  utilityFn: UtilityFn,
						  discountFn: DiscountFn) {

		// TODO assert options OK
		this.informationGain = 0;
		this.model = model;
		this.planner = new ExpectimaxTree(options, model, utilityFn, discountFn);
	}

	update(a: Action, e: Percept) {
		this.model.save();
		this.model.update(a, e);
		this.informationGain = this.model.infoGain();
	}

	selectAction(e: Percept): Action {
		if (this.informationGain) {
			// TODO(aslanides): explain why this is necessary.
			this.planner.reset();
		} else {
			this.planner.prune(this.lastAction as Action, e);
		}

		const a = this.planner.bestAction();
		this.lastAction = a;

		return a;
	}

	info(): object {
		// TODO(aslanides): DO NOT SUBMIT without fixing this.
		return {};
	}
}
