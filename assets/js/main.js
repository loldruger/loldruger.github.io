//@ts-check

// Assume necessary imports are here:
import DOMComposer from './DOMinator/DOMComposer.js';
import WorkerPool from './DOMinator/WorkerPool.js';
import { eventRegistry } from './DOMinator/EventRegistry.js';
import { Fetcher } from './i18n/fetcher.js'; // Corrected import path assumption
import { i18n } from './i18n/lib.js'; // Assuming i18n is from lib.js
import { getResume, events, createScrollToTopButton } from './const.js';
import { optionButtons } from './OptionButtons.js'; // Import the singleton instance

/**
 * @typedef {import('./DOMinator/DOMComposer.js').HtmlEventName} HtmlEventName
 * @typedef {import('./DOMinator/EventRegistry.js').EventHandler} EventHandler
 * @typedef {import('./DOMinator/WorkerPool.js').WorkerResult} WorkerResult
 * @typedef {import('./DOMinator/WorkerPool.js').WorkerTask} WorkerTask
 * @typedef {import('./const.js').FetchedResumeData} FetchedResumeData
 */

// =======================================================================
// attachEventListeners Function Definition (Keep As Is)
// =======================================================================
/**
 * Attaches delegated event listeners to a container element based on data-event-* attributes.
 * @param {HTMLElement} container - The container element to attach listeners to.
 * @param {import('./DOMinator/EventRegistry.js').eventRegistry} registry - The registry containing event handlers.
 * @returns {void}
 */
function attachEventListeners(container, registry) {
    console.log('>>> Attaching event listeners to container:', container.id || container.tagName);
    /** @type {Set<HtmlEventName>} */
    const potentialEvents = new Set();
    const allElements = container.querySelectorAll('*');

    allElements.forEach(el => {
        if (!(el instanceof HTMLElement)) return;
        for (const attr of el.attributes) {
            if (attr.name.startsWith('data-event-')) {
                const eventType = /** @type {HtmlEventName} */ (attr.name.substring('data-event-'.length));
                if (eventType) {
                    potentialEvents.add(eventType);
                }
            }
        }
    });

    console.log(`>>> Attaching listeners for events: [${[...potentialEvents].join(', ')}]`);
    potentialEvents.forEach(eventType => {
        container.addEventListener(eventType, (event) => {
            const attributeName = `data-event-${eventType}`;
            const targetElement = /** @type {HTMLElement | null} */ (/** @type {Element} */ (event.target)?.closest(`[${attributeName}]`));

            if (targetElement) {
                const alias = targetElement.getAttribute(attributeName);
                if (alias) {
                    const handler = registry.getEventCallback(alias);
                    if (handler) {
                        try {
                            handler(event);
                        } catch (handlerError) {
                            console.error(`Error executing event handler for alias '${alias}' on event '${eventType}':`, handlerError);
                        }
                    }
                } else {
                    console.warn(`Empty alias found for event '${eventType}' on element:`, targetElement);
                }
            }
        });
    });
    console.log('>>> Event listeners attached.');
}


// =======================================================================
// renderParallel Function Definition (Keep As Is)
// =======================================================================
/**
 * Renders a DOMComposer structure into a target HTML element using a worker pool.
 * @param {DOMComposer} rootComposer - The root DOMComposer instance.
 * @param {HTMLElement} targetElement - The HTML element to render into.
 * @param {string} workerScriptPath - Path to the worker script.
 * @returns {Promise<void>} Resolves on completion, rejects on critical error.
 */
