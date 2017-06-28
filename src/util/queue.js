class Queue {
	constructor() {
		this.arr = [];
		this.N = 0;
		this.pos = 0;
	}

	isempty() {
		return this.pos == this.N;
	}

	append(item) {
		if (this.N == this.arr.length) {
			this.arr.push(item);
		} else {
			this.arr[this.N - 1] = item;
		}

		this.N++;
	}

	remove() {
		if (this.isempty()) {
			throw 'Attempted to dequeue from empty queue!';
		}
		var val = this.arr[this.pos];
		this.pos++;
		if (this.pos * 2 >= this.N) {
			this.arr = this.arr.slice(this.pos);
			this.N -= this.pos;
			this.pos = 0;
		}
		return val;
	}

	peek() {
		return this.arr[this.pos];
	}

	peek_back() {
		return this.arr[this.N - 1];
	}

	pop_back() {
		var val = this.arr[this.N - 1];
		this.N--;
		return val;
	}
}
