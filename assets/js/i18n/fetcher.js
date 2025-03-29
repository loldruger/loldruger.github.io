// @ts-check

const BASE_URL = 'https://api.github.com/repos/loldruger/loldruger.github.io/contents';
const BRANCH = 'main';
const CACHE_PREFIX = 'i18n-data-'; // Prefix for localStorage keys

export class i18n {
    static t(n) {
        //unimplemented
        return n;
    }
}

export class Fetcher {
    /**
     * Fetches data for a given locale, using localStorage as a cache.
     * @param {'en'|'ko'} locale - The locale to fetch data for.
     * @returns {Promise<{resume: object, common: object}>} - The fetched or cached data.
     * @throws {Error} - Throws an error if fetching fails and data is not in cache, or if localStorage operations fail.
     */
    async fetchDataByLocale(locale) {
        const cacheKey = `${CACHE_PREFIX}${locale}`;

        // 1. Try to load data from localStorage
        try {
            const cachedDataString = localStorage.getItem(cacheKey);
            if (cachedDataString) {
                console.log(`Cache hit for locale: ${locale}`);
                /** @type {{resume: object, common: object}} */
                const cachedData = JSON.parse(cachedDataString);
                // Basic validation to ensure the structure is somewhat correct
                if (cachedData && cachedData.resume) {
                    return cachedData;
                } else {
                    console.warn(`Invalid cached data structure for locale: ${locale}. Fetching fresh data.`);
                    // Clear invalid cache entry
                    localStorage.removeItem(cacheKey);
                }
            } else {
                console.log(`Cache miss for locale: ${locale}. Fetching from API.`);
            }
        } catch (error) {
            console.error(`Error reading or parsing localStorage cache for locale ${locale}:`, error);
            // Proceed to fetch from API if cache reading fails
        }

        // 2. If not in cache or cache was invalid, fetch from API
        /**
         * Fetches a specific data pack from the GitHub API.
         * @param {'resume'|'common'} pack - The data pack to fetch.
         * @returns {Promise<object>} - The decoded JSON object.
         * @throws {Error} - Throws if the fetch request fails.
         */
        const fetchData = async (pack) => {
            const path = `locales/${locale}/${pack}.json`;
            const url = `${BASE_URL}/${path}?ref=${BRANCH}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch ${pack} data for ${locale}: ${response.status} ${response.statusText}`);
            }

            /** @type {{content: string}} */
            const data = await response.json(); // Github API returns JSON with a 'content' field
            const decoded = this.#decodeBase64(data);
            return decoded;
        };

        try {
            // Fetch all parts concurrently
            const fetchDataResume = fetchData('resume');
            const fetchDataCommon = fetchData('common');

            const [dataResume, dataCommon] = await Promise.all([
                fetchDataResume,
                fetchDataCommon,
                // fetchDataComponents
            ]);

            ///** @type {{resume: object, common: object, components: object}} */
            /** @type {{resume: object, common: object}} */
            const fetchedData = {
                resume: dataResume,
                common: dataCommon,
            };

            // 3. Store fetched data in localStorage
            try {
                localStorage.setItem(cacheKey, JSON.stringify(fetchedData));
                console.log(`Data for locale ${locale} cached successfully.`);
            } catch (error) {
                console.error(`Error saving data to localStorage for locale ${locale}:`, error);
                // Log the error, but proceed returning the fetched data
                // This might happen if storage quota is exceeded
            }

            return fetchedData;

        } catch (error) {
            // Ensure the error is an Error object
            const fetchError = error instanceof Error ? error : new Error(String(error));
            console.error(`Error fetching data from API for locale ${locale}:`, fetchError);
            // Re-throw the error to be handled by the caller
            throw new Error(`Error fetching data for locale ${locale}: ${fetchError.message}`);
        }
    }

    /**
     * Decodes a base64 encoded string (typically from GitHub API response) into a JSON object.
     * @param {{content: string}} encoded - Object containing the base64 encoded content string.
     * @returns {object} - The parsed JSON object.
     * @throws {Error} - Throws if base64 decoding or JSON parsing fails.
     */
    #decodeBase64(encoded) {
        try {
            // Remove any whitespace (like newlines) from the base64 string
            const base64Cleaned = encoded.content.replace(/\s/g, '');
            // Decode base64 string to binary string
            const binaryString = atob(base64Cleaned);
            // Convert binary string to byte array
            const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
            // Decode byte array using UTF-8
            const decodedContent = new TextDecoder('utf-8').decode(bytes);
            // Parse the resulting JSON string
            return JSON.parse(decodedContent);
        } catch (error) {
            console.error("Failed to decode base64 content:", error);
            throw new Error(`Failed to decode or parse content: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Clears the i18n cache for a specific locale or all locales.
     * @param {'en'|'ko'|null} [locale=null] - The locale to clear, or null/undefined to clear all i18n caches.
     */
    clearCache(locale = null) {
        if (locale) {
            const cacheKey = `${CACHE_PREFIX}${locale}`;
            localStorage.removeItem(cacheKey);
            console.log(`Cache cleared for locale: ${locale}`);
        } else {
            // Clear all keys starting with the prefix
            Object.keys(localStorage)
                .filter(key => key.startsWith(CACHE_PREFIX))
                .forEach(key => localStorage.removeItem(key));
            console.log(`All i18n caches cleared.`);
        }
    }
}