function renderParallel(rootComposer, targetElement, workerScriptPath) {
    return new Promise((resolve, reject) => {
        console.log('Starting parallel rendering...');
        targetElement.classList.add('rendering-in-progress');
        targetElement.innerHTML = ''; // Clear target element

        /** @type {WorkerPool | null} */
        let pool = null;
        const workerCount = navigator.hardwareConcurrency || 2;

        try {
            pool = new WorkerPool(workerCount, workerScriptPath);
        } catch (error) {
            console.error('Failed to create WorkerPool:', error);
            targetElement.innerHTML = `<div style="color: red;">Error: Could not initialize worker pool. ${escapeHtml(/** @type {Error}*/(error).message)}</div>`;
            targetElement.classList.remove('rendering-in-progress');
            reject(error);
            return;
        }

        const tasks = rootComposer.getChildren();
        const totalTasks = tasks.length;
        const results = new Array(totalTasks).fill('');
        let completedTasks = 0;
        let hasCriticalError = false;

        console.log(`Distributing ${totalTasks} tasks to ${workerCount} workers.`);

        pool.onTaskComplete((data) => {
            if (hasCriticalError) return;
            const { index, result, error } = data;

            if (error) {
                console.error(`MainThread: Worker task ${index} failed:`, error);
                results[index] = `<div style="color:orange;">Section ${index + 1} failed to load: ${escapeHtml(error)}</div>`;
            } else if (typeof result === 'string') {
                results[index] = result;
            } else {
                console.error(`MainThread: Worker task ${index} returned invalid result format:`, result);
                results[index] = `<div style="color:red;">Section ${index + 1} failed: Invalid data received.</div>`;
            }

            completedTasks += 1;
            console.log(`Task ${index} completed (${completedTasks}/${totalTasks})`);

            if (completedTasks === totalTasks) {
                console.log('All tasks completed. Assembling final HTML...');
                try {
                    const finalHTML = results.join('');
                    targetElement.innerHTML = finalHTML;
                    console.log('Rendering complete.');
                    targetElement.classList.remove('rendering-in-progress');
                    console.log('Parallel rendering finished successfully.');
                    resolve();
                } catch (assemblyError) {
                    console.error('Error during final HTML assembly:', assemblyError);
                    targetElement.innerHTML = `<div style="color: red;">Critical Error: Failed to display final content. ${escapeHtml(/** @type {Error}*/(assemblyError).message)}</div>`;
                    targetElement.classList.remove('rendering-in-progress');
                    reject(assemblyError);
                } finally {
                    if (pool) pool.terminate();
                }
            }
        });

        pool.onError((error) => {
            if (hasCriticalError) return;
            console.error('MainThread: Critical WorkerPool error:', error);
            targetElement.innerHTML = `<div style="color: red;">Critical Error: Worker pool encountered an issue. ${escapeHtml(error instanceof ErrorEvent ? error.message : String(error))}</div>`;
            targetElement.classList.remove('rendering-in-progress');
            hasCriticalError = true;
            if (pool) pool.terminate();
            reject(error instanceof ErrorEvent ? new Error(error.message) : error);
        });

        if (totalTasks === 0) {
            console.log('No tasks to process.');
            targetElement.innerHTML = '<div>No content sections defined.</div>';
            targetElement.classList.remove('rendering-in-progress');
            if (pool) pool.terminate();
            resolve();
            return;
        }

        tasks.forEach((childComposer, index) => {
            if (hasCriticalError) return;
            try {
                const composerJson = JSON.stringify(childComposer.toJSON());
                /** @type {WorkerTask} */
                const taskData = { index: index, composerJson: composerJson };
                pool.submitTask(taskData);
            } catch (stringifyError) {
                console.error(`MainThread: Failed to stringify task ${index}. Skipping.`, stringifyError);
                results[index] = `<div style="color:red;">Section ${index + 1} could not be prepared: ${escapeHtml(/** @type {Error}*/(stringifyError).message)}</div>`;
                completedTasks += 1;
                if (completedTasks === totalTasks && pool) {
                    console.warn("All tasks potentially failed serialization before submission.");
                    hasCriticalError = true;
                    targetElement.innerHTML = `<div style="color: red;">Critical Error: Could not prepare tasks for workers.</div>`;
                    targetElement.classList.remove('rendering-in-progress');
                    pool.terminate();
                    reject(new Error("Failed to serialize tasks for workers."));
                }
            }
        });
    });
}


// =======================================================================
// escapeHtml Helper Function (Keep As Is)
// =======================================================================
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


// =======================================================================
// loadAndRenderData Function Definition (MODIFIED: Use singleton instance)
// =======================================================================
/**
 * Fetches data, processes it, renders it, and updates lang attribute.
 * @param {'en'|'ko'} locale - Locale to load.
 * @param {HTMLElement} appRootElement - Target element.
 * @param {string} workerScript - Worker script path.
 * @returns {Promise<void>}
 * @throws {Error} If any step fails.
 */
