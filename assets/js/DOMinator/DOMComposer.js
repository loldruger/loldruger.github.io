//@ts-check

/**
 * @typedef {'section'|'header'|'div'|'span'|'button'|'time'|'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'a'|'b'|'p'|'img'|'br'|'hr'|'input'|'meta'|'link'|'table'|'tr'|'td'|'th'|'thead'|'tbody'} HTMLElementKind
 * @typedef {'svg'|'path'|'rect'|'circle'|'line'|'polyline'|'polygon'|'g'|'text'} SVGElementKind
 * @typedef {keyof HTMLElementEventMap} HtmlEventName
 */

/**
 * Defines the structure of the plain object returned by DOMComposer#toJSON
 * and expected by DOMComposer.fromJSON.
 * @typedef {{
 * tag: HTMLElementKind | SVGElementKind | null;
 * isSvgRelated: boolean;
 * children: DOMComposerJSONObject[]; // Array of plain objects, not DOMComposer instances
 * attribute: Record<string, { namespace?: string | null, value: string }>;
 * content: { innerText: string, innerHTML: string };
 * eventsMap: Array<{ event: HtmlEventName, alias: string }>;
 * }} DOMComposerJSONObject
 */


// --- Helper Functions ---

/**
* Escapes HTML special characters in a string.
* @param {string | null | undefined} unsafe - The string to escape.
* @returns {string} The escaped string.
*/
const escapeHtml = (unsafe) => {
    if (unsafe === null || typeof unsafe === 'undefined') return '';
    // Ensure input is treated as a string before replacing
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Set of HTML tags that are typically self-closing
const selfClosingTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

// Function returning a Set of SVG tags for checking SVG context
const svgTags = () => new Set(['svg', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon', 'g', 'text']);


// --- DOMComposer Class ---

export default class DOMComposer {
    /** @type {HTMLElementKind | SVGElementKind | null} */
    #tag = null;

    /** @type {boolean} */
    #isSvgRelated = false;

    /** @type {Array<DOMComposer>} */
    #children = [];

    /** @type {Record<string, { namespace?: string | null, value: string }>} */
    #attribute = {};

    /** @type {{ innerText: string, innerHTML: string }} */
    #content = { innerText: '', innerHTML: '' };

    /** @type {Partial<Record<HtmlEventName, (e: Event) => void>>} */
    #events = {}; // Only used by toHTMLElement on the main thread

    /** @type {Array<{ event: HtmlEventName, alias: string }>} */
    #eventsMap = []; // Used for serialization

    /**
     * Private constructor. Use static methods like `new` or `fromJSON` to create instances.
     * @private
     */
    constructor() { }

    /**
     * Creates a new DOMComposer instance.
     * @param {{ tag: HTMLElementKind | SVGElementKind }} params
     * @returns {DOMComposer} A new DOMComposer instance.
     */
    static new({ tag }) {
        const composer = new DOMComposer();
        composer.#tag = tag;
        composer.#isSvgRelated = svgTags().has(tag);
        return composer;
    }

    /**
     * Creates a new DOMComposer instance from a raw attribute string.
     * @param {{ tag: HTMLElementKind | SVGElementKind, rawAttributes: string }} params
     * @returns {DOMComposer} A new DOMComposer instance.
     */
    static newRaw({ tag, rawAttributes }) {
        const composer = DOMComposer.new({ tag });
        const attrRegex = /([\w\-:]+)=["']([^"']*)["']/g;
        let match;

        while ((match = attrRegex.exec(rawAttributes)) !== null) {
            composer.setAttribute({ name: match[1], value: match[2] });
        }
        return composer;
    }

    /**
     * Creates a DOMComposer instance from a plain JSON object (result of toJSON()).
     * Relies on JSDoc/ts-check for input object shape validation.
     * @param {DOMComposerJSONObject} json - The plain JavaScript object.
     * @returns {DOMComposer} The reconstructed DOMComposer instance.
     * @throws {Error} If the basic JSON structure is invalid for recursion.
     */
    static fromJSON(json) {
        // No runtime checks for json object itself, assumes structure based on JSDoc type.
        const instance = new DOMComposer();

        instance.#tag = json.tag;
        instance.#isSvgRelated = json.isSvgRelated ?? false; // Use nullish coalescing for default
        instance.#attribute = json.attribute ?? {};
        instance.#content = json.content ?? { innerText: '', innerHTML: '' };
        instance.#eventsMap = json.eventsMap ?? [];

        // Assume json.children is an array if it exists, based on JSDoc/toJSON output
        if (json.children) {
            // No Array.isArray check, rely on JSDoc.
            instance.#children = json.children.map(childJson => {
                // Keep try-catch for robustness during recursive instantiation
                try {
                    // Cast childJson to expected type for recursive call validation by ts-check
                    return DOMComposer.fromJSON(/** @type {DOMComposerJSONObject} */(childJson));
                } catch (error) {
                    // Log error and return a placeholder element instead of throwing entirely
                    console.error('Error parsing child JSON:', childJson, error);
                    const errorComposer = DOMComposer.new({ tag: 'span' });
                    errorComposer.setInnerText({ text: `[Error parsing child: ${/** @type {Error} */ (error).message}]` });
                    return errorComposer;
                }
            });
        }
        return instance;
    }

    /**
     * @returns {DOMComposer}
     */
    static fragment() {
        const composer = new DOMComposer();
        // Explicitly set tag to null to indicate a fragment
        composer.#tag = null;
        composer.#isSvgRelated = false; // Fragments are not SVG-related
        // Attributes, content, and events are not applicable to the fragment itself
        return composer;
    }
    /**
     * Sets an attribute on the element.
     * @param {{ name: string, value: string }} params
     * @returns {DOMComposer} The instance for chaining.
     */
    setAttribute({ name, value }) {
        if (this.#tag === null) {
            console.warn(`DOMComposer Warning: setAttribute called on a fragment. Attributes are ignored on fragments.`);
            return this; // Fragments cannot have attributes
        }

        // No runtime String() coercion, assumes value is string via JSDoc/usage context
        const attributeName = this.#isSvgRelated ? name : name.toLowerCase();
        let namespace = null;
        if (this.#isSvgRelated && name.startsWith('xlink:')) {
            namespace = 'http://www.w3.org/1999/xlink';
        }
        this.#attribute[attributeName] = { value: value, namespace };
        return this;
    }

    /**
     * Registers an event listener callback and its alias for serialization.
     * @param {{ event: HtmlEventName, callback: (e: Event) => void, alias: string }} params
     * @returns {DOMComposer} The instance for chaining.
     */
    setEvent({ event, callback, alias }) {
        if (this.#tag === null) {
            console.warn(`DOMComposer Warning: setEvent called on a fragment. Events are ignored on fragments.`);
            return this; // Fragments cannot have events
        }
        // No runtime checks for alias/callback type; rely on JSDoc & context.
        // Check for duplicates before adding to map.
        if (!this.#eventsMap.some(map => map.event === event && map.alias === alias)) {
            // Only add if alias is provided (basic logic check, not type check)
            if (alias) {
                this.#eventsMap.push({ event, alias });
            } else {
                console.warn(`DOMComposer Warning: Missing alias for event '${event}' on tag '${this.#tag}'. It won't be attachable after worker generation.`);
            }
        }
        // Store callback anyway for potential main-thread `toHTMLElement` usage
        this.#events[event] = callback;
        return this;
    }

    /**
     * Sets the inner text content. Clears innerHTML.
     * @param {{ text: string }} params
     * @returns {DOMComposer} The instance for chaining.
     */
    setInnerText({ text }) {
        if (this.#tag === null) {
            console.warn(`DOMComposer Warning: setInnerText called on a fragment. Content is ignored on fragments.`);
            return this; // Fragments cannot have direct content
        }
        // No runtime String() coercion
        this.#content.innerText = text;
        this.#content.innerHTML = ''; // innerText overrides innerHTML
        return this;
    }

    /**
     * Sets the inner HTML content. Clears innerText.
     * WARNING: Ensure the HTML is trusted or properly sanitized.
     * @param {{ html: string }} params
     * @returns {DOMComposer} The instance for chaining.
     */
    setInnerHTML({ html }) {
        if (this.#tag === null) {
            console.warn(`DOMComposer Warning: setInnerHTML called on a fragment. Content is ignored on fragments.`);
            return this; // Fragments cannot have direct content
        }
        // No runtime String() coercion
        this.#content.innerHTML = html;
        this.#content.innerText = ''; // innerHTML overrides innerText
        return this;
    }

    /**
     * Appends a child DOMComposer instance.
     * @param {{ child: DOMComposer }} params
     * @returns {DOMComposer} The instance for chaining.
     */
    appendChild({ child }) {
        if (this.#tag === null && (this.#content.innerText || this.#content.innerHTML)) {
            console.warn(`DOMComposer Warning: Appending children to a fragment that also had content set. Fragment content is ignored.`);
            this.#content.innerText = '';
            this.#content.innerHTML = '';
        }
        // No runtime instanceof check; rely on JSDoc and usage context.
        this.#children.push(child);
        return this;
    }

    /**
     * Appends multiple child DOMComposer instances.
     * @param {{ children: Array<DOMComposer> }} params
     * @returns {DOMComposer} The instance for chaining.
     */
    appendChildren({ children }) {
        if (this.#tag === null && (this.#content.innerText || this.#content.innerHTML)) {
            console.warn(`DOMComposer Warning: Appending children to a fragment that also had content set. Fragment content is ignored.`);
            this.#content.innerText = '';
            this.#content.innerHTML = '';
        }
        // No runtime instanceof check; rely on JSDoc and usage context.
        this.#children.push(...children);
        return this;
    }
    /**
     * Returns the array of child DOMComposer instances.
     * Needed for the main thread to iterate and distribute tasks.
     * @returns {Array<DOMComposer>} A shallow copy of the children array.
     */
    getChildren() {
        // Return a shallow copy to prevent accidental modification of the internal array
        return [...this.#children];
    }

    /**
     * Creates and returns a real HTMLElement or SVGElement (Main thread only).
     * Requires `document` access. Attaches listeners directly using `#events`.
     * @returns {HTMLElement | SVGElement | DocumentFragment} The created DOM element.
     * @throws {Error} If called outside a browser environment or if the tag is missing.
     */
    toHTMLElement() {
        // No runtime check for `document`; assumes correct environment if called.
        // Handle Fragment Case
        if (this.#tag === null) {
            const fragment = document.createDocumentFragment();
            // Recursively create and append children to the fragment
            for (const childComposer of this.#children) {
                try {
                    fragment.appendChild(childComposer.toHTMLElement());
                } catch (error) {
                    console.error("Error creating child HTMLElement for fragment:", error);
                    const errorSpan = document.createElement('span');
                    errorSpan.textContent = `[Error rendering child: ${/** @type {Error} */ (error).message}]`;
                    errorSpan.style.color = 'red';
                    fragment.appendChild(errorSpan);
                }
            }
            return fragment;
        }

        const element = this.#isSvgRelated
            ? document.createElementNS('http://www.w3.org/2000/svg', this.#tag)
            : document.createElement(this.#tag);

        // Set attributes
        for (const [name, attr] of Object.entries(this.#attribute)) {
            if (attr.namespace) {
                element.setAttributeNS(attr.namespace, name, attr.value);
            } else {
                element.setAttribute(name, attr.value);
            }
        }

        // Set content (prioritize innerHTML)
        if (this.#content.innerHTML) {
            element.innerHTML = this.#content.innerHTML; // Assumes safe HTML
        } else if (this.#content.innerText) {
            // Use textContent for performance and security
            element.textContent = this.#content.innerText;
        }

        // Attach event listeners directly (using #events)
        // No runtime check for callback type; relies on `setEvent` context.
        for (const [event, callback] of Object.entries(this.#events)) {
            element.addEventListener(/** @type {HtmlEventName} */(event), callback);
        }

        // Recursively create and append children
        for (const childComposer of this.#children) {
            // Keep try-catch for robustness during recursive DOM creation
            try {
                element.appendChild(childComposer.toHTMLElement());
            } catch (error) {
                console.error("Error creating child HTMLElement:", error);
                const errorSpan = document.createElement('span');
                errorSpan.textContent = `[Error rendering child: ${/** @type {Error} */ (error).message}]`;
                errorSpan.style.color = 'red';
                element.appendChild(errorSpan);
            }
        }

        return element;
    }

    /**
     * Generates an HTML string representation (Worker-safe).
     * Includes data-event-* attributes based on #eventsMap for later attachment.
     * @returns {string} The generated HTML string.
     */
    toHTMLString() {

        // 4. Generate children HTML string recursively
        const childrenHTML = this.#children.map(child => child.toHTMLString()).join('');

        // 1. Generate attribute string
        let attributesString = '';
        for (const [name, attr] of Object.entries(this.#attribute)) {
            attributesString += ` ${name}="${escapeHtml(attr.value)}"`;
        }
        // Handle Fragment Case: Return only children's HTML
        if (this.#tag === null) {
            return childrenHTML;
        }
        // 2. Generate data-* attributes for event mapping from #eventsMap
        for (const { event, alias } of this.#eventsMap) {
            // Keep check for valid alias before adding attribute
            if (alias) {
                attributesString += ` data-event-${event}="${escapeHtml(alias)}"`;
            }
        }

        // 3. Handle self-closing tags (HTML only)
        if (!this.#isSvgRelated && selfClosingTags.has(this.#tag)) {
            return `<${this.#tag}${attributesString} />`;
        }



        // 5. Determine content (prioritize innerHTML)
        // No runtime String() coercions; relies on content being strings.
        const contentHTML = this.#content.innerHTML || escapeHtml(this.#content.innerText);

        // 6. Assemble final HTML string
        return `<${this.#tag}${attributesString}>${contentHTML}${childrenHTML}</${this.#tag}>`;
    }

    /**
     * Returns a plain JavaScript object representation suitable for JSON.stringify.
     * Critical for sending data to workers. Conforms to DOMComposerJSONObject structure.
     * @returns {DOMComposerJSONObject} A plain object representation.
     */
    toJSON() {
        return {
            tag: this.#tag,
            isSvgRelated: this.#isSvgRelated,
            // Recursively call toJSON on children, result is array of DOMComposerJSONObject
            children: this.#children.map(child => child.toJSON()),
            attribute: this.#attribute,
            content: this.#content,
            // Only include eventsMap, not the actual callbacks (#events)
            eventsMap: this.#eventsMap
        };
    }
}