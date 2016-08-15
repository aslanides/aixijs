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
		let s = 0;
		let n = arr.length;
		for (let i = 0; i < n; i++) {
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
		let s = Math.random();
		let p = 0;
		for (let i = 0; i < weights.length; i++) {
			if (s <= p) {
				return i - 1;
			}

			p += weights[i];
		}

		return weights.length - 1;
	}

	static KLDivergence(p, q) {
		Util.assert(p.length == q.length);
		let sp = Util.sum(p);
		let sq = Util.sum(q);
		let s = 0;
		for (let i = 0; i < p.length; i++) {
			if (p[i] == 0 || q[i] == 0) {
				continue;
			}

			s += (p[i] / sp) * Math.log2(p[i] * sq / (q[i] * sp));
		}

		return s;
	}

	static entropy(p) {
		let s = 0;
		let n = p.length;
		for (let i = 0; i < n; i++) {
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

	static encode(symlist, value, bits) {
		let tmp = value;
		for (let i = 0; i < bits; i++, tmp /= 2) {
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
}

class QTable {
	constructor(optimistic, numActions) {
		this.map = new Map();
		this.optimistic = optimistic;
		this.numActions = numActions;
	}

	get(obs, action) {
		let val = this.map.get(obs * this.numActions + action);
		if (!val) {
			return this.optimistic ? 10 : 0; // TODO fix magic number
		}

		return val;
	}

	set(obs, action, value) {
		this.map.set(obs * this.numActions + action, value);
	}

	copy() {
		let res = new QTable();
		for (let [key, value] of this.map) {
			res.map.set(key, value);
		}

		return res;
	}
}
