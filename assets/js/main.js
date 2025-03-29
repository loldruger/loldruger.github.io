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

    const fetchLastCommitDate = async () => {
        const res = await fetch('https://api.github.com/repos/loldruger/loldruger.github.io/branches/main');
        const data = await res.json();

        const lastCommitDate = new Date(data.commit.commit.committer.date);
        const koreanDate = new Date(lastCommitDate);
        koreanDate.setHours(koreanDate.getHours() + 9);
        
        const lastUpdateText = koreanDate.toISOString().replace("T", " ").slice(0, 19);
        
        return lastUpdateText;
    }
    
    let lastCommitDate = localStorage.getItem('last-update');

    if (!lastCommitDate) {
        lastCommitDate = await fetchLastCommitDate();
        if (lastCommitDate) {
            localStorage.setItem('last-update', lastCommitDate);
        }
    }

    if (lastCommitDate) {
        lastUpdateElement.textContent += lastCommitDate;
    } else {
        lastUpdateElement.textContent += '0000-00-00 00:00:00';
    }
}

const main = async () => {
    const fetcher = new Fetcher();

    const foldingCircles = document.querySelectorAll('.folding-circle');
    const userThemeSetting = localStorage.getItem(THEME_STORAGE_KEY);
    const userLangSetting = localStorage.getItem(LANG_STORAGE_KEY);
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;


    if (userThemeSetting !== null) {
        setTheme(userThemeSetting === 'true', false);
    } else {
        setTheme(prefersDarkMode, false);
    }
    
    if (userLangSetting !== null) {
        setLanguage(userLangSetting ? 'en' : 'ko' , false);
    }else {
        setLanguage(document.documentElement.lang === 'en' ? 'en' : 'ko', false);
    }

    const darkModeButton = document.getElementById('dark-mode-button');
    const langChangeButton = document.getElementById('lang-change-button');

    darkModeButton?.addEventListener('click', () => {
        const isDarkMode = !document.documentElement.classList.contains(DARK_MODE_CLASS);

        setTheme(isDarkMode, true);
    });

    langChangeButton?.addEventListener('click', () => {
        const langStored = (document.documentElement.lang.match(/en/i)) ? 'ko' : 'en';

        setLanguage(langStored, true);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem(THEME_STORAGE_KEY) === null) {
            setTheme(e.matches, false);
        }
    });

    for (const circle of foldingCircles) {
        const contentList = circle.parentElement?.parentElement?.querySelector('.content-list');

        circle.addEventListener('click', () => {
            circle.classList.toggle('folded');

            for (const sibling of contentList?.children ?? []) {
                sibling.classList.toggle('rolled-up');
            }
  
        });
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
