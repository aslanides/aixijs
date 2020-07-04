export class Queue<T> {
	/* A simple generic queue. */

	arr: T[];
	N: number;
	pos: number;

	constructor() {
		this.arr = [];
		this.N = 0;
		this.pos = 0;
	}

	isempty(): boolean {
		return this.pos === this.N;
	}

	append(item: T) {
		if (this.N === this.arr.length) {
			this.arr.push(item);
		} else {
			this.arr[this.N - 1] = item;
		}

		this.N++;
	}

	remove(): T {
		if (this.isempty()) {
			throw Error('Attempted to dequeue from empty queue!');
		}
		const val = this.arr[this.pos];
		this.pos++;
		if (this.pos * 2 >= this.N) {
			this.arr = this.arr.slice(this.pos);
			this.N -= this.pos;
			this.pos = 0;
		}
		return val;
	}

	peek(): T {
		return this.arr[this.pos];
	}

	peek_back(): T {
		return this.arr[this.N - 1];
	}

	pop_back(): T {
		const val = this.arr[this.N - 1];
		this.N--;
		return val;
	}
}