async function loadAndRenderData(locale, appRootElement, workerScript) {
    console.log(`[loadAndRenderData] Start processing for '${locale}'. Current lang: ${document.documentElement.lang}`);
    if (!appRootElement) {
        console.error('[loadAndRenderData] Error: Target element is null or undefined.');
        throw new Error('Target application root element not found.');
    }

    console.log(`[loadAndRenderData] Started for locale: ${locale}`);
    appRootElement.innerHTML = '<p>Loading content...</p>';

    const rootContainer = DOMComposer.fragment();
    const fetcher = new Fetcher();

    try {
        console.log(`[loadAndRenderData] Fetching data for locale: ${locale}`);
        /** @type {(FetchedResumeData & { common: object }) | null} */
        const data = await fetcher.fetchDataByLocale(locale);
        console.log(`[loadAndRenderData] Data fetched successfully.`);

        if (!data || !data.resume || !data.common) {
            console.error('[loadAndRenderData] Fetched data is incomplete or invalid:', data);
            throw new Error('Fetched data is incomplete or invalid.');
        } else {
            console.log(`[loadAndRenderData] Processing data with getResume...`);
            const sections = getResume(data.resume, data.common);
            console.log(`[loadAndRenderData] Sections processed.`);

            if (Array.isArray(sections)) {
                for (const section of sections) {
                    if (section) {
                        rootContainer.appendChild({ child: section });
                    } else {
                        console.warn('[loadAndRenderData] Encountered null or undefined section during processing.');
                    }
                }
                console.log(`[loadAndRenderData] Appending sections to fragment complete.`);
            } else {
                console.error('[loadAndRenderData] Processed data (sections) is not an array:', sections);
                throw new Error('Processed data is not in the expected format (Array).');
            }

            console.log(`[loadAndRenderData] Calling renderParallel...`);
            await renderParallel(rootContainer, appRootElement, workerScript);
            console.log(`[loadAndRenderData] renderParallel finished.`);

            // --- Check if element exists immediately after render ---
            const checkElementExists = document.getElementById('last-update');
            if (checkElementExists) {
                console.log(`[loadAndRenderData] SUCCESS: #last-update element FOUND immediately after renderParallel.`);
            } else {
                console.error(`[loadAndRenderData] FAILURE: #last-update element NOT FOUND immediately after renderParallel.`);
                // Optionally log the container's HTML for inspection
                // console.log("Debug: appRootElement innerHTML after render:", appRootElement.innerHTML);
            }
            // --- End Check ---

            // --- Update Last Update Time AFTER renderParallel completes ---
            console.log(`[loadAndRenderData] Attempting to fetch and update last update time...`);
            const lastUpdateElement = document.getElementById('last-update');
            if (lastUpdateElement) {
                console.log(`[loadAndRenderData] Found #last-update element.`);
                try {
                    const lastUpdateText = await optionButtons.getLastUpdateDate();
                    console.log(`[loadAndRenderData] Fetched last update text: ${lastUpdateText}`);
                    const label = i18n.t(data.common.common.general.lastUpdate); // Ensure i18n is initialized before this
                    console.log(`[loadAndRenderData] Fetched label: ${label}`);
                    // Update the element text, handle potential null/error return
                    lastUpdateElement.innerText = `${label}: ${lastUpdateText || 'N/A'}`;
                    console.log(`[loadAndRenderData] Updated #last-update element text.`);
                } catch (error) {
                    console.error("[loadAndRenderData] Error getting last update time:", error);
                    lastUpdateElement.innerText = `${i18n.t(data.common.common.general.lastUpdate)}: Error`;
                }
            } else {
                console.error("[loadAndRenderData] Could not find #last-update element after rendering.");
            }
            // --- End Update Last Update Time ---

            console.log(`[loadAndRenderData] Updating document lang attribute to: ${locale}`);
            document.documentElement.lang = locale;

            // --- Add Scroll-to-Top Button AFTER rendering --- 
            // Check if button already exists to prevent duplicates on re-render
            if (!document.getElementById('scroll-to-top-btn')) {
                const topButtonElement = createScrollToTopButton().toHTMLElement();
                document.body.appendChild(topButtonElement); // Append to body for fixed positioning
                console.log(`[loadAndRenderData] Scroll-to-top button added.`);
            }
            // --- End Add Button ---

            eventRegistry.emit('dataLoaded', "done");

            console.log(`[loadAndRenderData] Successfully finished for locale: ${locale}`);
        }
    } catch (error) {
        console.error(`[loadAndRenderData] Error during processing for ${locale}:`, error);
        if (appRootElement) {
            appRootElement.innerHTML = `<p>Error loading content for ${locale}. Please try again.</p>`;
        }
        throw error;
    }

    console.log(`[loadAndRenderData] Finish processing for '${locale}'. Current lang: ${document.documentElement.lang}`);
}


