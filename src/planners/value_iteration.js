class ValueIteration {
	constructor(env, gamma) {
		let S = env.numStates;
		let A = env.numActions;
		let R = env.rewards;
		let P = env.transitions;
		let V = Util.zeros(S);
		let Q = [];
		for (let s = 0; s < S; s++) {
			Q.push(Util.zeros(A));
		}

		let N = 1000;

		for (let dfr = 0; dfr < N; dfr++) {
			for (let s = 0; s < S; s++) {
				for (let a = 0; a < A; a++) {
					let sum = 0;
					for (let s_ = 0; s_ < S; s_++) {
						sum += P[a][s][s_] * V[s_];
					}

					Q[s][a] = R[s][a] + gamma * sum;
				}
			}

			for (let s = 0; s < S; s++) {
				let max = Util.argmax(Q, (Q, a) => Q[s][a], A);
				V[s] = Q[s][max];
			}
		}

		return V;
	}
}
