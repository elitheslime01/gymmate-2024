import MaxHeap from '../utils/maxHeap.js';
import PriorityBST from '../utils/priorityBST.js';
import { SimulationMetrics } from '../utils/simulationMetrics.js';

export class SimulationRunner {
    static generateTestData(size) {
        return Array.from({ length: size }, (_, index) => ({
            _studentId: `student${index}`,
            _priorityScore: Math.floor(Math.random() * 100),
            _queuedAt: new Date(Date.now() - Math.random() * 86400000)
        }));
    }

    static async runComparison(dataSize = 1000, operations = 100) {
        try {
            const testData = this.generateTestData(dataSize);
            const heapMetrics = new SimulationMetrics();
            const bstMetrics = new SimulationMetrics();

            // Initialize data structures
            const maxHeap = new MaxHeap();
            const bst = new PriorityBST();

            // Measure initial memory
            const initialMemory = process.memoryUsage().heapUsed;

            // Test insertions
            console.log(`\nTesting insertions with ${dataSize} elements...`);
            for (const student of testData) {
                try {
                    const heapTime = maxHeap.insert(student);
                    const bstTime = bst.insert(student);

                    heapMetrics.recordOperation('insertion', heapTime);
                    bstMetrics.recordOperation('insertion', bstTime);
                } catch (error) {
                    console.error('Error during insertion:', error);
                }
            }

            // Test extractions
            console.log(`Testing ${operations} extractions...`);
            for (let i = 0; i < operations; i++) {
                try {
                    const heapResult = maxHeap.extractMax();
                    const bstResult = bst.extractMax();

                    heapMetrics.recordOperation('extraction', heapResult.time);
                    bstMetrics.recordOperation('extraction', bstResult.time);
                } catch (error) {
                    console.error('Error during extraction:', error);
                }
            }

            // Test searches
            console.log(`Testing ${operations} searches...`);
            const searchValues = Array.from(
                { length: operations },
                () => Math.floor(Math.random() * 100)
            );

            for (const priority of searchValues) {
                try {
                    const heapResult = maxHeap.search(priority);
                    const bstResult = bst.search(priority);

                    heapMetrics.recordOperation('search', heapResult.time);
                    bstMetrics.recordOperation('search', bstResult.time);
                } catch (error) {
                    console.error('Error during search:', error);
                }
            }

            // Calculate memory usage
            const finalMemory = process.memoryUsage().heapUsed;
            heapMetrics.memoryUsage = (finalMemory - initialMemory) / 2;
            bstMetrics.memoryUsage = (finalMemory - initialMemory) / 2;

            // Calculate final metrics
            heapMetrics.calculateStabilityScore();
            bstMetrics.calculateStabilityScore();

            return {
                dataSize,
                operations,
                heap: {
                    insertionTime: heapMetrics.getAverageTime('insertion'),
                    extractionTime: heapMetrics.getAverageTime('extraction'),
                    searchTime: heapMetrics.getAverageTime('search'),
                    memoryUsage: heapMetrics.memoryUsage,
                    stabilityScore: heapMetrics.stabilityScore,
                    operationCounts: heapMetrics.operationCounts
                },
                bst: {
                    insertionTime: bstMetrics.getAverageTime('insertion'),
                    extractionTime: bstMetrics.getAverageTime('extraction'),
                    searchTime: bstMetrics.getAverageTime('search'),
                    memoryUsage: bstMetrics.memoryUsage,
                    stabilityScore: bstMetrics.stabilityScore,
                    operationCounts: bstMetrics.operationCounts
                }
            };
        } catch (error) {
            console.error('Simulation failed:', error);
            throw error;
        }
    }
}