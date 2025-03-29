//@ts-check

// --- Main Application Logic (main.js) ---

import DOMComposer from './DOMinator/DOMComposer.js';
import WorkerPool from './DOMinator/WorkerPool.js';
import { eventRegistry } from './DOMinator/EventRegistry.js';
import { Fetcher, i18n } from './i18n/lib.js'; // Import i18n for localization
import { getResume, events } from './const.js';
/**
 * @typedef {import('./DOMinator/DOMComposer.js').HtmlEventName} HtmlEventName
 * @typedef {import('./DOMinator/EventRegistry.js').EventHandler} EventHandler
 * @typedef {import('./DOMinator/WorkerPool.js').WorkerResult} WorkerResult
 * @typedef {import('./DOMinator/WorkerPool.js').WorkerTask} WorkerTask
 */


// --- Core Functions ---

/**
 * Attaches delegated event listeners to a container element based on data-event-* attributes.
 * @param {HTMLElement} container - The container element to attach listeners to.
 * @param {import('./DOMinator/EventRegistry.js').eventRegistry} registry - The registry containing event handlers.
 * @returns {void}
 */
function attachEventListeners(container, registry) {
    console.log('Attaching event listeners...');
    /** @type {Set<HtmlEventName>} */
    const potentialEvents = new Set();
    // We cannot use '[data-event-*]'. Instead, we find all elements and check their attributes.

    // Select ALL elements within the container first.
    const allElements = container.querySelectorAll('*');

    // Iterate through all elements and check their attributes to find relevant event types.
    allElements.forEach(el => {
        // Check if the element is an HTMLElement (it should be from querySelectorAll)
        if (!(el instanceof HTMLElement)) return;

        // Iterate through the element's attributes
        for (const attr of el.attributes) {
            if (attr.name.startsWith('data-event-')) {
                // Extract the event type (e.g., 'click', 'mouseover')
                const eventType = /** @type {HtmlEventName} */ (attr.name.substring('data-event-'.length));
                // Add the event type to our set if it's valid
                if (eventType) {
                    potentialEvents.add(eventType);
                }
            }
        }
    });

    // Now we have the set of actual event types used (potentialEvents).
    // Add one listener per discovered event type to the container for delegation.
    potentialEvents.forEach(eventType => {
        console.log(` - Adding delegate listener for: ${eventType}`);
        container.addEventListener(eventType, (event) => {
            const attributeName = `data-event-${eventType}`;
            // Find the closest ancestor (or self) that triggered this specific event type
            const targetElement = /** @type {HTMLElement | null} */ (event.target)?.closest(`[${attributeName}]`);

            // Runtime check: Ensure an element with the specific attribute was found
            if (targetElement) {
                const alias = targetElement.getAttribute(attributeName);
                // Runtime check: Ensure the alias exists
                if (alias) {
                    const handler = registry.getEventCallback(alias);
                    // Runtime check: Ensure a handler was found
                    if (handler) {
                        try {
                            handler(event); // Execute the handler
                        } catch (handlerError) {
                            console.error(`Error executing event handler for alias '<span class="math-inline">\{alias\}' on event '</span>{eventType}':`, handlerError);
                        }
                    }
                    // No 'else' needed here, getEventCallback logs a warning if not found
                } else {
                    console.warn(`Empty alias found for event '${eventType}' on element:`, targetElement);
                }
            }
            // If targetElement is null, the event occurred on an element without the data-event attribute,
            // or bubbled up from outside; the delegate listener correctly ignores it.
        });
    });
    console.log('Event listener attachment setup complete.');
}

/**
 * Renders a DOMComposer structure into a target HTML element using a worker pool for parallel processing.
 * @param {DOMComposer} rootComposer - The root DOMComposer instance (its children will be rendered in parallel).
 * @param {HTMLElement} targetElement - The HTML element where the result will be rendered.
 * @param {string} workerScriptPath - The path to the worker script ('worker.js').
 * @returns {Promise<void>} A promise that resolves when rendering and event listener attachment are complete, or rejects on critical error.
 */
