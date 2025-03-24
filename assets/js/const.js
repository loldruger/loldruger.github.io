//@ts-check
import { i18n } from './i18n/lib.js';
import { DOMComposer } from './components/DOMComposer.js';

const template = () => {
    const header = DOMComposer.new('header')
        .setInnerText({ text: i18n.t('${resume.title}') })

    const optionButtons = DOMComposer.new('section')
        .appendChild(DOMComposer.new('div')
            .setAttribute({ name: 'class', value: 'flexbox align-right-h mb-2' })
            .appendChild(DOMComposer.new('button')
                .setAttribute({ name: 'id', value: 'dark-mode-button' })
                .setAttribute({ name: 'class', value: 'flexbox circle align-center-h align-center-v mr-2' })
                .setAttribute({ name: 'type', value: 'image' })
                .appendChild(DOMComposer.newRaw('svg', `id="moon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="17" height="17" viewBox="0 0 17 17"`)
                    .appendChild(DOMComposer.newRaw('path', `d="M8.41667,16.6667C7.25,16.6667,6.15625,16.4444,5.13542,16C4.11458,15.5556,3.22569,14.9549,2.46875,14.1979C1.71181,13.441,1.11111,12.5521,0.666667,11.5312C0.222222,10.5104,0,9.41667,0,8.25C0,6.22222,0.645833,4.43403,1.9375,2.88542C3.22917,1.33681,4.875,0.375,6.875,0C6.625,1.375,6.70139,2.71875,7.10417,4.03125C7.50694,5.34375,8.20139,6.49306,9.1875,7.47917C10.1736,8.46528,11.3229,9.15972,12.6354,9.5625C13.9479,9.96528,15.2917,10.0417,16.6667,9.79167C16.3056,11.7917,15.3472,13.4375,13.7917,14.7292C12.2361,16.0208,10.4444,16.6667,8.41667,16.6667Z" fill="#566273" fill-opacity="1"`))
                )
            )
            .appendChild(DOMComposer.new('button')
                .setAttribute({ name: 'id', value: 'lang-change-button' })
                .setAttribute({ name: 'class', value: 'flexbox circle align-center-h align-center-v mr-2' })
                .setAttribute({ name: 'type', value: 'image' })
                .appendChild(DOMComposer.newRaw('svg', `id="moon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="17" height="17" viewBox="0 0 17 17"`)
                    .appendChild(DOMComposer.newRaw('path', `d="M8.41667,16.6667C7.25,16.6667,6.15625,16.4444,5.13542,16C4.11458,15.5556,3.22569,14.9549,2.46875,14.1979C1.71181,13.441,1.11111,12.5521,0.666667,11.5312C0.222222,10.5104,0,9.41667,0,8.25C0,6.22222,0.645833,4.43403,1.9375,2.88542C3.22917,1.33681,4.875,0.375,6.875,0C6.625,1.375,6.70139,2.71875,7.10417,4.03125C7.50694,5.34375,8.20139,6.49306,9.1875,7.47917C10.1736,8.46528,11.3229,9.15972,12.6354,9.5625C13.9479,9.96528,15.2917,10.0417,16.6667,9.79167C16.3056,11.7917,15.3472,13.4375,13.7917,14.7292C12.2361,16.0208,10.4444,16.6667,8.41667,16.6667Z" fill="#566273" fill-opacity="1"`))
                )
            )
        )
    const lastUpdate = DOMComposer.new('time')
        .setAttribute({ name: 'id', value: 'last-update' })
        .setAttribute({ name: 'class', value: 'block text-align-right-h' })
        .setInnerText({ text: i18n.t('${resume.lastUpdated}') })
}
