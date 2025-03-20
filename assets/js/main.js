const THEME_STORAGE_KEY = 'user-dark-mode-setting';
const DARK_MODE_CLASS = 'dark-mode';

const updateThemeUI = (isDarkMode) => {
    const sunIcon = document.getElementById('sun');
    const moonIcon = document.getElementById('moon');
    
    if (isDarkMode) {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
};

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

const main = () => {
    const foldingCircles = document.querySelectorAll('.folding-circle');
    const userSetting = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (userSetting !== null) {
        setTheme(userSetting === 'true', false);
    } else {
        setTheme(prefersDarkMode, false);
    }
    
    const darkModeButton = document.getElementById('dark-mode-button');
    darkModeButton.addEventListener('click', () => {
        const isDarkMode = !document.documentElement.classList.contains(DARK_MODE_CLASS);
        setTheme(isDarkMode, true);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem(THEME_STORAGE_KEY) === null) {
            setTheme(e.matches, false);
        }
    });

    for (const circle of foldingCircles) {
        const contentList = circle.parentElement.parentElement.querySelector('.content-list');

        circle.addEventListener('click', () => {
            circle.classList.toggle('folded');

            for (const sibling of contentList.children) {
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


}

main();