function renderParallel(rootComposer, targetElement, workerScriptPath) {
    return new Promise((resolve, reject) => {
        console.log('Starting parallel rendering...');
        // Provide immediate feedback
        targetElement.classList.add('rendering-in-progress');
        targetElement.innerHTML = '';

        /** @type {WorkerPool | null} */
        let pool = null;
        const workerCount = navigator.hardwareConcurrency > 4 ? 4 : 2; // Use available cores or default to 2

        // Keep try-catch for WorkerPool creation as it involves external resources (workers)
        try {
            pool = new WorkerPool(workerCount, workerScriptPath);
        } catch (error) {
            console.error('Failed to create WorkerPool:', error);
            targetElement.innerHTML = `<div style="color: red;">Error: Could not initialize worker pool. ${escapeHtml(/** @type {Error}*/(error).message)}</div>`;
            targetElement.classList.remove('rendering-in-progress');
            reject(error); // Reject the promise
            return;
        }

        // Get children to be rendered in parallel
        // Assumes getChildren() returns DOMComposer[] based on JSDoc
        const tasks = rootComposer.getChildren();
        const totalTasks = tasks.length;
        /** @type {Array<string>} */
        const results = new Array(totalTasks).fill(''); // Initialize results array
        let completedTasks = 0;
        let hasCriticalError = false;

        console.log(`Distributing ${totalTasks} tasks to ${workerCount} workers.`);

        // --- Pool Event Handlers ---

        pool.onTaskComplete((data) => {
            if (hasCriticalError) return; // Stop processing if a critical error occurred

            // --- Runtime checks for data integrity crossing the worker boundary (Keep Recommended) ---
            if (!data || typeof data.index !== 'number' || data.index < 0 || data.index >= totalTasks) {
                console.error('MainThread: Received task completion with invalid index:', data);
                // Decide how to handle this - potentially treat as error for that slot?
                // For now, just log and ignore this specific result.
                return;
            }
            const { index, result, error } = data;
            // --- End of runtime checks ---

            if (error) {
                // Handle task-specific error reported by the worker
                console.error(`MainThread: Worker task ${index} failed:`, error);
                results[index] = `<div style="color:orange;">Section ${index + 1} failed to load: ${escapeHtml(error)}</div>`;
            } else if (typeof result === 'string') { // Check expected result type
                results[index] = result;
            } else {
                // Handle unexpected result format from worker
                console.error(`MainThread: Worker task ${index} returned invalid result format:`, result);
                results[index] = `<div style="color:red;">Section ${index + 1} failed: Invalid data received.</div>`;
            }

            completedTasks++;
            console.log(`Task ${index} completed (${completedTasks}/${totalTasks})`);

            // Check if all tasks are done
            if (completedTasks === totalTasks) {
                console.log('All tasks completed. Assembling final HTML...');
                // Keep try-catch around final DOM manipulation and listener attachment
                try {
                    const finalHTML = results.join('');
                    targetElement.innerHTML = finalHTML; // Render the combined HTML
                    console.log('Rendering complete.');

                    attachEventListeners(targetElement, eventRegistry); // Attach listeners after rendering

                    targetElement.classList.remove('rendering-in-progress');
                    console.log('Parallel rendering finished successfully.');
                    resolve(); // Resolve the main promise
                } catch (assemblyError) {
                    console.error('Error during final HTML assembly or listener attachment:', assemblyError);
                    targetElement.innerHTML = `<div style="color: red;">Critical Error: Failed to display final content. ${escapeHtml(/** @type {Error}*/(assemblyError).message)}</div>`;
                    targetElement.classList.remove('rendering-in-progress');
                    reject(assemblyError); // Reject the main promise
                } finally {
                    // Ensure pool is terminated regardless of success or failure in assembly
                    if (pool) pool.terminate();
                }
            }
        });

        pool.onError((error) => {
            if (hasCriticalError) return;
            // Handle critical worker errors (e.g., worker script not found, init failure)
            console.error('MainThread: Critical WorkerPool error:', error);
            targetElement.innerHTML = `<div style="color: red;">Critical Error: Worker pool encountered an issue. ${escapeHtml(error instanceof ErrorEvent ? error.message : String(error))}</div>`;
            targetElement.classList.remove('rendering-in-progress');
            hasCriticalError = true; // Prevent further processing
            if (pool) pool.terminate(); // Terminate the pool on critical error
            reject(error instanceof ErrorEvent ? new Error(error.message) : error); // Reject the main promise
        });

        // --- Task Submission ---
        if (totalTasks === 0) {
            console.log('No tasks to process.');
            targetElement.innerHTML = '<div>No content sections defined.</div>';
            targetElement.classList.remove('rendering-in-progress');
            if (pool) pool.terminate();
            resolve(); // Resolve immediately if there are no tasks
            return;
        }

        tasks.forEach((childComposer, index) => {
            if (hasCriticalError) return; // Don't submit more tasks if error occurred
            // Keep try-catch around stringify as complex objects could potentially fail
            try {
                // Assumes childComposer.toJSON() returns DOMComposerJSONObject compatible structure
                const composerJson = JSON.stringify(childComposer.toJSON());
                /** @type {WorkerTask} */
                const taskData = { index: index, composerJson: composerJson };
                pool.submitTask(taskData);
            } catch (stringifyError) {
                console.error(`MainThread: Failed to stringify task ${index}. Skipping.`, stringifyError);
                // Record error for this specific task
                results[index] = `<div style="color:red;">Section ${index + 1} could not be prepared: ${escapeHtml(/** @type {Error}*/(stringifyError).message)}</div>`;
                completedTasks++; // Mark as "completed" (with an error)
                // If this was the last task, trigger completion check
                if (completedTasks === totalTasks && pool) {
                    // Need to manually trigger the completion logic if all tasks failed serialization
                    // This edge case might need refinement, but for now, let's log it.
                    console.warn("All tasks potentially failed serialization before submission.");
                    // Force termination and reject or resolve with errors?
                    hasCriticalError = true; // Treat as critical if serialization fails substantially
                    targetElement.innerHTML = `<div style="color: red;">Critical Error: Could not prepare tasks for workers.</div>`;
                    targetElement.classList.remove('rendering-in-progress');
                    pool.terminate();
                    reject(new Error("Failed to serialize tasks for workers."));
                }
            }
        });
    });
}


