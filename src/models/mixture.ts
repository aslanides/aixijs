import { assert, sum, sample, entropy } from "../utils/util";
import { Model } from "./base";
import { Percept, Action } from "../types";
import { Environment } from "../environments/base";

export class BayesMixture implements Model {
	/* A Bayesian mixture model. */

	modelClass: Model[];
	weights: number[];  // The relative weights over the model/hypothesis class.
	savedWeights: number[]; // For checkpointing.
	C: number; // The size of the hypothesis class.

	numActions: number;

	constructor(modelClass: Model[], weights: number[]) {
		this.modelClass = [...modelClass];
		this.weights = [...weights];
		this.numActions = modelClass[0].numActions;

		this.savedWeights = [];
		this.C = modelClass.length;
		
		assert(Math.abs(sum(weights) - 1) < 1e-4, 'Prior is not normalised!');
	}

	conditionalDistribution(e: Percept): number {
		let s = 0;
		for (let i = 0, C = this.C; i < C; i++) {
			if (this.weights[i] === 0) {
				continue;
			}

			s += this.weights[i] * this.modelClass[i].conditionalDistribution(e);
		}

		assert(s !== 0, `Cromwell violation: xi(${e.obs},${e.rew}) = 0`);
		return s;
	}

	update(a: Action, e: Percept) {
		/* TODO(aslanides): docstring. */

		let xi = 0;
		for (let i = 0, C = this.C; i < C; i++) {
			if (this.weights[i] === 0) {
				continue;
			}
			this.modelClass[i].update(a, e);
			
			// Compute posterior.
			this.weights[i] = this.weights[i] * this.modelClass[i].conditionalDistribution(e);
			xi += this.weights[i];
		}

		assert(xi !== 0, `Cromwell violation: xi(${e.obs},${e.rew}) = 0`);

		// Normalise.
		for (let j = 0; j < this.C; j++) {
			this.weights[j] /= xi;
		}
	}

	perform(a: Action) {
		for (let i = 0, C = this.C; i < C; i++) {
			if (this.weights[i] === 0) {
				continue;
			}

			this.modelClass[i].perform(a);
		}
	}

	generatePercept(): Percept {
		const nu = sample(this.weights);
		return this.modelClass[nu].generatePercept();
	}

	entropy() {
		return entropy(this.weights);
	}

	save() {
		this.savedWeights = [...this.weights];
		for (let i = 0, C = this.C; i < C; i++) {
			this.modelClass[i].save();
		}
	}

	load() {
		this.weights = [...this.savedWeights];
		for (let i = 0, C = this.C; i < C; i++) {
			this.modelClass[i].load();
		}
	}

	get(nu: number): Environment {
		return this.modelClass[nu];
	}

	infoGain(): number {
		return entropy(this.savedWeights) - entropy(this.weights);
	}

	info() {
		return {};
	}
}
