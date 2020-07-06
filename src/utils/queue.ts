export class Queue<T> {
  /* A simple generic queue. */

  private arr: T[];
  private N: number;
  private pos: number;

  constructor() {
    // TODO(aslanides): Implement max size.
    this.arr = [];
    this.N = 0;
    this.pos = 0;
  }

  empty(): boolean {
    return this.pos === this.N;
  }

  push(item: T) {
    if (this.N === this.arr.length) {
      this.arr.push(item);
    } else {
      this.arr[this.N - 1] = item;
    }

    this.N++;
  }

  pop(): T {
    if (this.empty()) {
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

  peekBack(): T {
    return this.arr[this.N - 1];
  }

  popBack(): T {
    const val = this.arr[this.N - 1];
    this.N--;
    return val;
  }
}
