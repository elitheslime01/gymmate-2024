class BSTNode {
    constructor(student) {
        this.student = student;
        this.left = null;
        this.right = null;
    }
}

class PriorityBST {
    constructor() {
        this.root = null;
        this.size = 0;
    }

    insert(student) {
        const startTime = performance.now();
        if (!this.root) {
            this.root = new BSTNode(student);
        } else {
            this._insert(this.root, student);
        }
        this.size++;
        return performance.now() - startTime;
    }

    _insert(node, student) {
        if (this._compareStudents(student, node.student) < 0) {
            if (!node.left) {
                node.left = new BSTNode(student);
            } else {
                this._insert(node.left, student);
            }
        } else {
            node.right = this._insert(node.right, student);
        }

        node.height = 1 + Math.max(
            this._getHeight(node.left),
            this._getHeight(node.right)
        );

        return this._balance(node);
    }

    extractMax() {
        const startTime = performance.now();
        
        if (!this.root) {
            return {
                time: performance.now() - startTime,
                result: null
            };
        }

        // Find the rightmost node (max value)
        let current = this.root;
        let parent = null;
        
        while (current.right) {
            parent = current;
            current = current.right;
        }

        // Store the max value
        const maxStudent = current.student;

        // Remove the node
        if (!parent) {
            // Root is the max
            this.root = current.left;
        } else {
            parent.right = current.left;
        }

        this.size--;

        return {
            time: performance.now() - startTime,
            result: maxStudent
        };
    }

    // Add the missing comparison method
    _compareStudents(studentA, studentB) {
        if (studentA._priorityScore !== studentB._priorityScore) {
            return studentB._priorityScore - studentA._priorityScore;
        }
        
        const timeA = new Date(studentA._queuedAt).getTime();
        const timeB = new Date(studentB._queuedAt).getTime();
        return timeA - timeB;
    }
}

export default PriorityBST;