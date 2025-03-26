//@ts-check

/**
 * @typedef {object} WorkerTask Data sent TO the worker.
 * @property {number} index Task identifier/order index.
 * @property {string} composerJson Serialized DOMComposer JSON string.
 */

/**
 * @typedef {object} WorkerResult Data received FROM the worker.
 * @property {number} index The identifier/order index of the completed task.
 * @property {string} [result] The resulting HTML string on success.
 * @property {string} [error] Error message string on failure.
 * @property {'ready' | 'init_error'} [status] Optional status message from worker.
 */

/**
 * @callback OnTaskCompleteCallback
 * @param {WorkerResult} resultData Data received from the worker.
 */

/**
 * @callback OnPoolErrorCallback
 * @param {ErrorEvent | string} error The error object or message.
 */

/**
 * Manages a pool of Web Workers for parallel task execution.
 */
export default class WorkerPool {
    /**
     * Path to the worker script.
     * @type {string}
     */
    #workerScriptPath;

    /**
     * All created worker instances.
     * @type {Worker[]}
     */
    #workers = [];

    /**
     * Workers currently idle and available for tasks.
     * @type {Worker[]}
     */
    #idleWorkers = [];

    /**
     * Tasks waiting for an available worker.
     * @type {WorkerTask[]}
     */
    #taskQueue = [];

    /**
     * Callback function executed when a worker completes a task.
     * @type {OnTaskCompleteCallback | null}
     */
    #onTaskComplete = null;

    /**
      * Callback function executed on critical worker errors.

      * @type {OnPoolErrorCallback | null}
      */
    #onError = null;

    /**
     * Flag to prevent operations after termination.
     * @type {boolean}
     */
    #terminated = false;

    /**
     * Creates a WorkerPool instance.
     * @param {number} poolSize - The number of workers to create.
     * @param {string} workerScriptPath - The path to the worker script file.
     * @throws {Error} If poolSize is invalid or worker creation fails.
     */
    constructor(poolSize, workerScriptPath) {
        if (poolSize <= 0) {
            throw new Error('WorkerPool size must be greater than 0.');
        }
        if (!workerScriptPath) {
            throw new Error('Worker script path is required.');
        }
        this.#workerScriptPath = workerScriptPath;

        console.log(`Initializing WorkerPool with ${poolSize} workers...`);

        for (let i = 0; i < poolSize; i++) {
            try {
                const worker = new Worker(this.#workerScriptPath, { type: 'module' }); // Use type: 'module' if worker uses ES modules

                // Listen for messages from the worker
                worker.onmessage = this.#handleWorkerMessage.bind(this);

                // Listen for critical errors in the worker itself
                worker.onerror = (event) => {
                    console.error(`WorkerPool: Error in worker #${i}:`, event.message, event);
                    this.#handleWorkerError(event, worker);
                    // Optionally remove or replace the faulty worker here
                };

                this.#workers.push(worker);
                this.#idleWorkers.push(worker); // Start as idle
            } catch (error) {
                console.error(`WorkerPool: Failed to create worker #${i} from ${workerScriptPath}`, error);
                // Terminate already created workers before throwing
                this.terminate();
                throw new Error(`Failed to initialize worker pool: ${/** @type {Error}*/ (error).message}`);
            }
        }
        console.log(`WorkerPool initialized successfully.`);
    }

    /**
     * Submits a task to the worker pool.
     * If a worker is idle, the task is sent immediately. Otherwise, it's queued.
     * @param {WorkerTask} task - The task data to send to a worker.
     */
    submitTask(task) {
        if (this.#terminated) {
            console.warn('WorkerPool: Cannot submit task, pool is terminated.');
            return;
        }
        // Basic validation relying on JSDoc/ts-check mostly
        if (!task || typeof task.index !== 'number') {
            console.error('WorkerPool: Invalid task submitted.', task);
            return; // Or handle error more formally
        }

        const idleWorker = this.#idleWorkers.pop(); // Get an idle worker if available
        if (idleWorker) {
            // console.log(`WorkerPool: Sending task ${task.index} to an idle worker.`);
            try {
                idleWorker.postMessage(task);
            } catch (error) {
                console.error(`WorkerPool: Failed to post message to worker for task ${task.index}. Re-queuing.`, error);
                this.#idleWorkers.push(idleWorker); // Put worker back if postMessage failed
                this.#taskQueue.push(task); // Add task to queue
                this.#handleWorkerError(new ErrorEvent('postmessageerror', { message: `Failed to post message: ${/** @type {Error}*/ (error).message}` }), idleWorker);
            }
        } else {
            // console.log(`WorkerPool: No idle workers, queuing task ${task.index}. Queue size: ${this.#taskQueue.length + 1}`);
            this.#taskQueue.push(task); // Add task to the queue
        }
    }

    /**
     * Sets the callback function to be executed when any worker completes a task.
     * @param {OnTaskCompleteCallback} callback - The function to call with worker result data.
     */
    onTaskComplete(callback) {
        // No runtime type check for callback, rely on JSDoc/ts-check
        this.#onTaskComplete = callback;
    }

    /**
     * Sets the callback function for handling critical worker errors.
     * @param {OnPoolErrorCallback} callback - The function to call with the error event or message.
     */
    onError(callback) {
        // No runtime type check for callback
        this.#onError = callback;
    }

    /**
     * Terminates all workers in the pool and clears the task queue.
     * The pool cannot be used after termination.
     */
    terminate() {
        if (this.#terminated) return;
        console.log('WorkerPool: Terminating all workers...');
        this.#terminated = true;
        this.#workers.forEach(worker => {
            worker.terminate();
            // Clean up listeners? Usually not necessary after terminate.
            // worker.onmessage = null;
            // worker.onerror = null;
        });
        this.#workers = [];
        this.#idleWorkers = [];
        this.#taskQueue = [];
        this.#onTaskComplete = null; // Clear callbacks
        this.#onError = null;
        console.log('WorkerPool: Terminated.');
    }

