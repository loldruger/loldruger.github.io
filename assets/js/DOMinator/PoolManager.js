class WorkerPool {
    /** 
     * @type {Array<Worker>}
     * @description Stores all Workers created in the pool.
     **/
    #workers = [];

    /** @type {Array<Worker>} */
    #freeWorkers = [];

    /** @type {Array<object>} */
    #taskQueue = [];

    /** @type {string} */
    #workerScript;

    /** @type {(function(Array<object>): void) | null} */
    #onCompleteCallback = null;

    /** 
    * @param {number} workerCount - The number of workers to create in the pool.
    * @param {string} workerScript - The path to the worker script.
    */
    constructor(workerCount, workerScript) {
        this.#workerScript = workerScript;

        for (let i = 0; i < workerCount; i++) {
            const worker = new Worker(this.#workerScript);
            worker.onmessage = this.#handleWorkerMessage.bind(this);
            this.#workers.push(worker);
            this.#freeWorkers.push(worker);
        }
    }

    /**
     * @param {Array<object>} task - The task to be processed by a worker.
     */
    submitTask(task) {
        if (this.#freeWorkers.length > 0) {
            const worker = this.#freeWorkers.pop();
            worker?.postMessage(task);
        } else {
            this.#taskQueue.push(task);
        }
    }

    /**
     * Handles messages received from workers.
     * Processes the result, calls the completion callback if set,
     * and manages the worker's availability.
     * @param {MessageEvent} event - The message event from the worker.
     */
    #handleWorkerMessage(event) {
        const { result } = event.data;
        if (this.#onCompleteCallback) {
            this.#onCompleteCallback(result);
        }

        const worker = /** @type {Worker} */(event.target);
        this.#freeWorkers.push(worker);

        if (this.#taskQueue.length > 0) {
            const nextTask = this.#taskQueue.shift();
            worker.postMessage(nextTask);
        }
    }

    /**
     * Sets the callback function to be called when a task is completed.
     * The callback receives the result from the worker.
     * @param {function(any): void} callback - The callback function to handle the task result.
     */
    onTaskComplete(callback) {
        this.#onCompleteCallback = callback;
    }

    /**
     * Terminates all workers in the pool and clears the task queue.
     */
    terminate() {
        this.#workers.forEach(worker => worker.terminate());
        this.#workers = [];
        this.#freeWorkers = [];
        this.#taskQueue = [];
    }
}