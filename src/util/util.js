class Util {
	static zeros(n) {
		return new Float64Array(n);
	}

	static randomChoice(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	static assert(condition, message) {
		if (!condition) {
			message = message || 'Assertion failed';
			throw new Error(message);
		}
	}

	static sum(arr) {
		var s = 0;
		var n = arr.length;
		for (var i = 0; i < n; i++) {
			s += arr[i];
		}

		return s;
	}

	static prod(arr) {
		let p = 0;
		let n = arr.length;
		for (let i = 0; i < n; i++) {
			p *= arr[i];
		}

		return p;
	}

	static deepCopy(obj) {
		return jQuery.extend(true, {}, obj);
	}

	static arrayCopy(arr) {
		return jQuery.extend(true, [], arr);
	}

	static roundTo(x, figs) {
		let tmp = Math.pow(10, figs);
		return Math.round(x * tmp) / tmp;
	}

	static sample(weights) {
		var s = Math.random();
		var p = 0;
		for (var i = 0; i < weights.length; i++) {
			if (s <= p) {
				return i - 1;
			}

			p += weights[i];
		}

		return weights.length - 1;
	}

	static KLDivergence(p, q) {
		Util.assert(p.length == q.length, 'KL: p & q are different lengths');
		let n = p.length;
		let sp = Util.sum(p);
		let sq = Util.sum(q);
		let s = 0;
		for (let i = 0; i < n; i++) {
			if (p[i] == 0 || q[i] == 0) {
				continue;
			}

			s += (p[i] / sp) * Math.log2(p[i] * sq / (q[i] * sp));
		}

		return s;
	}

	static entropy(p) {
		var s = 0;
		var n = p.length;
		for (var i = 0; i < n; i++) {
			if (p[i] == 0) {
				continue;
			}

			s -= p[i] * Math.log2(p[i]);
		}

		return s;
	}

	static logProgress(t, T) {
		let prog = (t + 1) / T * 100;
		if (prog % 10 == 0) {
			console.clear();
			console.log(`Progress: ${prog}%`);
		}
	}

	static softMax(lst, j) {
		let s = 0;
		lst.forEach(x => {
			s += Math.pow(Math.E, x);
		});
		return Math.pow(Math.E, j) / s;
	}

	static randInts(n) {
		let arr = new Array(n);
		for (let i = 0; i < n; i++) {
			arr[i] = i;
		}

		let max = n - 1;
		let r;
		let swap;
		while (max > 0) {
			r = Math.floor(Math.random() * max);
			swap = arr[r];
			arr[r] = arr[max];
			arr[max] = swap;
			max--;
		}

		return arr;
	}

	static cumToInc(arr) {
		let T = arr.length;
		let inc = new Array(T);
		inc[0] = 0;
		for (let i = 1; i < T; i++) {
			inc[i] = arr[i] - arr[i - 1];
		}

		return inc;
	}

	static sigmoid(x) {
		return 1.0 / (1 + Math.exp(-x));
	}

	static encode(symlist, value, bits) {
		var tmp = value;
		for (var i = 0; i < bits; i++ , tmp /= 2) {
			symlist.push(tmp & 1);
		}
	}

	static decode(symlist, bits) {
		let value = 0;
		let n = symlist.length;
		for (let i = 0; i < bits; i++) {
			value = symlist[n - i - 1] + 2 * value;
		}

		return value;
	}

	static I(a, b) {
		// indicator fn
		return a == b ? 1 : 0;
	}

	static gaussRandom(retval, val) {
		if (!val) {
			val = 0;
		}

		if (retval) {
			retval = false;
			return val;
		}

		let u = 2 * Math.random() - 1;
		let v = 2 * Math.random() - 1;
		let r = u * u + v * v;
		if (r == 0 || r > 1) return Util.gaussRandom();
		let c = Math.sqrt(-2 * Math.log(r) / r);
		val = v * c; // cache this
		retval = true;
		return u * c;
	}

	static randi(a, b) {
		return Math.floor(Math.random() * (b - a)) + a;
	}

	static randf(a, b) {
		return Math.random() * (b - a) + a;
	}

	static randn(mu, std) {
		return mu + Util.gaussRandom() * std;
	}

	static argmax(obj, accessor, numActions) {
		let max = Number.NEGATIVE_INFINITY;
		let ties = [];
		for (let a = 0; a < numActions; a++) {
			let val = accessor(obj, a);
			if (val < max) {
				continue;
			} else if (val > max) {
				ties = [a];
				max = val;
			} else {
				ties.push(a);
			}
		}

		return Util.randomChoice(ties);
	}

	static argsoftmax(obj, accessor, numActions, beta = 2) {
		let sumexp = 0;
		let vals = [];
		for (let a = 0; a < numActions; a++) {
			let val = Math.exp(beta * accessor(obj, a));
			vals.push(val);
			sumexp += val;
		}
		for (let a = 0; a < numActions; a++) {
			vals[a] = vals[a] / sumexp;
		}
		let a = Util.sample(vals);
		return a;
	}
}