    /**
     * Handles messages received from a worker.
     * Passes the result data to the onTaskComplete callback.
     * Assigns a new task from the queue if available, otherwise marks the worker as idle.
     * @param {MessageEvent} event - The message event from the worker. Expected data: WorkerResult
     */
    #handleWorkerMessage(event) {
        if (this.#terminated) return;

        const resultData = /** @type {WorkerResult} */ (event.data);
        const worker = /** @type {Worker} */ (event.target);

        // Pass the entire result data (including potential error) to the callback
        if (this.#onTaskComplete) {
            try {
                this.#onTaskComplete(resultData);
            } catch (callbackError) {
                console.error('WorkerPool: Error in onTaskComplete callback:', callbackError);
            }
        } else {
            // Silently ignore if no callback is registered? Or warn?
            // console.warn('WorkerPool: Task completed but no onTaskComplete callback is set.');
        }

        // Check if there are more tasks waiting in the queue
        if (this.#taskQueue.length > 0) {
            const nextTask = this.#taskQueue.shift(); // Get the next task (FIFO)
            if (nextTask) {
                // console.log(`WorkerPool: Assigning queued task ${nextTask.index} to worker.`);
                try {
                    worker.postMessage(nextTask); // Send the next task to the now free worker
                } catch (error) {
                    console.error(`WorkerPool: Failed to post message for queued task ${nextTask.index}. Re-queuing.`, error);
                    // Re-queue the task at the front? Or end? Front is likely better.
                    this.#taskQueue.unshift(nextTask);
                    // Mark worker as idle since it couldn't take the task
                    this.#idleWorkers.push(worker);
                    this.#handleWorkerError(new ErrorEvent('postmessageerror', { message: `Failed to post queued message: ${/** @type {Error} */(error).message}` }), worker);
                }
            } else {
                // Should not happen if length > 0, but defensively add worker back
                this.#idleWorkers.push(worker);
            }
        } else {
            // No tasks in queue, mark the worker as idle
            // console.log('WorkerPool: No queued tasks. Worker is now idle.');
            this.#idleWorkers.push(worker);
        }
    }

    /**
      * Handles errors originating from a worker instance.
      * Notifies the main thread via the onError callback if set.
      * @param {ErrorEvent | Event | string} error - The error event or message.
      * @param {Worker} workerInstance - The worker that caused the error.
      */
    #handleWorkerError(error, workerInstance) {
        if (this.#terminated) return;

        // Optionally try to remove the faulty worker from the pool?
        // This requires more complex logic to potentially replace it.
        // For now, just report the error.

        if (this.#onError) {
            try {
                // Provide error details to the callback
                this.#onError(error instanceof ErrorEvent ? error : String(error));
            } catch (callbackError) {
                console.error('WorkerPool: Error in onError callback:', callbackError);
            }
        } else {
            // Log error if no handler is attached
            console.error('WorkerPool: Unhandled worker error:', error);
        }
        // Decide if the worker should still be considered idle after an error
        // If error is critical, maybe remove from #workers and #idleWorkers?
        // For simplicity now, we might put it back, but this could lead to repeated errors.
        // Let's assume an error makes the worker unusable for now and don't put it back in idle pool.
        const workerIndex = this.#idleWorkers.indexOf(workerInstance);
        if (workerIndex > -1) {
            this.#idleWorkers.splice(workerIndex, 1); // Remove from idle if it was there
        }
        // Consider terminating the specific faulty worker?
        // workerInstance.terminate();
        // TODO: Add logic for handling worker failure more gracefully (e.g., retries, replacement).
    }
}