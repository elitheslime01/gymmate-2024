import { SimulationRunner } from './simulationRunner.js';

async function runSimulationSuite() {
    const dataSizes = [100, 1000, 10000];
    const operationsPerSize = [50, 100, 200];
    const results = [];

    for (let i = 0; i < dataSizes.length; i++) {
        console.log(`Running simulation set ${i + 1}/${dataSizes.length}...`);
        const result = await SimulationRunner.runComparison(dataSizes[i], operationsPerSize[i]);
        results.push(result);
    }

    // Print results in formatted table
    console.table(results.map(r => ({
        'Data Size': r.dataSize,
        'Operations': r.operations,
        'Heap Insert (ms)': r.heap.insertionTime.toFixed(3),
        'BST Insert (ms)': r.bst.insertionTime.toFixed(3),
        'Heap Extract (ms)': r.heap.extractionTime.toFixed(3),
        'BST Extract (ms)': r.bst.extractionTime.toFixed(3),
        'Heap Search (ms)': r.heap.searchTime.toFixed(3),
        'BST Search (ms)': r.bst.searchTime.toFixed(3),
        'Heap Stability': r.heap.stabilityScore.toFixed(4),
        'BST Stability': r.bst.stabilityScore.toFixed(4)
    })));
}

// Run simulation
runSimulationSuite().catch(console.error);