//@ts-check

/** @typedef {'section'|'header'|'div'|'span'|'button'|'time'|'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'a'|'b'|'p'} HTMLElementKind */
/** @typedef {'svg'|'path'|'rect'|'circle'|'line'|'polyline'|'polygon'|'g'|'text'} SVGElementKind */

export class DOMComposer {
    /**
     * @type {HTMLElementKind | SVGElementKind | null}
     */
    #tag = null;

    /** @type {boolean} */
    #isSvgRelated = false;

    /**
    * @type {Array<DOMComposer>}
    */
    #children = [];

    /**
     * @type {Record<string, {
     *     namespace?: string?,
     *     value: string
     * }>}
     */
    #attribute = {};

    /**
     * @type {{
     *     innerText: string,
     *     innerHTML: string
     * }}
     */
    #content = {
        innerText: '',
        innerHTML: ''
    };

    /**
     * @type {Partial<Record<keyof HTMLElementEventMap, (e: Event) => void>>}
     */
    #events = {};

    /**
     * @private
     */
    constructor() { }

    /**
     * @param {Object} params
     * @param {HTMLElementKind | SVGElementKind} params.tag
     * @returns {DOMComposer}
     */
    static new({ tag }) {
        const composer = new DOMComposer();
        composer.#tag = tag;
        composer.#isSvgRelated = ['svg', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon', 'g', 'text'].includes(tag);

        return composer;
    }

    /**
     * @param {Object} params
     * @param {HTMLElementKind | SVGElementKind} params.tag
     * @param {string} params.rawAttributes
     * @returns {DOMComposer}
     */
    static newRaw({ tag, rawAttributes }) {
        const composer = new DOMComposer();
        const attrRegex = /([\w\-\:]+)=["']([^"']*)["']/g;
        composer.#tag = tag;
        composer.#isSvgRelated = ['svg', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon', 'g', 'text'].includes(tag);

        let match;

        while ((match = attrRegex.exec(rawAttributes)) !== null) {
            const name = match[1];
            const value = match[2];

            composer.setAttribute({ name, value });
        }

        return composer;
    }

    /**
     * @param {Object} params
     * @param {string} params.name
     * @param {string} params.value
     */
    setAttribute({ name, value }) {
        if (this.#isSvgRelated) {
            if (name.startsWith('xlink:')) {
                this.#attribute[name] = { value, namespace: 'http://www.w3.org/1999/xlink' };
            } else {
                this.#attribute[name] = { value, namespace: null };
            }
        } else {
            this.#attribute[name.toLowerCase()] = { value, namespace: null };
        }
        return this;
    }

    /**
     * @param {Object} params
     * @param {keyof HTMLElementEventMap} params.event
     * @param {(e: Event) => void} params.callback
     * @returns {DOMComposer}
     */
    setEvent({ event, callback }) {
        this.#events[event] = callback;

        return this;
    }

    /**
     * @param {Object} params
     * @param {string} params.text
     * @returns {DOMComposer}
     */
    setInnerText({ text }) {
        this.#content.innerText = text;

        return this;
    }

    /**
     * @param {Object} params
     * @param {string} params.html
     * @returns {DOMComposer}
     */
    setInnerHTML({ html }) {
        this.#content.innerHTML = html;

        return this;
    }

    /**
     * @param {DOMComposer} child
     * @returns {DOMComposer}
     */
    appendChild(child) {
        this.#children.push(child);

        return this;
    }

    /**
     * @returns {HTMLElement|SVGElement}
     */
    toHTMLElement() {
        if (!this.#tag) {
            throw new Error('Tag is not defined.');
        }

        const rootElement = this.#isSvgRelated
            ? document.createElementNS('http://www.w3.org/2000/svg', this.#tag)
            : document.createElement(this.#tag);

        /** @type {Array<{ node: DOMComposer, parentElement: null }>} */
        const stack = [{ node: this, parentElement: null }];

        const elementMap = new Map();
        elementMap.set(this, rootElement);

        while (stack.length > 0) {
            const { node, parentElement: _parentElement } = /** @type {{ node: DOMComposer, parentElement: null }} */ (stack.pop());
            const element = elementMap.get(node);

            for (const [event, callback] of Object.entries(node.#events)) {
                element.addEventListener(event, callback);
            }

            for (const [name, value] of Object.entries(node.#attribute)) {
                if (node.#isSvgRelated && value.namespace) {
                    element.setAttributeNS(value.namespace, name, value.value);
                } else {
                    element.setAttribute(name, value.value);
                }
            }

            if (node.#content.innerHTML) {
                element.innerHTML = node.#content.innerHTML;
            }
            if (!node.#isSvgRelated && node.#content.innerText) {
                element.innerText = node.#content.innerText;
            }

            for (const child of node.#children) {
                const childElement = child.#isSvgRelated
                    ? document.createElementNS('http://www.w3.org/2000/svg', /** @type {string} */(child.#tag))
                    : document.createElement(/** @type {string} */(child.#tag));

                elementMap.set(child, childElement);
                stack.push({ node: child, parentElement: element });
                element.appendChild(childElement);
            }
        }

        return rootElement;
    }
}

Object.setPrototypeOf(DOMComposer, null);
Object.setPrototypeOf(DOMComposer.prototype, null);