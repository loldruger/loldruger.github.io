//@ts-check

// --- Worker Script (worker.js) ---

// Import DOMComposer using ES Module syntax
// Adjust the path './DOMinator/DOMComposer.js' if needed relative to worker.js
import DOMComposer from './DOMinator/DOMComposer.js';

/**
 * Holds the reference to the imported DOMComposer class.
 * We assign the imported class directly.
 * @type {typeof DOMComposer | null}
 */
let DOMComposerClass = null;

// Check if the import was successful (basic check)
if (typeof DOMComposer !== 'undefined') {
    DOMComposerClass = DOMComposer;
    console.log('Worker: DOMComposer module loaded successfully.');
} else {
    // This state should ideally not be reached if the import path is correct
    // and DOMComposer.js exports the class correctly.
    // Module loading errors are typically caught earlier by the browser/WorkerPool's onerror.
    console.error('Worker: DOMComposer class is undefined after import. Check export or path.');
    // Send a fatal error message back.
    self.postMessage({ error: 'Worker initialization failed: DOMComposer module could not be loaded.', index: -1 });
    // Terminate the worker as it cannot function.
    self.close();
}


/**
 * Handles incoming messages from the main thread.
 * Expects data in the format: { index: number, composerJson: string }
 * Sends back data in the format: { index: number, result: string } on success,
 * or { index: number, error: string } on failure.
 * @param {MessageEvent<any>} event
 */
self.onmessage = (event) => {
    // Check if DOMComposer class was loaded successfully during initialization.
    // This check remains useful in case the initial load somehow failed silently,
    // though typically module load errors would prevent the worker from running.
    if (!DOMComposerClass) {
        self.postMessage({ error: 'Worker not properly initialized (DOMComposer missing).', index: event.data?.index ?? -1 });
        return;
    }

    // --- Runtime checks for data integrity crossing the worker boundary (Keep Recommended) ---
    const taskData = event.data;
    const taskIndex = taskData?.index;

    if (!taskData || typeof taskIndex !== 'number' || typeof taskData.composerJson !== 'string') {
        console.error('Worker: Invalid task data received:', taskData);
        self.postMessage({ error: 'Invalid task data format received.', index: (typeof taskIndex === 'number' ? taskIndex : -1) });
        return;
    }
    // --- End of runtime checks ---

    const { composerJson } = taskData;

    try {
        // 1. Parse the JSON string.
        const parsedJson = JSON.parse(composerJson);

        // 2. Reconstruct the DOMComposer instance using the static fromJSON method.
        // Use the directly assigned DOMComposerClass.
        const composerInstance = DOMComposerClass.fromJSON(parsedJson);

        // 3. Generate the HTML string using the iterative method.
        const htmlString = composerInstance.toHTMLString();

        // 4. Send the successful result back.
        self.postMessage({
            index: taskIndex,
            result: htmlString
        });

    } catch (error) {
        // 5. Handle errors during processing.
        console.error(`Worker error processing task ${taskIndex}:`, error);
        self.postMessage({
            index: taskIndex,
            error: `Worker processing failed: ${error instanceof Error ? error.message : String(error)}`
        });
    }
};

// Signal that the worker script itself has loaded and initialized (as a module).
console.log('Worker script initialized (as module) and waiting for tasks.');