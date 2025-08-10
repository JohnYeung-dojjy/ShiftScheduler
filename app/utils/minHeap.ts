export class MinHeap<T> {
  private heap: T[];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.heap = [];
    this.comparator = comparator;
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private leftChild(index: number): number {
    return 2 * index + 1;
  }

  private rightChild(index: number): number {
    return 2 * index + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private siftUp(index: number): void {
    while (
      index > 0 &&
      this.comparator(this.heap[index], this.heap[this.parent(index)]) < 0
    ) {
      this.swap(index, this.parent(index));
      index = this.parent(index);
    }
  }

  private siftDown(index: number): void {
    let smallest = index;
    const left = this.leftChild(index);
    const right = this.rightChild(index);

    if (
      left < this.heap.length &&
      this.comparator(this.heap[left], this.heap[smallest]) < 0
    ) {
      smallest = left;
    }

    if (
      right < this.heap.length &&
      this.comparator(this.heap[right], this.heap[smallest]) < 0
    ) {
      smallest = right;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this.siftDown(smallest);
    }
  }

  public insert(value: T): void {
    this.heap.push(value);
    this.siftUp(this.heap.length - 1);
  }

  public extractMin(): T {
    if (this.isEmpty()) {
      throw new Error("Heap is empty");
    }

    const min = this.heap[0];
    const end = this.heap.pop();

    if (this.heap.length > 0 && end !== undefined) {
      this.heap[0] = end;
      this.siftDown(0);
    }

    return min;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }
}
