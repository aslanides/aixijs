class ValueIteration {
	constructor(env, gamma) {
		var S = env.numStates;
		var A = env.numActions;
		var R = env.rewards;
		var P = env.transitions;
		var V = Util.zeros(S);
		var Q = [];
		for (var s = 0; s < S; s++) {
			Q.push(Util.zeros(A));
		}

		var N = 1000;

		for (var dfr = 0; dfr < N; dfr++) {
			for (var s = 0; s < S; s++) {
				for (var a = 0; a < A; a++) {
					var sum = 0;
					for (var s_ = 0; s_ < S; s_++) {
						sum += P[a][s][s_] * V[s_];
					}

					Q[s][a] = R[s][a] + gamma * sum;
				}
			}

			for (var s = 0; s < S; s++) {
				var max = Util.argmax(Q, (Q, a) => Q[s][a], A);
				V[s] = Q[s][max];
			}
		}

		return V;
	}
}
