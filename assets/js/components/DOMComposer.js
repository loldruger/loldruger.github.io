//@ts-check

/** @typedef {'section'|'header'|'div'|'span'|'button'|'time'|'svg'|'path'|'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'a'|'b'|'p'} HTMLElementKind */

export class DOMComposer {
    /**
     * @type {HTMLElementKind}
     */
    #tag;

    /**
    * @type {Array<DOMComposer>}
    */
    #children = [];

    /**
     * @type {Record<string, string>}
     */
    #attribute = {};

    /**
     * @type {Record<keyof HTMLElementEventMap, (e: Event) => void>}
     */
    #events;

    /**
     * @private
     */
    constructor() { }

    /**
     * @param {HTMLElementKind} tag
     * @returns {DOMComposer}
     */
    static new(tag) {
        const composer = new DOMComposer();
        composer.#tag = tag;
        return composer;
    }

    /**
     * @param {HTMLElementKind} tag 
     * @param {string} raw 
     * @returns {DOMComposer}
     */
    static newRaw(tag, raw) {
        const composer = new DOMComposer();
        composer.#tag = tag;
        composer.#attribute.raw = raw;
        return composer;
    }

    /**
     * @param {Object} params
     * @param {string} params.name
     * @param {string} params.value
     */
    setAttribute({ name, value }) {
        this.#attribute[name] = value;

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
        this.#attribute.innerText = text;

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
     * @param {string} rawAttributes
     * @returns {DOMComposer}
     */
    appendChildRaw(rawAttributes) {
        return this;
    }

    /**
     * @param {DOMComposer} this
     * @returns {HTMLElement}
     */
    toHTMLElement(this) {
        const element = document.createElement(this.#tag);


        return element;
    }
}

Object.setPrototypeOf(DOMComposer, null);
Object.setPrototypeOf(DOMComposer.prototype, null);