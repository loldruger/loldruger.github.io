// @ts-check

/**
 * @param {Object} params
 * @param {keyof HTMLElementEventMap} params.event
 * @param {(e: Event) => void} params.callback
 * @returns {HTMLSpanElement}
 */
const createFoldingCircle = ({event, callback}) => {
    const circle = document.createElement('span');
    circle.className = 'folding-circle';
    circle.innerHTML = `
        <svg class="toggle-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15.5L18 9.5L16.6 8L12 12.7L7.4 8L6 9.5L12 15.5Z" />
        </svg>
    `;

    circle.addEventListener(event, callback);

    return circle;
};

export default createFoldingCircle;