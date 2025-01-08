// maxHeap.js
class MaxHeap {
    constructor() {
        this.heap = [];
    }

    // Insert a new element into the max heap
    insert(element) {
        this.heap.push(element);
        this.heapifyUp(this.heap.length - 1);
    }

    // Extract the maximum element from the max heap
    extractMax() {
        if (this.heap.length === 0) {
            return null;
        }

        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const max = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown(0);
        return max;
    }

    // Heapify up to maintain the max heap property
    heapifyUp(index) {
        if (index <= 0) {
            return;
        }

        const parentIndex = Math.floor((index - 1) / 2);
        if (this.heap[parentIndex]._priorityScore < this.heap[index]._priorityScore) {
            this.swap(parentIndex, index);
            this.heapifyUp(parentIndex);
        }
    }

    // Heapify down to maintain the max heap property
    heapifyDown(index) {
        const leftChildIndex = 2 * index + 1;
        const rightChildIndex = 2 * index + 2;
        let largestIndex = index;

        if (leftChildIndex < this.heap.length && this.heap[leftChildIndex]._priorityScore > this.heap[largestIndex]._priorityScore) {
            largestIndex = leftChildIndex;
        }

        if (rightChildIndex < this.heap.length && this.heap[rightChildIndex]._priorityScore > this.heap[largestIndex]._priorityScore) {
            largestIndex = rightChildIndex;
        }

        if (largestIndex !== index) {
            this.swap(largestIndex, index);
            this.heapifyDown(largestIndex);
        }
    }

    // Swap two elements in the heap
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    // Get the size of the heap
    size() {
        return this.heap.length;
    }
}

export default MaxHeap;