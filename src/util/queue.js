class Queue {
  constructor() {
    this.arr = []
    this.N = 0
    this.pos = 0
  }

  isempty() {
    return this.pos == this.N
  }

  append(item) {
    this.arr.push(item)
    this.N++
  }

  remove() {
    if (this.isempty()) {
      throw "Attempted to dequeue from empty queue!"
    }
    var val = this.arr[this.pos]
    this.pos++
    if (this.pos * 2 >= this.N) {
      this.arr = this.arr.slice(this.pos)
      this.N -= this.pos
      this.pos = 0
    }
    return val
  }
}
