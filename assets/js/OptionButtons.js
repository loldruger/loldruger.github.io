import { eventRegistry } from "./DOMinator/EventRegistry.js";

const LANG_STORAGE_KEY = 'user-lang-setting';
const THEME_STORAGE_KEY = 'user-dark-mode-setting';
const DARK_MODE_CLASS = 'dark-mode';
// Define the path to the file generated by the GitHub Action
const LAST_UPDATE_FILE_PATH = './assets/data/last_update.json';
// Define the key for caching the fetched timestamp in localStorage
const LAST_UPDATE_CACHE_KEY = 'last-update-timestamp';

class OptionButtons {
    // foldingCircles
    // @ts-ignore
    #userThemeSetting;
    // @ts-ignore
    #userLangSetting;
    #prefersDarkMode;

    constructor() {
        this.#userThemeSetting = localStorage.getItem(THEME_STORAGE_KEY);
        this.#userLangSetting = localStorage.getItem(LANG_STORAGE_KEY);
        this.#prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        eventRegistry.on('dataLoaded', () => {
            console.log('[OptionButtons] dataLoaded event received.');

            // --- Theme Logic (Keep As Is) ---
            const currentThemeSetting = localStorage.getItem(THEME_STORAGE_KEY); // Re-read for theme
            if (currentThemeSetting !== null) {
                this.setTheme(currentThemeSetting === 'true', false);
            } else {
                this.setTheme(this.#prefersDarkMode, false);
            }

            // --- Language Logic (FIXED COMPARISON) ---
            const currentLangSetting = /** @type {'en'|'ko'} */ (localStorage.getItem(LANG_STORAGE_KEY)); // Reads 'en' or 'ko'
            console.log(`[OptionButtons] dataLoaded: Read LANG_STORAGE_KEY: '${currentLangSetting}'`);

            if (currentLangSetting !== null) {
                // Correctly check the stored value ('en' or 'ko')
                const langToSet = currentLangSetting; // The value itself is 'en' or 'ko'
                console.log(`[OptionButtons] dataLoaded: Applying lang setting from localStorage: '${langToSet}'`);
                // Apply setting from storage, ensure UI matches
                this.setLanguage(langToSet, false); // Use false to not re-save
            } else {
                // No setting in storage, ensure UI matches current document state
                const currentDocLang = document.documentElement.lang === 'ko' ? 'ko' : 'en';
                console.log(`[OptionButtons] dataLoaded: No lang setting in localStorage, ensuring UI matches document lang: '${currentDocLang}'`);
                this.updateLanguageUI(currentDocLang === 'en');
            }
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem(THEME_STORAGE_KEY) === null) {
                this.setTheme(e.matches, false);
            }
        });
    }

    isDarkMode() {
        return document.documentElement.classList.contains(DARK_MODE_CLASS);
    }

    /**
     * @param {boolean} isDarkMode 
     */
    updateThemeUI(isDarkMode) {
        const sunIcon = document.getElementById('sun');
        const moonIcon = document.getElementById('moon');

        if (isDarkMode) {
            moonIcon?.classList.add('hidden');
            sunIcon?.classList.remove('hidden');
        } else {
            moonIcon?.classList.remove('hidden');
            sunIcon?.classList.add('hidden');
        }
    };

    /**
     * @param {boolean} isEnglishMode 
     */
    updateLanguageUI(isEnglishMode) {
        const langEn = document.getElementById('lang-en');
        const langKo = document.getElementById('lang-ko');

        if (isEnglishMode) {
            langKo?.classList.remove('hidden');
            langEn?.classList.add('hidden');
        } else {
            langKo?.classList.add('hidden');
            langEn?.classList.remove('hidden');
        }
    }

    /**
     * @param {boolean} isDarkMode 
     * @param {boolean} savePreference 
     */
    setTheme(isDarkMode, savePreference) {
        if (isDarkMode) {
            document.documentElement.classList.add(DARK_MODE_CLASS);
        } else {
            document.documentElement.classList.remove(DARK_MODE_CLASS);
        }

        this.updateThemeUI(isDarkMode);

        if (savePreference) {
            localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'true' : 'false');
        }
    };

    /**
     * @param {'en' | 'ko'} lang 
     * @param {boolean} savePreference
     */
    setLanguage(lang, savePreference) {
        console.log('[OptionButtons] setLanguage called with:', lang, 'Save:', savePreference);
        document.documentElement.lang = lang;

        this.updateLanguageUI(lang === 'en');

        if (savePreference) {
            localStorage.setItem(LANG_STORAGE_KEY, lang);
        }
    };

    /**
     * Fetches the last update timestamp from the file generated by GitHub Actions.
     * Includes cache-busting.
     * @returns {Promise<string | null>} The ISO 8601 date string or null on error.
     */
    async #fetchLastUpdateFromFile() {
        try {
            // Add a cache-busting query parameter using the current time
            const response = await fetch(`${LAST_UPDATE_FILE_PATH}?cb=${Date.now()}`);
            if (!response.ok) {
                console.error(`Failed to fetch last update file: ${response.status} ${response.statusText}`);
                return null;
            }
            const data = await response.json();
            // Validate the structure of the fetched data
            if (data && typeof data.lastUpdate === 'string') {
                console.log("[OptionButtons] Fetched last update from file:", data.lastUpdate);
                return data.lastUpdate; // Return the ISO 8601 string
            } else {
                console.error("Invalid data structure in last update file:", data);
                return null;
            }
        } catch (error) {
            console.error("Error fetching or parsing last update file:", error);
            return null;
        }
    }

    /**
     * Gets the last update date, using cache first, then fetching from the Action-generated file.
     * Formats the date for display.
     * @returns {Promise<string | null>} The formatted date string (YYYY-MM-DD HH:MM:SS) or null/error message.
     */
    async getLastUpdateDate() {
        let cachedTimestamp = localStorage.getItem(LAST_UPDATE_CACHE_KEY);
        let isoTimestamp = null;

        if (cachedTimestamp) {
            console.log("[OptionButtons] Using cached last update timestamp:", cachedTimestamp);
            isoTimestamp = cachedTimestamp;
        } else {
            console.log("[OptionButtons] No cached timestamp found. Fetching from file...");
            isoTimestamp = await this.#fetchLastUpdateFromFile();
            if (isoTimestamp) {
                // Store the fetched ISO timestamp in cache
                localStorage.setItem(LAST_UPDATE_CACHE_KEY, isoTimestamp);
                console.log("[OptionButtons] Fetched and cached new timestamp from file.");
            } else {
                console.error("[OptionButtons] Failed to fetch initial timestamp from file.");
                return "Error loading update time"; // Return an error message for display
            }
        }

        // Format the ISO timestamp for display (YYYY-MM-DD HH:MM:SS in local time)
        if (isoTimestamp) {
            try {
                const dateObj = new Date(isoTimestamp);
                // Simple formatting, adjust as needed (e.g., toLocaleString)
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                const seconds = String(dateObj.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            } catch (formatError) {
                console.error("Error formatting date:", formatError);
                return "Invalid date format";
            }
        } else {
            // This case should ideally not be reached if fetch error handling is correct
            return "Update time unavailable";
        }
    }
}

// Create and export a single instance of the class
export const optionButtons = new OptionButtons();