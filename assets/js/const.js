//@ts-check
import DOMComposer from './DOMinator/DOMComposer.js';
import OptionButtons from './OptionButtons.js';
import { i18n } from './i18n/lib.js';
import { eventRegistry } from './DOMinator/EventRegistry.js';

const setTheme = eventRegistry.getEventCallback('change-theme') ?? (() => { console.error('No change-theme event registered'); });
const changeLang = eventRegistry.getEventCallback('change-lang') ?? (() => { console.error('No change-lang event registered'); });
const foldSection = eventRegistry.getEventCallback('fold-section') ?? (() => { console.error('No fold-section event registered'); });

const events = () => {
    const optionButtons = new OptionButtons();

    eventRegistry.register('change-theme', (event) => {
        event.preventDefault();
        optionButtons.setTheme(optionButtons.isDarkMode(), true);
    });

    eventRegistry.register('change-lang', (event) => {
        event.preventDefault();
        const langStored = (document.documentElement.lang.match(/en/i)) ? 'ko' : 'en';

        optionButtons.setLanguage(langStored, true);
    });

    eventRegistry.register('fold-section', (event) => {
        event.preventDefault();

        console.log(event.target);
    });
}

/** @type {Array<DOMComposer>} */
const resume = [];

resume.push(DOMComposer.new({ tag: 'header' })
    .setInnerText({ text: i18n.t('${resume.title}') })
);

