// @ts-check

const URL = 'https://loldruger@github.io/locales'

export class Fetcher {
    /**
     * @param {'en'|'ko'} locale
     * @returns {Promise<{data: any}>} 
     * @throws {Error}
     */
    async fetchDataByLocale(locale) {
        const url = `${URL}/${locale}/resume.json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        return await response.json();
    }

    
}
