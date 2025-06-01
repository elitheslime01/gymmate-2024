class BSTNode {
    constructor(student) {
        this.student = student;
        this.left = null;
        this.right = null;
        // Remove height property since no balancing needed
    }
}

class PriorityBST {
    constructor() {
        this.root = null;
        this.size = 0;
    }

    insert(student) {
        const startTime = performance.now();
        this.root = this._insert(this.root, student);
        this.size++;
        return performance.now() - startTime;
    }

    _insert(node, student) {
        if (!node) {
            return new BSTNode(student);
        }

        if (this._compareStudents(student, node.student) < 0) {
            node.left = this._insert(node.left, student);
        } else {
            node.right = this._insert(node.right, student);
        }

        return node; // Simply return the node without balancing
    }

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