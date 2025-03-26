// @ts-check

const BASE_URL = 'https://api.github.com/repos/loldruger/loldruger.github.io/contents';
const BRANCH = 'main';
export class i18n {
    static t(n) {
        return n;
    }
}
export class Fetcher {
    /**
     * @param {'en'|'ko'} locale
     * @returns {Promise<object>} 
     * @throws {Error}
     */
    async fetchDataByLocale(locale) {
        const path = `locales/${locale}/resume.json`;
        const url = `${BASE_URL}/${path}?ref=${BRANCH}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();
        const decoded = this.#decodeBase64(data);

        return decoded;
    }

    /**
     * 
     * @param {{content: string}} encoded 
     * @returns {object}
     */
    #decodeBase64(encoded) {
        const binary = atob(encoded.content.replace(/\s/g, ''));
        const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
        const decodedContent = new TextDecoder('utf-8').decode(bytes);

        return JSON.parse(decodedContent);
    }
}
