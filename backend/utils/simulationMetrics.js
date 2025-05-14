class SimulationMetrics {
    constructor() {
        // Time metrics for different operations
        this.insertionTime = 0;
        this.extractionTime = 0;
        this.searchTime = 0;

        // Memory tracking
        this.memoryUsage = 0;
        
        // Operation counters
        this.operationCounts = {
            insertion: 0,
            extraction: 0,
            search: 0
        };

        // Performance stability score
        this.stabilityScore = 0;

        // Capture initial memory state
        this.initialMemoryUsage = process.memoryUsage().heapUsed;
    }

    recordOperation(type, time) {
        if (!['insertion', 'extraction', 'search'].includes(type)) {
            throw new Error(`Invalid operation type: ${type}`);
        }

        // Record operation time
        this[`${type}Time`] += time;
        this.operationCounts[type]++;

        // Update memory usage
        this.updateMemoryUsage();
    }

    updateMemoryUsage() {
        const currentMemory = process.memoryUsage().heapUsed;
        this.memoryUsage = currentMemory - this.initialMemoryUsage;
    }

    getAverageTime(operation) {
        if (this.operationCounts[operation] === 0) {
            return 0;
        }
        return this[`${operation}Time`] / this.operationCounts[operation];
    }

    calculateStabilityScore() {
        const times = [
            this.getAverageTime('insertion'),
            this.getAverageTime('extraction'),
            this.getAverageTime('search')
        ].filter(time => time > 0);

        if (times.length === 0) {
            this.stabilityScore = 0;
            return;
        }

        // Calculate mean
        const mean = times.reduce((sum, time) => sum + time, 0) / times.length;

        // Calculate variance
        const variance = times.reduce((sum, time) => {
            const diff = time - mean;
            return sum + (diff * diff);
        }, 0) / times.length;

        // Convert variance to stability score (inverse relationship)
        // Lower variance means higher stability
        this.stabilityScore = 1 / (1 + Math.sqrt(variance));
    }

    getMetricsReport() {
        return {
            averageTimes: {
                insertion: this.getAverageTime('insertion').toFixed(3),
                extraction: this.getAverageTime('extraction').toFixed(3),
                search: this.getAverageTime('search').toFixed(3)
            },
            operationCounts: { ...this.operationCounts },
            memoryUsage: (this.memoryUsage / 1024 / 1024).toFixed(2) + ' MB',
            stabilityScore: this.stabilityScore.toFixed(4)
        };
    }

    reset() {
        this.insertionTime = 0;
        this.extractionTime = 0;
        this.searchTime = 0;
        this.memoryUsage = 0;
        this.operationCounts = {
            insertion: 0,
            extraction: 0,
            search: 0
        };
        this.stabilityScore = 0;
        this.initialMemoryUsage = process.memoryUsage().heapUsed;
    }
}

export { SimulationMetrics };