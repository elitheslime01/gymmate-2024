// maxHeap.js
class MaxHeap {
    constructor() {
        this.heap= [];
    }

    // Insert a new element into the max heap
    insert(element) {
        if (!element._priorityScore && element._priorityScore !== 0) {
            throw new Error('Element must have a _priorityScore property');
        }
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
        if (index <= 0) return;
        
        const parentIndex = Math.floor((index - 1) / 2);
        if (this.shouldSwap(parentIndex, index)) {
            this.swap(parentIndex, index);
            this.heapifyUp(parentIndex);
        }
    }

    // Heapify down to maintain the max heap property
    heapifyDown(index) {
        const leftChildIndex = 2 * index + 1;
        const rightChildIndex = 2 * index + 2;
        let highestPriorityIndex = index;

        if (leftChildIndex < this.heap.length && this.shouldSwap(highestPriorityIndex, leftChildIndex)) {
            highestPriorityIndex = leftChildIndex;
        }

        if (rightChildIndex < this.heap.length && this.shouldSwap(highestPriorityIndex, rightChildIndex)) {
            highestPriorityIndex = rightChildIndex;
        }

        if (highestPriorityIndex !== index) {
            this.swap(highestPriorityIndex, index);
            this.heapifyDown(highestPriorityIndex);
        }
    }

    shouldSwap(indexA, indexB) {
        const scoreA = this.heap[indexA]._priorityScore;
        const scoreB = this.heap[indexB]._priorityScore;
        
        if (scoreA !== scoreB) {
            return scoreB > scoreA;
        }
        
        // If priority scores are equal, compare queueing timestamps (FIFO: earlier queued wins)
        const timeA = new Date(this.heap[indexA]._queuedAt).getTime();
        const timeB = new Date(this.heap[indexB]._queuedAt).getTime();
        return timeB < timeA; // Swap when child queued earlier than parent
    }

    updatePriority(studentId, newScore) {
        const index = this.heap.findIndex(element => 
            element._studentId === studentId
        );
        if (index !== -1) {
            const oldScore = this.heap[index]._priorityScore;
            this.heap[index]._priorityScore = newScore;
            if (newScore > oldScore) {
                this.heapifyUp(index);
            } else if (newScore < oldScore) {
                this.heapifyDown(index);
            }
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

    peek() {
        if (this.heap.length === 0) {
            return null;
        }
        return this.heap[0];
    }

}

export default MaxHeap;