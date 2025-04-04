import { eventRegistry } from "./DOMinator/EventRegistry.js";

const LANG_STORAGE_KEY = 'user-lang-setting';
const THEME_STORAGE_KEY = 'user-dark-mode-setting';
const DARK_MODE_CLASS = 'dark-mode';

export default class OptionButtons {
    // foldingCircles
    #userThemeSetting;
    #userLangSetting;
    #prefersDarkMode;

    constructor() {
        this.#userThemeSetting = localStorage.getItem(THEME_STORAGE_KEY);
        this.#userLangSetting = localStorage.getItem(LANG_STORAGE_KEY);
        this.#prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        eventRegistry.on('dataLoaded', () => {
            console.log('[OptionButtons] dataLoaded event received.'); // Add log

            // --- Theme Logic (Keep As Is) ---
            const currentThemeSetting = localStorage.getItem(THEME_STORAGE_KEY); // Re-read for theme
            if (currentThemeSetting !== null) {
                this.setTheme(currentThemeSetting === 'true', false);
            } else {
                this.setTheme(this.#prefersDarkMode, false);
            }

            // --- Language Logic (FIXED) ---
            // Re-read language setting from storage inside the handler
            const currentLangSetting = localStorage.getItem(LANG_STORAGE_KEY);
            console.log(`[OptionButtons] dataLoaded: Read LANG_STORAGE_KEY: '${currentLangSetting}'`);

            if (currentLangSetting !== null) {
                // Check the actual value stored ('en' or 'ko')
                const langToSet = currentLangSetting === 'en' ? 'en' : 'ko';
                console.log(`[OptionButtons] dataLoaded: Applying lang setting from localStorage: '${langToSet}'`);
                // Call setLanguage only if it differs from the current document lang? Optional optimization.
                // if (document.documentElement.lang !== langToSet) {
                this.setLanguage(langToSet, false); // Apply setting from storage
                // } else {
                //    console.log(`[OptionButtons] dataLoaded: Document lang already matches storage ('${langToSet}'), skipping redundant setLanguage call.`);
                //    this.updateLanguageUI(langToSet === 'en'); // Still update UI just in case
                // }
            } else {
                // No setting in storage, determine based on current document lang
                // (which loadAndRenderData should have set correctly)
                const currentDocLang = document.documentElement.lang === 'ko' ? 'ko' : 'en';
                console.log(`[OptionButtons] dataLoaded: No lang setting in localStorage, ensuring UI matches document lang: '${currentDocLang}'`);
                // Update UI to match the document state set by loadAndRenderData
                this.updateLanguageUI(currentDocLang === 'en');
                // Optionally save the detected lang as the initial preference if none exists?
                // localStorage.setItem(LANG_STORAGE_KEY, currentDocLang);
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

    async getLastUpdateDate() {
        const lastUpdateElement = document.getElementById('last-update');

        if (!lastUpdateElement) {
            console.error('last-update element not found');
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
}