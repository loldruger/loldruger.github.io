//@ts-check

import { Fetcher } from './i18n/lib.js';

const LANG_STORAGE_KEY = 'user-lang-setting';
const THEME_STORAGE_KEY = 'user-dark-mode-setting';
const DARK_MODE_CLASS = 'dark-mode';

/**
 * @param {boolean} isDarkMode 
 */
const updateThemeUI = (isDarkMode) => {
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
const updateLanguageUI = (isEnglishMode) => {
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
const setTheme = (isDarkMode, savePreference) => {
    if (isDarkMode) {
        document.documentElement.classList.add(DARK_MODE_CLASS);
    } else {
        document.documentElement.classList.remove(DARK_MODE_CLASS);
    }
    
    updateThemeUI(isDarkMode);
    
    if (savePreference) {
        localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'true' : 'false');
    }
};

/**
 * @param {'en' | 'ko'} lang 
 * @param {boolean} savePreference
 */
const setLanguage = (lang, savePreference) => {
    document.documentElement.lang = lang;

    updateLanguageUI(lang === 'en');
    
    if (savePreference) {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
};

const getLastUpdateDate = async () => {
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

    // for (const button of toggleButtons) {
    //     button.addEventListener('click', () => {
    //         const circle = button.querySelector('svg > circle');
    //         circle.classList.toggle('active');
    //     });
    // }

    await getLastUpdateDate(); 
}

await main();