// =======================================================================
// Main Application Logic (MODIFIED: Use singleton instance)
// =======================================================================
let hasMainExecuted = false;

/**
 * Main application entry point.
 */
const main = async () => {
    if (hasMainExecuted) {
        console.warn('[main] main function called again, skipping execution.');
        return;
    }
    hasMainExecuted = true;
    console.log('[main] Application starting...');

    /** @type {boolean} */
    let isLoading = false;
    const workerScript = './assets/js/worker.js';
    const appRootElement = document.getElementById('app');

    if (!appRootElement) {
        console.error('[main] Fatal Error: Target element with id="app" not found.');
        return;
    }

    events();

    console.log('[main] Attaching languageChanged listener...');
    /** @param {{ language: 'en'|'ko' }} eventData */
    const handleLanguageChange = (eventData) => {
        console.log('[main] handleLanguageChange start. Current lang:', document.documentElement.lang, 'isLoading:', isLoading);
        const newLocale = eventData.language;
        console.log(`[main] <<< Received 'languageChanged' event for locale: ${newLocale}`);

        if (isLoading) {
            console.warn('[main] Ignoring language change request: data is already loading.');
        } else {
            isLoading = true;
            console.log(`[main] Starting data load for locale: ${newLocale}`);

            /** @type {HTMLButtonElement | null} */
            const langButton = /** @type {HTMLButtonElement | null} */ (document.getElementById('lang-change-button-id'));
            if (langButton) {
                langButton.disabled = true;
                console.log('[main] Language change button disabled.');
            }

            loadAndRenderData(newLocale, appRootElement, workerScript)
                .catch(error => {
                    console.error('[main] Caught error during loadAndRenderData execution:', error);
                })
                .finally(() => {
                    isLoading = false;
                    console.log('[main] Load process finished (finally block). Resetting isLoading flag.');
                    if (langButton) {
                        langButton.disabled = false;
                        console.log('[main] Language change button enabled.');
                    }
                });
        }
    };
    eventRegistry.on('languageChanged', handleLanguageChange);
    console.log('[main] languageChanged listener attached.');

    const initialLocale = document.documentElement.lang === 'ko' ? 'ko' : 'en';
    console.log(`[main] Initial locale detected: ${initialLocale}`);

    if (!isLoading) {
        isLoading = true;
        console.log(`[main] Starting initial data load for locale: ${initialLocale}`);
        /** @type {HTMLButtonElement | null} */
        const langButton = /** @type {HTMLButtonElement | null} */ (document.getElementById('lang-change-button-id'));
        if (langButton) {
            langButton.disabled = true;
            console.log('[main] Language change button disabled for initial load.');
        }

        try {
            await loadAndRenderData(initialLocale, appRootElement, workerScript);
            console.log('[main] Initial render successful. Attaching event listeners ONCE.');
            attachEventListeners(appRootElement, eventRegistry);
        } catch (error) {
            console.error('[main] Caught error during initial loadAndRenderData:', error);
        } finally {
            isLoading = false;
            console.log('[main] Initial load process finished (finally block). Resetting isLoading flag.');
            if (langButton) {
                langButton.disabled = false;
                console.log('[main] Language change button enabled after initial load.');
            }
        }
    } else {
        console.warn('[main] Initial load skipped because isLoading was already true.');
    }

    console.log('[main] Application setup complete.');
};

await main();
