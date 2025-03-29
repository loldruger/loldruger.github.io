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

        if (this.#userThemeSetting !== null) {
            this.setTheme(this.#userThemeSetting === 'true', false);
        } else {
            this.setTheme(this.#prefersDarkMode, false);
        }

        if (this.#userLangSetting !== null) {
            this.setLanguage(this.#userLangSetting ? 'en' : 'ko', false);
        } else {
            this.setLanguage(document.documentElement.lang === 'en' ? 'en' : 'ko', false);
        }

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