resume.push(DOMComposer
    .new({ tag: 'div' })
    .setAttribute({ name: 'class', value: 'flexbox align-right-h mb-2' })
    .appendChild({
        child: DOMComposer.new({ tag: 'button' })
            .setAttribute({ name: 'id', value: 'dark-mode-button' })
            .setAttribute({ name: 'class', value: 'flexbox circle align-center-h align-center-v mr-2' })
            .setAttribute({ name: 'type', value: 'image' })
            .appendChild({
                child: DOMComposer.newRaw({ tag: 'svg', rawAttributes: `id="moon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="17" height="17" viewBox="0 0 17 17"` })
                    .appendChild({
                        child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M8.41667,16.6667C7.25,16.6667,6.15625,16.4444,5.13542,16C4.11458,15.5556,3.22569,14.9549,2.46875,14.1979C1.71181,13.441,1.11111,12.5521,0.666667,11.5312C0.222222,10.5104,0,9.41667,0,8.25C0,6.22222,0.645833,4.43403,1.9375,2.88542C3.22917,1.33681,4.875,0.375,6.875,0C6.625,1.375,6.70139,2.71875,7.10417,4.03125C7.50694,5.34375,8.20139,6.49306,9.1875,7.47917C10.1736,8.46528,11.3229,9.15972,12.6354,9.5625C13.9479,9.96528,15.2917,10.0417,16.6667,9.79167C16.3056,11.7917,15.3472,13.4375,13.7917,14.7292C12.2361,16.0208,10.4444,16.6667,8.41667,16.6667Z" fill="#566273" fill-opacity="1"` })
                    })
            })
            .appendChild({
                child: DOMComposer.newRaw({ tag: 'svg', rawAttributes: `id="sun" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="22" height="22" viewBox="0 0 22 22"` })
                    .appendChild({
                        child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M10,3C10,3,10,0,10,0C10,0,12,0,12,0C12,0,12,3,12,3C12,3,10,3,10,3ZM10,22C10,22,10,19,10,19C10,19,12,19,12,19C12,19,12,22,12,22C12,22,10,22,10,22ZM19,12C19,12,19,10,19,10C19,10,22,10,22,10C22,10,22,12,22,12C22,12,19,12,19,12ZM0,12C0,12,0,10,0,10C0,10,3,10,3,10C3,10,3,12,3,12C3,12,0,12,0,12ZM17.7,5.7C17.7,5.7,16.3,4.3,16.3,4.3C16.3,4.3,18.05,2.5,18.05,2.5C18.05,2.5,19.5,3.95,19.5,3.95C19.5,3.95,17.7,5.7,17.7,5.7ZM3.95,19.5C3.95,19.5,2.5,18.05,2.5,18.05C2.5,18.05,4.3,16.3,4.3,16.3C4.3,16.3,5.7,17.7,5.7,17.7C5.7,17.7,3.95,19.5,3.95,19.5ZM18.05,19.5C18.05,19.5,16.3,17.7,16.3,17.7C16.3,17.7,17.7,16.3,17.7,16.3C17.7,16.3,19.5,18.05,19.5,18.05C19.5,18.05,18.05,19.5,18.05,19.5ZM4.3,5.7C4.3,5.7,2.5,3.95,2.5,3.95C2.5,3.95,3.95,2.5,3.95,2.5C3.95,2.5,5.7,4.3,5.7,4.3C5.7,4.3,4.3,5.7,4.3,5.7ZM11,17C9.33333,17,7.91667,16.4167,6.75,15.25C5.58333,14.0833,5,12.6667,5,11C5,9.33333,5.58333,7.91667,6.75,6.75C7.91667,5.58333,9.33333,5,11,5C12.6667,5,14.0833,5.58333,15.25,6.75C16.4167,7.91667,17,9.33333,17,11C17,12.6667,16.4167,14.0833,15.25,15.25C14.0833,16.4167,12.6667,17,11,17Z" fill="#566273" fill-opacity="1"` })
                    })
            })
            .setEvent({ event: 'click', callback: setTheme, alias: 'change-theme' })
    })
    .appendChild({
        child: DOMComposer.new({ tag: 'button' })
            .setAttribute({ name: 'id', value: 'change-lang-button' })
            .setAttribute({ name: 'class', value: 'flexbox circle align-center-h align-center-v mr-1' })
            .setAttribute({ name: 'type', value: 'image' })
            .appendChild({
                child: DOMComposer.newRaw({ tag: 'svg', rawAttributes: `id="lang-ko" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10.825 11.4" width="1em" height="0.9em"` })
                    .appendChild({ child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M 3.525 6.275 C 3.958 6.275 4.329 6.179 4.637 5.988 C 4.946 5.796 5.1 5.508 5.1 5.125 C 5.1 4.742 4.946 4.45 4.637 4.25 C 4.329 4.05 3.958 3.95 3.525 3.95 C 3.092 3.95 2.721 4.05 2.412 4.25 C 2.104 4.45 1.95 4.742 1.95 5.125 C 1.95 5.508 2.104 5.796 2.412 5.988 C 2.721 6.179 3.092 6.275 3.525 6.275 Z M 0 2.5 C 0 2.5 0 1.4 0 1.4 C 0 1.4 2.85 1.4 2.85 1.4 C 2.85 1.4 2.85 0 2.85 0 C 2.85 0 4.15 0 4.15 0 C 4.15 0 4.15 1.4 4.15 1.4 C 4.15 1.4 7.025 1.4 7.025 1.4 C 7.025 1.4 7.025 2.5 7.025 2.5 C 7.025 2.5 0 2.5 0 2.5 Z M 3.525 7.375 C 2.742 7.375 2.071 7.179 1.513 6.787 C 0.954 6.396 0.675 5.842 0.675 5.125 C 0.675 4.392 0.954 3.833 1.513 3.45 C 2.071 3.067 2.742 2.875 3.525 2.875 C 4.325 2.875 5.004 3.067 5.563 3.45 C 6.121 3.833 6.4 4.392 6.4 5.125 C 6.4 5.858 6.121 6.417 5.563 6.8 C 5.004 7.183 4.325 7.375 3.525 7.375 Z M 1.7 11.4 C 1.7 11.4 1.7 7.9 1.7 7.9 C 1.7 7.9 3.025 7.9 3.025 7.9 C 3.025 7.9 3.025 10.3 3.025 10.3 C 3.025 10.3 9.625 10.3 9.625 10.3 C 9.625 10.3 9.625 11.4 9.625 11.4 C 9.625 11.4 1.7 11.4 1.7 11.4 Z M 7.825 8.775 C 7.825 8.775 7.825 0 7.825 0 C 7.825 0 9.1 0 9.1 0 C 9.1 0 9.1 3.75 9.1 3.75 C 9.1 3.75 10.825 3.75 10.825 3.75 C 10.825 3.75 10.825 4.85 10.825 4.85 C 10.825 4.85 9.125 4.85 9.125 4.85 C 9.125 4.85 9.125 8.775 9.125 8.775 C 9.125 8.775 7.825 8.775 7.825 8.775 Z" fill="#566273" fill-opacity="1"` }) })
            })
            .appendChild({
                child: DOMComposer.newRaw({ tag: 'svg', rawAttributes: `id="lang-en" xmlns="http://www.w3.org/2000/svg" viewBox="12.025 0.1 8.225 10.95" width="8.225px" height="10.95px"` })
                    .appendChild({ child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M 15.675 9.35 C 16.142 9.35 16.596 9.242 17.038 9.025 C 17.479 8.808 17.883 8.5 18.25 8.1 C 18.25 8.1 18.25 5.45 18.25 5.45 C 17.867 5.5 17.513 5.558 17.188 5.625 C 16.862 5.692 16.558 5.767 16.275 5.85 C 15.525 6.083 14.962 6.375 14.587 6.725 C 14.212 7.075 14.025 7.483 14.025 7.95 C 14.025 8.383 14.175 8.725 14.475 8.975 C 14.775 9.225 15.175 9.35 15.675 9.35 Z M 15.1 11.05 C 14.15 11.05 13.4 10.779 12.85 10.238 C 12.3 9.696 12.025 8.958 12.025 8.025 C 12.025 7.158 12.3 6.45 12.85 5.9 C 13.4 5.35 14.283 4.908 15.5 4.575 C 15.883 4.475 16.304 4.383 16.763 4.3 C 17.221 4.217 17.717 4.142 18.25 4.075 C 18.217 3.292 18.033 2.721 17.7 2.362 C 17.367 2.004 16.85 1.825 16.15 1.825 C 15.717 1.825 15.288 1.904 14.863 2.063 C 14.438 2.221 13.892 2.5 13.225 2.9 C 13.225 2.9 12.425 1.5 12.425 1.5 C 12.975 1.083 13.621 0.746 14.363 0.488 C 15.104 0.229 15.858 0.1 16.625 0.1 C 17.808 0.1 18.708 0.467 19.325 1.2 C 19.942 1.933 20.25 3 20.25 4.4 C 20.25 4.4 20.25 10.825 20.25 10.825 C 20.25 10.825 18.575 10.825 18.575 10.825 C 18.575 10.825 18.425 9.7 18.425 9.7 C 17.958 10.117 17.446 10.446 16.888 10.688 C 16.329 10.929 15.733 11.05 15.1 11.05 Z" fill="#566273" fill-opacity="1"` }) })
            })
            .setEvent({ event: 'click', callback: changeLang, alias: 'change-lang' })
    })
);

resume.push(DOMComposer.new({ tag: 'time' })
    .setAttribute({ name: 'id', value: 'last-update' })
    .setAttribute({ name: 'class', value: 'block text-align-right-h' })
    .setInnerText({ text: i18n.t('${resume.lastUpdate}') + ': ' })
);

const foldingCircle = DOMComposer.new({ tag: 'span' })
    .setAttribute({ name: 'class', value: 'folding-circle' })
    .appendChild({
        child: DOMComposer.newRaw({ tag: 'svg', rawAttributes: `class="toggle-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"` })
            .appendChild({ child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M12 15.5L18 9.5L16.6 8L12 12.7L7.4 8L6 9.5L12 15.5Z"` }) })
    });

const sectionProfile = DOMComposer.new({ tag: 'section' })
    .appendChild({
        child: DOMComposer.new({ tag: 'div' })
            .appendChild({
                child: DOMComposer.new({ tag: 'h1' }).setInnerText({ text: i18n.t('${resume.profile.title}') })
            })
    })
    .appendChild({
        child: DOMComposer.new({ tag: 'div' })
            .setAttribute({ name: 'class', value: 'content-list' })
            .appendChild({
                child: DOMComposer.new({ tag: 'div' })
                    .setAttribute({ name: 'class', value: 'content-body' })
                    .appendChild({
                        child: DOMComposer.new({ tag: 'div' })
                            .setAttribute({ name: 'class', value: 'flexbox flex-column indent' })
                            .setAttribute({ name: 'level', value: '1' })
                            .appendChild({
                                child: DOMComposer.new({ tag: 'div' })
                                    .setInnerHTML({ html: '<b>Name:</b>' + ' ' + i18n.t('${resume.profile.name}') })
                            })
                            .appendChild({
                                child: DOMComposer.new({ tag: 'div' })
                                    .setInnerHTML({ html: '<b>e-mail:</b><a class="inline-flexbox align-center-v" href="mailto:${resume.profile.email}"> ${resume.profile.email}</a>' })
                                    .appendChild({
                                        child: DOMComposer.new({ tag: 'span' })
                                            .setAttribute({ name: 'class', value: 'ml-1 mt-1' })
                                            .appendChild({
                                                child: DOMComposer.newRaw({ tag: 'svg', rawAttributes: `id="contact-email" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="20" height="17" viewBox="0 0 20 17"` })
                                                    .appendChild({
                                                        child: DOMComposer.new({ tag: 'g' })
                                                            .appendChild({ child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M16,17C16,17,14.6,15.6,14.6,15.6C14.6,15.6,16.175,14,16.175,14C16.175,14,12,14,12,14C12,14,12,12,12,12C12,12,16.175,12,16.175,12C16.175,12,14.6,10.4,14.6,10.4C14.6,10.4,16,9,16,9C16,9,20,13,20,13C20,13,16,17,16,17ZM8.4,8C8.4,8,15,4.15,15,4.15C15,4.15,15,2,15,2C15,2,14.75,2,14.75,2C14.75,2,8.4,5.675,8.4,5.675C8.4,5.675,2.225,2,2.225,2C2.225,2,2,2,2,2C2,2,2,4.2,2,4.2C2,4.2,8.4,8,8.4,8ZM1.875,14C1.35833,14,0.916667,13.8167,0.55,13.45C0.183333,13.0833,0,12.6417,0,12.125C0,12.125,0,1.875,0,1.875C0,1.35833,0.183333,0.916667,0.55,0.55C0.916667,0.183333,1.35833,0,1.875,0C1.875,0,15.125,0,15.125,0C15.6417,0,16.0833,0.183333,16.45,0.55C16.8167,0.916667,17,1.35833,17,1.875C17,1.875,17,7.1,17,7.1C16.8333,7.06667,16.6667,7.04167,16.5,7.025C16.3333,7.00833,16.1667,7,16,7C14.3667,7,12.9583,7.5875,11.775,8.7625C10.5917,9.9375,10,11.35,10,13C10,13.1667,10.0083,13.3333,10.025,13.5C10.0417,13.6667,10.0667,13.8333,10.1,14C10.1,14,1.875,14,1.875,14Z" fill-opacity="1"` }) })
                                                    })
                                            })
                                    })
                            })
                    })
            })
    });

function sectionEdu() {
    const section = DOMComposer.new({ tag: 'section' })
        .appendChild({
            child: DOMComposer.new({ tag: 'div' })
                .setAttribute({ name: 'class', value: 'flexbox align-center-v inline' })
                .appendChild({
                    child: DOMComposer.new({ tag: 'div' })
                        .setAttribute({ name: 'class', value: 'title-area' })
                        .appendChild({
                            child: DOMComposer.new({ tag: 'h1' })
                                .setAttribute({ name: 'class', value: 'inline' })
                                .setInnerText({ text: i18n.t('${resume.education.title}') })
                        })
                        .appendChild({
                            child: DOMComposer.new({ tag: 'time' })
                                .setAttribute({ name: 'class', value: 'indent date' })
                                .setAttribute({ name: 'level', value: '0.5' })
                                .setInnerText({ text: i18n.t('${resume.education.date}') })
                        })
                })
                .appendChild({ child: foldingCircle })
                .setEvent({ event: 'click', callback: foldSection, alias: 'fold-section' })

        })

    return section;
}

resume.push(sectionProfile);
resume.push(sectionEdu());

export { resume, events };