// --- Helper Function (already in dom-composer.js, but useful here too if needed standalone) ---
/**
 * Escapes HTML special characters.
 * @param {unknown} unsafe - Value to escape.
 * @returns {string} Escaped string.
 */
function escapeHtml(unsafe) {
    if (unsafe === null || typeof unsafe === 'undefined') return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// --- ========================================= ---
// --- Example Usage Section                     ---
// --- ========================================= ---

// Wait for the DOM to be ready before running the example
events();

const main = async () => {
    const appRootElement = document.getElementById('app');

    if (!appRootElement) {
        console.error('Error: Target element with id="app" not found.');
        return;
    }

    /** @type {DOMComposer} This acts as the container for parallel tasks */
    const rootContainer = DOMComposer.fragment(); // Use a placeholder container, its tag doesn't usually render
    const fetcher = new Fetcher(); // Create a fetcher instance for i18n

    try {
        const a = await fetcher.fetchDataByLocale('en');
        console.log('Fetched data:', a); // Log the fetched data for debugging

        getResume(a.resume).forEach(section => {
            rootContainer.appendChild({ child: section });
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return;
    }

    // --- 2. Create DOM Structure using DOMComposer ---
    console.log('Creating virtual DOM structure...');



    // --- 3. Start Parallel Rendering ---
    console.log('Starting parallel rendering process...');
    const workerScript = './assets/js/worker.js'; // Path to the worker script

    await renderParallel(rootContainer, appRootElement, workerScript);

}; // End DOMContentLoaded listener

await main();