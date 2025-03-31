//@ts-check
import DOMComposer from './DOMinator/DOMComposer.js';
import OptionButtons from './OptionButtons.js';
import { eventRegistry } from './DOMinator/EventRegistry.js';
import { i18n } from './i18n/lib.js';

/**
 * @typedef {object} ProgressStrings Represents strings related to project progress display.
 * @property {string} projectHeader Label for the project column/section.
 * @property {string} progressHeader Label for the progress column/section.
 * @property {string} periodHeader Label for the period column/section.
 */

/**
 * @typedef {object} GeneralStrings Represents general information strings.
 * @property {string} resume Label for "Résumé".
 * @property {string} name Label for "Name".
 * @property {string} email Label for "e-mail".
 * @property {string} lastUpdate Label for "Last Update".
 */

/**
 * @typedef {object} EducationStrings Represents education-related strings.
 * @property {string} university Label for "University".
 * @property {string} major Label for "Major".
 * @property {string} graduation Label for "Graduation".
 * @property {string} gpa Label for "GPA".
 */

/**
 * @typedef {object} ProjectStrings Represents project-related strings.
 * @property {string} developer Label for "Developer" role.
 * @property {string} mainDeveloper Label for "Main Developer" role.
 * @property {string} mainArtistAndSubDev Label for "Main Artist & Sub Dev" role.
 * @property {string} mainArtist Label for "Main Artist" role.
 * @property {string} gameDesigner Label for "Game Designer" role.
 * @property {string} backendStack Label for "Backend Stacks".
 * @property {string} frontendStack Label for "Frontend Stacks".
 * @property {string} platforms Label for "Platforms".
 * @property {string} stacks Label for "Stacks".
 * @property {string} additionalInfo Label for "additional info".
 * @property {string} stacksProficiency Label for "Stacks I Experienced...".
 * @property {ProgressStrings} progress Contains strings for the progress display section.
 */

/**
 * @typedef {object} FetchedCommonData Contains common string definitions grouped by category.
 * @property {object} common
 * @property {GeneralStrings} common.general General information strings.
 * @property {EducationStrings} common.education Education related strings.
 * @property {ProjectStrings} common.projects Project related strings.
 */

/**
 * @typedef {object} RootJsonStructure
 * @property {FetchedCommonData} common
 */

//////////////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {object} ResumeProfile
 * @property {string} title
 * @property {string} name
 * @property {string} email
 */

/**
 * @typedef {object} ResumeEducation
 * @property {string} title
 * @property {string} university
 * @property {string} major
 * @property {string} graduation
 * @property {string} gpa
 * @property {string} [date]
 */

/**
 * @typedef {object} ResumeStack
 * @property {string} lang
 * @property {number} level
 */

/**
 * @typedef {object} ResumeExperienceItemDetail
 * @property {string} title
 * @property {string} duration
 * @property {Array<ResumeStack>} [stacks]
 * @property {string | Array<string>} contents
 */

/**
 * @typedef {object} ResumeExperienceItem
 * @property {string} company
 * @property {string} jobTitle
 * @property {string} division
 * @property {string} [resignedFor]
 * @property {string} duration
 * @property {Array<ResumeExperienceItemDetail>} experiences
 */

/**
 * @typedef {object} ResumeWorkExperience
 * @property {string} title
 * @property {string} [duration]
 * @property {Array<ResumeExperienceItem>} items
 */

/**
 * @typedef {object} ResumeProjectItem
 * @property {string} title
 * @property {string} duration
 * @property {Array<string>} [participants]
 * @property {Array<ResumeStack>} [stacks]
 * @property {Array<ResumeStack>} [backendStacks]
 * @property {Array<ResumeStack>} [frontendStacks]
 * @property {Array<{lang: string, level: number}>} [platforms]
 * @property {string | Array<string>} [contents]
 * @property {string} [repoLink]
 * @property {string} [repoImageSrc]
 * @property {boolean} [isWip]
 * @property {boolean} [isPending]
 * @property {boolean} [isMaintaining]
 */

/**
 * @typedef {object} ResumeProjects
 * @property {string} title
 * @property {string} [duration]
 * @property {Array<ResumeProjectItem>} items
 */

/**
 * @typedef {object} ResumeCertificationItem
 * @property {string} name
 * @property {string} date
 */

/**
 * @typedef {object} ResumeCertifications
 * @property {string} title
 * @property {string} [duration]
 * @property {Array<ResumeCertificationItem>} items
 */

/**
 * @typedef {object} ResumeSkillItem
 * @property {string} skill
 * @property {number} level
 */

/**
 * @typedef {object} ResumeSkillCategory
 * @property {string} name
 * @property {Array<ResumeSkillItem>} items
 */

/**
 * @typedef {object} ResumeSkills
 * @property {string} title
 * @property {string} [subTitle]
 * @property {Array<ResumeSkillCategory>} categories
 */

/**
 * @typedef {object} ResumeProjectProgressItem
 * @property {string} name
 * @property {number} progress
 * @property {string} [color]
 * @property {string} period
 */

/**
 * @typedef {object} ResumeProjectProgress
 * @property {string} title
 * @property {string} [subTitle]
 * @property {Array<ResumeProjectProgressItem>} items
 */


/**
 * @typedef {object} ResumeStructure
 * @property {string} title
 * @property {string} lastUpdate
 * @property {ResumeProfile} profile
 * @property {ResumeEducation} education
 * @property {ResumeWorkExperience} workExperience
 * @property {ResumeProjects} currentProjects
 * @property {ResumeProjects} maintainingProjects
 * @property {ResumeProjects} previousProjects
 * @property {ResumeCertifications} certifications
 * @property {ResumeSkills} skills
 * @property {ResumeProjectProgress} projectProgress
 */

/**
 * @typedef {object} FetchedResumeData
 * @property {ResumeStructure} resume
 */

const events = () => {
    const optionButtons = new OptionButtons();


    eventRegistry.register('change-theme', (event) => {
        event.preventDefault();

        const currentlyDark = optionButtons.isDarkMode();
        optionButtons.setTheme(!currentlyDark, true); // Toggle the theme
    });

    eventRegistry.register('change-lang', (event) => {
        event.preventDefault();

        const currentLang = document.documentElement.lang;
        const nextLang = currentLang.toLowerCase().startsWith('en') ? 'ko' : 'en';
        optionButtons.setLanguage(nextLang, true);
    });

    eventRegistry.register('fold-section', (event) => {
        if (!(event instanceof Event) || !(event.target instanceof Element)) return;
        event.preventDefault();
        event.target.parentElement?.classList.toggle('folded');

        const section = event.target.closest('section')?.getElementsByClassName('content-body')[0];
        if (section) {
            section.classList.toggle('rolled-up');
        }
    });

    eventRegistry.register('scroll-to-top', (event) => {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

// Retrieve callbacks for use in DOMComposer.setEvent
const setThemeCallback = eventRegistry.getEventCallback('change-theme');
const changeLangCallback = eventRegistry.getEventCallback('change-lang');
const foldSectionCallback = eventRegistry.getEventCallback('fold-section');
const scrollToTopCallback = eventRegistry.getEventCallback('scroll-to-top');

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
};


const createScrollToTopButton = () => {
    return DOMComposer.new({ tag: 'button' })
        .setAttribute({ name: 'id', value: 'scroll-to-top-btn' })
        .setAttribute({ name: 'class', value: 'scroll-to-top-btn' })
        .setAttribute({ name: 'title', value: 'Scroll to top' })
        .setAttribute({ name: 'type', value: 'button' })
        .appendChild({
            child: DOMComposer.newRaw({ tag: 'svg', rawAttributes: `xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 20" fill="#fff"` })
                .appendChild({ child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M12 4l-8 8 2 2 6-6 6 6 2-2-8-8z"` }) })
        })
        .setEvent({ event: 'click', callback: scrollToTopCallback, alias: 'scroll-to-top' });
};

const createFoldingCircle = () => {
    // Use newRaw as per user's latest code example for consistency
    const svgIcon = DOMComposer.newRaw({ tag: 'svg', rawAttributes: `class="toggle-icon" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"` })
        .appendChild({ child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M12 15.5L18 9.5L16.6 8L12 12.7L7.4 8L6 9.5L12 15.5Z"` }) });

    return DOMComposer.new({ tag: 'span' })
        .setAttribute({ name: 'class', value: 'folding-circle' })
        .appendChild({ child: svgIcon })
        .setEvent({ event: 'click', callback: foldSectionCallback, alias: 'fold-section' });
};

/**
 * @param {{lang: string, level: number}} stack 
 * @returns {DOMComposer}
 */
const createStackItem = (stack) => {
    const strengthHtml = `<strength level="${stack.level}">${escapeHtml(stack.lang)}</strength>`;
    return DOMComposer.new({ tag: 'span' })
        .setAttribute({ name: 'class', value: 'inline-flexbox' })
        .setInnerHTML({ html: strengthHtml });
};

/** Creates a participant list item using setInnerHTML for <a> and <strong> tags */
const createParticipantItem = (/** @type {string} */ participantHtml) => {
    // Assuming participantHtml contains raw HTML like "Backend Developer: <a...>..."
    return DOMComposer.new({ tag: 'div' }).setInnerHTML({ html: participantHtml });
};

/** Creates platform list item using setInnerHTML for <strength> tag */
const createPlatformItem = (/** @type {{lang: string, level: number}} */ platform) => {
    const strengthHtml = `<strength level="${platform.level}">${escapeHtml(platform.lang)}</strength>`;
    return DOMComposer.new({ tag: 'span' })
        .setAttribute({ name: 'class', value: 'inline-flexbox' })
        .setInnerHTML({ html: strengthHtml });
};

/** Creates a content paragraph using setInnerHTML for <highlight> tag */
const createContentParagraph = (/** @type {string} */ contentString) => {
    // Assuming contentString already contains HTML like <highlight>
    return DOMComposer.new({ tag: 'p' }).setInnerHTML({ html: contentString });
};

/**
 * Creates a section structure with optional folding
 * @param {object} params
 * @param {DOMComposer} params.titleContent - Composer for the title area (can be a fragment).
 * @param {DOMComposer} params.bodyContent - Composer for the body content (can be a fragment).
 * @param {boolean} [params.requiresFolding=true] - Whether to add the folding circle.
 * @param {boolean} [params.hasSubtitle=false] - Whether the title area contains an h2 subtitle.
 * @returns {DOMComposer}
 */
const createSectionFrame = ({ titleContent, bodyContent, requiresFolding = true, hasSubtitle = false }) => {
    const titleAreaDiv = DOMComposer.new({ tag: 'div' })
        .setAttribute({ name: 'class', value: hasSubtitle ? 'title-area with-subtitle' : 'title-area' })
        .appendChild({ child: titleContent });

    const headerDiv = DOMComposer.new({ tag: 'div' })
        .setAttribute({ name: 'class', value: 'flexbox align-center-v inline' })
        .appendChild({ child: titleAreaDiv });

    if (requiresFolding) {
        headerDiv.appendChild({ child: createFoldingCircle() });
    }

    const bodyArea = DOMComposer.new({ tag: 'div' })
        .setAttribute({ name: 'class', value: 'content-body' })
        .appendChild({ child: bodyContent }); // Append the body fragment/composer here

    const contentList = DOMComposer.new({ tag: 'div' })
        .setAttribute({ name: 'class', value: 'content-list' })
        .appendChild({ child: bodyArea });

    return DOMComposer.new({ tag: 'section' })
        .appendChild({ child: headerDiv })
        .appendChild({ child: contentList });
};


// --- Section Creation Functions ---

/**
 * @param {ResumeProfile} profileData
 * @param {GeneralStrings} commonData 
 * @returns {DOMComposer}
 */
const createProfileSection = (profileData, commonData) => {
    const titleContent = DOMComposer.new({ tag: 'h1' })
        .setInnerText({ text: i18n.t(profileData.title) }); // Assuming title is a key or already translated

    const bodyContent = DOMComposer.new({ tag: 'div' })
        .setAttribute({ name: 'class', value: 'indent flexbox flex-column gap-1' })
        .setAttribute({ name: 'level', value: '1' })
        .appendChild({
            child: DOMComposer.new({ tag: 'div' })
                .setInnerHTML({ html: `<b>${i18n.t(commonData.name)}:</b> ${escapeHtml(i18n.t(profileData.name))}` }) // Use escapeHtml for safety if name isn't trusted HTML
        })
        .appendChild({
            child: DOMComposer.new({ tag: 'div' })
                .setInnerHTML({ html: `<b>${i18n.t(commonData.email)}: </b><a class="inline-flexbox align-center-v" href="mailto:${profileData.email}"> ${escapeHtml(profileData.email)}</a>` })
                .appendChild({
                    child: DOMComposer.new({ tag: 'span' })
                        .setAttribute({ name: 'class', value: 'ml-1 mt-1' })
                        .appendChild({
                            child: DOMComposer.newRaw({ tag: 'svg', rawAttributes: `id="contact-email" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="20" height="17" viewBox="0 0 20 17"` })
                                .appendChild({ child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M16,17C16,17,14.6,15.6,14.6,15.6C14.6,15.6,16.175,14,16.175,14C16.175,14,12,14,12,14C12,14,12,12,12,12C12,12,16.175,12,16.175,12C16.175,12,14.6,10.4,14.6,10.4C14.6,10.4,16,9,16,9C16,9,20,13,20,13C20,13,16,17,16,17ZM8.4,8C8.4,8,15,4.15,15,4.15C15,4.15,15,2,15,2C15,2,14.75,2,14.75,2C14.75,2,8.4,5.675,8.4,5.675C8.4,5.675,2.225,2,2.225,2C2.225,2,2,2,2,2C2,2,2,4.2,2,4.2C2,4.2,8.4,8,8.4,8ZM1.875,14C1.35833,14,0.916667,13.8167,0.55,13.45C0.183333,13.0833,0,12.6417,0,12.125C0,12.125,0,1.875,0,1.875C0,1.35833,0.183333,0.916667,0.55,0.55C0.916667,0.183333,1.35833,0,1.875,0C1.875,0,15.125,0,15.125,0C15.6417,0,16.0833,0.183333,16.45,0.55C16.8167,0.916667,17,1.35833,17,1.875C17,1.875,17,7.1,17,7.1C16.8333,7.06667,16.6667,7.04167,16.5,7.025C16.3333,7.00833,16.1667,7,16,7C14.3667,7,12.9583,7.5875,11.775,8.7625C10.5917,9.9375,10,11.35,10,13C10,13.1667,10.0083,13.3333,10.025,13.5C10.0417,13.6667,10.0667,13.8333,10.1,14C10.1,14,1.875,14,1.875,14Z" fill="#566273" fill-opacity="1"` }) }) // Assuming fill is static
                        })
                })
        });

    // Profile section typically doesn't fold
    return createSectionFrame({ titleContent, bodyContent, requiresFolding: false });
};

/**
 * @param {ResumeEducation} eduData 
 * @param {EducationStrings} commonData
 * @returns {DOMComposer}
 */
const createEducationSection = (eduData, commonData) => {
    // Title and Date in the header area
    const title = DOMComposer.new({ tag: 'h1' })
        .setAttribute({ name: 'class', value: 'inline' })
        .setInnerText({ text: i18n.t(eduData.title) });
    // Check if 'date' property exists before creating the time element
    const date = eduData.date ? DOMComposer.new({ tag: 'time' })
        .setAttribute({ name: 'class', value: 'indent date' })
        .setAttribute({ name: 'level', value: '0.5' })
        .setInnerText({ text: i18n.t(eduData.date) }) : null;

    const titleContent = DOMComposer.fragment().appendChild({ child: title });
    if (date) {
        titleContent.appendChild({ child: date });
    }

    // Body content with details
    const bodyContent = DOMComposer.new({ tag: 'div' })
        .setAttribute({ name: 'class', value: 'indent flexbox flex-column gap-1' })
        .setAttribute({ name: 'level', value: '1' });

    /**
     * @param {string} labelKey 
     * @param {string} value 
     * @returns {DOMComposer}
     */
    const createInfoDiv = (labelKey, value) => {
        // Translate label using i18n.t, value directly from data (assuming already translated or language-specific)
        const label = i18n.t(labelKey); // Example key: 'education.universityLabel'
        return DOMComposer.new({ tag: 'div' })
            .setInnerHTML({ html: `<b>${escapeHtml(label)}:</b> ${escapeHtml(value)}` });
    };

    bodyContent.appendChild({ child: createInfoDiv(commonData.university, eduData.university) });
    bodyContent.appendChild({ child: createInfoDiv(commonData.major, eduData.major) });
    bodyContent.appendChild({ child: createInfoDiv(commonData.graduation, eduData.graduation) });
    bodyContent.appendChild({ child: createInfoDiv(commonData.gpa, eduData.gpa) });

    return createSectionFrame({ titleContent, bodyContent });
};

/**
 * @param {ResumeWorkExperience} workData 
 * @param {ProjectStrings} commonData
 * @returns {DOMComposer}
 */
const createWorkExperienceSection = (workData, commonData) => {
    const title = DOMComposer.new({ tag: 'h1' })
        .setAttribute({ name: 'class', value: 'inline' })
        .setInnerText({ text: i18n.t(workData.title) });

    const overallDuration = DOMComposer.new({ tag: 'time' })
        .setAttribute({ name: 'class', value: 'indent date' })
        .setAttribute({ name: 'level', value: '0.5' })
        .setInnerText({ text: i18n.t(workData.duration) });

    const titleContent = DOMComposer.fragment().appendChild({ child: title });
    titleContent.appendChild({ child: overallDuration });

    const bodyContent = DOMComposer.fragment(); // Use fragment to append multiple company blocks

    (workData.items || []).forEach(item => {
        const companyHeader = DOMComposer.new({ tag: 'h1' })
            .setAttribute({ name: 'class', value: 'company-name inline' })
            .setInnerText({ text: i18n.t(item.company) });

        const companyDuration = DOMComposer.new({ tag: 'time' })
            .setAttribute({ name: 'class', value: 'indent date' })
            .setAttribute({ name: 'level', value: '0.5' })
            .setInnerText({ text: i18n.t(item.duration) });

        const divisionInfo = DOMComposer.new({ tag: 'div' })
            .setAttribute({ name: 'class', value: 'indent mt-1 mb-1' })
            .setAttribute({ name: 'level', value: '1' });

        divisionInfo.appendChild({
            child: DOMComposer.new({ tag: 'div' })
                .setAttribute({ name: 'class', value: 'division-name' })
                .setInnerText({ text: `${i18n.t(item.jobTitle)} | ${i18n.t(item.division)}` })
        });

        divisionInfo.appendChild({
            child: DOMComposer.new({ tag: 'div' })
                .setInnerText({ text: i18n.t(item.resignedFor) })
        });

        const experiencesContainer = DOMComposer.fragment();
        (item.experiences || []).forEach(exp => {
            const stackContainer = DOMComposer.new({ tag: 'div' })
                .setAttribute({ name: 'class', value: 'mt-2 gap-1' })
                .setInnerHTML({ html: `<span>${i18n.t(commonData.stacks)}: </span>` });
            (exp.stacks || []).forEach(stack => {
                stackContainer.appendChild({ child: createStackItem(stack) });
            });

            const contentContainer = DOMComposer.new({ tag: 'div' })
                .setAttribute({ name: 'class', value: 'content' });
            // Set 'from' and 'to' attributes if duration exists
            if (exp.duration) {
                const dates = exp.duration.split(' ~ ');
                contentContainer.setAttribute({ name: 'from', value: dates[0] });
                if (dates[1]) {
                    contentContainer.setAttribute({ name: 'to', value: dates[1] });
                }
            }
            // Ensure contents is treated as an array
            const contentsArray = Array.isArray(exp.contents) ? exp.contents : (exp.contents ? [exp.contents] : []);
            contentsArray.forEach(contentHtml => {
                contentContainer.appendChild({ child: createContentParagraph(contentHtml) }); // Assumes contentHtml is pre-formatted HTML
            });


            const experienceItem = DOMComposer.new({ tag: 'div' })
                .setAttribute({ name: 'class', value: 'experience-item' })
                .appendChild({
                    child: DOMComposer.new({ tag: 'div' })
                        .setAttribute({ name: 'class', value: 'title' })
                        .setInnerText({ text: i18n.t(exp.title) })
                })
                .appendChild({
                    child: DOMComposer.new({ tag: 'time' })
                        .setAttribute({ name: 'class', value: 'indent date' })
                        .setAttribute({ name: 'level', value: '1' })
                        .setInnerText({ text: i18n.t(exp.duration) })
                });

            // Only append stackContainer if there are stacks
            if (exp.stacks && exp.stacks.length > 0) {
                experienceItem.appendChild({ child: stackContainer });
            }
            // Only append contentContainer if there is content
            if (contentsArray.length > 0) {
                experienceItem.appendChild({ child: contentContainer });
            }

            experiencesContainer.appendChild({ child: experienceItem });
        });

        const companyContainer = DOMComposer.new({ tag: 'div' })
            .setAttribute({ name: 'class', value: 'indent' })
            .setAttribute({ name: 'level', value: '1' });
        // Set 'from' and 'to' attributes for the company block based on item.duration
        if (item.duration) {
            const dates = item.duration.split(' ~ ');
            companyContainer.setAttribute({ name: 'from', value: dates[0] });
            if (dates[1]) {
                companyContainer.setAttribute({ name: 'to', value: dates[1] });
            }
        }

        companyContainer
            .appendChild({
                child: DOMComposer.new({ tag: 'div' })
                    .setAttribute({ name: 'class', value: 'title-area' })
                    .appendChild({ child: companyHeader })
                    .appendChild({ child: companyDuration })
            })
            .appendChild({ child: divisionInfo })
            .appendChild({ child: experiencesContainer });

        bodyContent.appendChild({ child: companyContainer });
    });

    return createSectionFrame({ titleContent, bodyContent });
};

/**
 * @param {NonNullable<ResumeProjects>} projectData 
 * @param {ProjectStrings} commonData
 * @returns {DOMComposer}
 */
const createProjectSection = (projectData, commonData) => {
    const title = DOMComposer.new({ tag: 'h1' })
        .setAttribute({ name: 'class', value: 'inline' })
        .setInnerText({ text: i18n.t(projectData.title) });
    const overallDuration = DOMComposer.new({ tag: 'time' })
        .setAttribute({ name: 'class', value: 'indent date' })
        .setAttribute({ name: 'level', value: '1' })
        .setInnerText({ text: i18n.t(projectData.duration) });

    const titleContent = DOMComposer.fragment().appendChild({ child: title });
    titleContent.appendChild({ child: overallDuration });

    const bodyContent = DOMComposer.fragment();

    (projectData.items || []).forEach(item => {
        const projectItemContainer = DOMComposer.new({ tag: 'div' })
            .setAttribute({ name: 'class', value: 'indent' })
            .setAttribute({ name: 'level', value: '1' });

        // Set attributes like from, to, isWip, etc.
        if (item.duration) {
            const dates = item.duration.split(' ~ ');
            projectItemContainer.setAttribute({ name: 'from', value: dates[0] });
            if (dates[1] && !['WIP', 'Pending', 'Maintaining'].includes(dates[1])) {
                projectItemContainer.setAttribute({ name: 'to', value: dates[1] });
            }
        }
        if (item.isWip) projectItemContainer.setAttribute({ name: 'isWip', value: 'true' });
        if (item.isPending) projectItemContainer.setAttribute({ name: 'isPending', value: 'true' });
        if (item.isMaintaining) projectItemContainer.setAttribute({ name: 'isMaintaining', value: 'true' });


        // Basic Info
        const experienceItemDiv = DOMComposer.new({ tag: 'div' })
            .setAttribute({ name: 'class', value: 'experience-item' })
            .appendChild({
                child: DOMComposer.new({ tag: 'div' })
                    .setAttribute({ name: 'class', value: 'title' })
                    .setInnerText({ text: i18n.t(item.title) })
            })
            .appendChild({
                child: DOMComposer.new({ tag: 'time' })
                    .setAttribute({ name: 'class', value: 'indent date' })
                    .setAttribute({ name: 'level', value: '1' })
                    .setInnerText({ text: i18n.t(item.duration) })
            });

        projectItemContainer.appendChild({ child: experienceItemDiv });

        // Participants
        if (item.participants && item.participants.length > 0) {
            const participantsDiv = DOMComposer.new({ tag: 'div' })
                .setAttribute({ name: 'class', value: 'participants flexbox flex-column gap-1' });
            item.participants.forEach(p => participantsDiv.appendChild({ child: createParticipantItem(p) })); // Assumes p is HTML string
            projectItemContainer.appendChild({ child: participantsDiv });
        }

        // Stacks (Backend)
        if (item.backendStacks && item.backendStacks.length > 0) {
            const backendStackDiv = DOMComposer.new({ tag: 'div' })
                .setInnerText({ text: i18n.t(commonData.backendStack) + ': ' }); // Example key
            item.backendStacks.forEach(s => backendStackDiv.appendChild({ child: createStackItem(s) }));
            projectItemContainer.appendChild({ child: backendStackDiv });
        }
        // Stacks (Frontend)
        if (item.frontendStacks && item.frontendStacks.length > 0) {
            const frontendStackDiv = DOMComposer.new({ tag: 'div' })
                .setInnerText({ text: i18n.t(commonData.frontendStack) + ': ' }); // Example key
            item.frontendStacks.forEach(s => frontendStackDiv.appendChild({ child: createStackItem(s) }));
            projectItemContainer.appendChild({ child: frontendStackDiv });
        }
        // Stacks (General, if only one stack list exists in data)
        if (item.stacks && item.stacks.length > 0) {
            const stackDiv = DOMComposer.new({ tag: 'div' })
                .setAttribute({ name: 'class', value: 'stack-container' }) // Match HTML
                .setInnerText({ text: i18n.t(commonData.stacks) + ': ' });
            item.stacks.forEach(s => stackDiv.appendChild({ child: createStackItem(s) }));
            projectItemContainer.appendChild({ child: stackDiv });
        }


        // Platforms
        if (item.platforms && item.platforms.length > 0) {
            const platformsDiv = DOMComposer.new({ tag: 'div' })
                .setInnerText({ text: i18n.t(commonData.platforms) + ': ' }); // Example key
            item.platforms.forEach(p => platformsDiv.appendChild({ child: createPlatformItem(p) }));
            projectItemContainer.appendChild({ child: platformsDiv });
        }

        // Content
        if (item.contents && item.contents.length > 0) {
            const contentContainer = DOMComposer.new({ tag: 'div' })
                .setAttribute({ name: 'class', value: 'content' });
            // Set 'from', 'to', 'isWip', etc. attributes if needed on content div specifically
            if (item.duration) {
                const dates = item.duration.split(' ~ ');
                contentContainer.setAttribute({ name: 'from', value: dates[0] });
                if (dates[1]) { // Check how these attributes were used in HTML
                    if (item.isWip) contentContainer.setAttribute({ name: 'isWip', value: 'true' });
                    if (item.isPending) contentContainer.setAttribute({ name: 'isPending', value: 'true' });
                    if (item.isMaintaining) contentContainer.setAttribute({ name: 'isMaintaining', value: 'true' });
                }
            }

            const contentsArray = Array.isArray(item.contents) ? item.contents : [item.contents];
            contentsArray.forEach(c => contentContainer.appendChild({ child: createContentParagraph(c) })); // Assumes c is HTML string
            projectItemContainer.appendChild({ child: contentContainer });
        }

        if (item.repoLink && item.repoImageSrc) {
            const repoImg = DOMComposer.new({ tag: 'img' })
                .setAttribute({ name: 'src', value: item.repoImageSrc })
                .setAttribute({ name: 'alt', value: `${item.title} repo stats` });
            const repoLink = DOMComposer.new({ tag: 'a' })
                .setAttribute({ name: 'href', value: item.repoLink })
                .appendChild({ child: repoImg });
            const repoDiv = DOMComposer.new({ tag: 'div' })
                .setAttribute({ name: 'class', value: 'content repo' });

            if (item.duration) {
                const dates = item.duration.split(' ~ ');
                repoDiv.setAttribute({ name: 'from', value: dates[0] });
                if (dates[1]) {
                    if (item.isWip) repoDiv.setAttribute({ name: 'isWip', value: 'true' });
                    if (item.isPending) repoDiv.setAttribute({ name: 'isPending', value: 'true' });
                    if (item.isMaintaining) repoDiv.setAttribute({ name: 'isMaintaining', value: 'true' });
                }
            }

            repoDiv.appendChild({ child: repoLink });
            projectItemContainer.appendChild({ child: repoDiv });
        }

        bodyContent.appendChild({ child: projectItemContainer });
    });

    return createSectionFrame({ titleContent, bodyContent });
};


/** Creates Certifications Section */
const createCertificationsSection = (/** @type {ResumeCertifications} */ certData) => {
    const title = DOMComposer.new({ tag: 'h1' })
        .setAttribute({ name: 'class', value: 'inline' })
        .setInnerText({ text: i18n.t(certData.title) });

    const overallDuration = DOMComposer.new({ tag: 'time' })
        .setAttribute({ name: 'class', value: 'indent date' })
        .setAttribute({ name: 'level', value: '0.5' })
        .setInnerText({ text: i18n.t(certData.duration) });

    const titleContent = DOMComposer.fragment().appendChild({ child: title });
    titleContent.appendChild({ child: overallDuration });

    const bodyContent = DOMComposer.fragment();
    (certData.items || []).forEach(item => {
        const certItem = DOMComposer.new({ tag: 'div' })
            .setAttribute({ name: 'class', value: 'indent' })
            .setAttribute({ name: 'level', value: '1' })
            .setAttribute({ name: 'from', value: item.date })
            .appendChild({
                child: DOMComposer.new({ tag: 'div' })
                    .setAttribute({ name: 'class', value: 'title' })
                    .setInnerText({ text: i18n.t(item.name) })
            })
            .appendChild({
                child: DOMComposer.new({ tag: 'time' })
                    .setAttribute({ name: 'class', value: 'date' })
                    .setInnerText({ text: i18n.t(item.date) })
            });
        bodyContent.appendChild({ child: certItem });
    });

    return createSectionFrame({ titleContent, bodyContent });
};

/**
 * @param {ResumeSkills} skillsData
 * @param {ProjectStrings} commonData
 * @returns {DOMComposer}
 */
const createSkillsSection = (skillsData, commonData) => {
    const title = DOMComposer.new({ tag: 'h1' })
        .setInnerText({ text: i18n.t(skillsData.title) });

    const subTitle = DOMComposer.new({ tag: 'h2' })
        .setAttribute({ name: 'class', value: 'sub-title' })
        .setInnerText({ text: i18n.t(commonData.stacksProficiency) });

    const titleContent = DOMComposer.fragment().appendChild({ child: title });
    let hasSubtitle = false;

    titleContent.appendChild({ child: subTitle });
    hasSubtitle = true;

    const tableBody = DOMComposer.new({ tag: 'tbody' });
    (skillsData.categories || []).forEach(category => {
        const skillCells = DOMComposer.new({ tag: 'td' })
            .setAttribute({ name: 'class', value: 'skills-cell' });
        (category.items || []).forEach(item => {
            skillCells.appendChild({ child: createStackItem({ lang: i18n.t(item.skill), level: item.level }) });
        });

        const tableRow = DOMComposer.new({ tag: 'tr' })
            .appendChild({
                child: DOMComposer.new({ tag: 'td' })
                    .setAttribute({ name: 'class', value: 'label-cell' })
                    .setInnerText({ text: i18n.t(category.name) }) // Category name
            })
            .appendChild({ child: skillCells });
        tableBody.appendChild({ child: tableRow });
    });

    const table = DOMComposer.new({ tag: 'table' })
        .setAttribute({ name: 'class', value: 'skills-table' })
        .appendChild({ child: tableBody });

    // Wrap table in the container divs as per HTML structure
    const bodyContent = DOMComposer.new({ tag: 'div' })
        .setAttribute({ name: 'class', value: 'skills-container' }) // Outer container
        .appendChild({
            child: DOMComposer.new({ tag: 'div' })
                .setAttribute({ name: 'class', value: 'skills-container' }) // Inner container
                .appendChild({ child: table })
        });

    return createSectionFrame({ titleContent, bodyContent, hasSubtitle });
};

/**
 * @param {ResumeProjectProgress} progressData 
 * @param {ProjectStrings} commonData
 * @returns {DOMComposer}
 */
const createProjectProgressSection = (progressData, commonData) => {
    const title = DOMComposer.new({ tag: 'h1' })
        .setAttribute({ name: 'class', value: 'inline' }) // Add inline based on HTML
        .setInnerText({ text: i18n.t(progressData.title) });
    const subTitle = DOMComposer.new({ tag: 'h2' })
        .setAttribute({ name: 'class', value: 'sub-title' })
        .setInnerText({ text: i18n.t(commonData.additionalInfo) });

    const titleContent = DOMComposer.fragment().appendChild({ child: title });
    let hasSubtitle = false;
    titleContent.appendChild({ child: subTitle });
    hasSubtitle = true;


    // Create Table Header
    const tableHead = DOMComposer.new({ tag: 'thead' })
        .appendChild({
            child: DOMComposer.new({ tag: 'tr' })
                .appendChild({ child: DOMComposer.new({ tag: 'th' }).setInnerText({ text: i18n.t(commonData.progress.projectHeader) }) })
                .appendChild({ child: DOMComposer.new({ tag: 'th' }).setInnerText({ text: i18n.t(commonData.progress.progressHeader) }) })
                .appendChild({ child: DOMComposer.new({ tag: 'th' }).setInnerText({ text: i18n.t(commonData.progress.periodHeader) }) })
        });

    // Create Table Body
    const tableBody = DOMComposer.new({ tag: 'tbody' });
    (progressData.items || []).forEach(item => {
        const progressImg = DOMComposer.new({ tag: 'img' })
            .setAttribute({ name: 'src', value: `https://progress-bar.xyz/${item.progress}${item.color ? '?progress_color=' + item.color : ''}` })
            .setAttribute({ name: 'alt', value: `progress ${item.progress}%` });

        const tableRow = DOMComposer.new({ tag: 'tr' })
            .appendChild({
                child: DOMComposer.new({ tag: 'td' })
                    .setInnerText({ text: i18n.t(item.name) })
            })
            .appendChild({
                child: DOMComposer.new({ tag: 'td' })
                    .appendChild({ child: progressImg })
            })
            .appendChild({
                child: DOMComposer.new({ tag: 'td' })
                    .setInnerText({ text: i18n.t(item.period) })
            });
        tableBody.appendChild({ child: tableRow });
    });

    const table = DOMComposer.new({ tag: 'table' })
        .setAttribute({ name: 'class', value: 'projects-table' })
        .appendChild({ child: tableHead })
        .appendChild({ child: tableBody });

    return createSectionFrame({ titleContent, bodyContent: table, hasSubtitle });
};

/**
 * @param {FetchedResumeData} resumeData
 * @param {FetchedCommonData} commonData
 * @returns {Array<DOMComposer>}
 */
const getResume = (resumeData, commonData) => {
    const actualResumeData = resumeData.resume;
    const actualCommonData = commonData.common;
    const resumeComposed = [];

    resumeComposed.push(DOMComposer.new({ tag: 'header' })
        .setInnerText({ text: i18n.t(actualCommonData.general.resume) })
    );

    resumeComposed.push(DOMComposer.new({ tag: 'div' })
        .setAttribute({ name: 'class', value: 'flexbox align-right-h mb-2' })
        .appendChild({
            child: DOMComposer.new({ tag: 'button' })
                .setAttribute({ name: 'id', value: 'dark-mode-button' })
                .setAttribute({ name: 'class', value: 'flexbox circle align-center-h align-center-v mr-2' })
                .setAttribute({ name: 'type', value: 'button' })
                .appendChild({
                    child: DOMComposer.newRaw({ tag: 'svg', rawAttributes: `id="moon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="17" height="17" viewBox="0 0 17 17"` })
                        .appendChild({ child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M8.41667,16.6667C7.25,16.6667,6.15625,16.4444,5.13542,16C4.11458,15.5556,3.22569,14.9549,2.46875,14.1979C1.71181,13.441,1.11111,12.5521,0.666667,11.5312C0.222222,10.5104,0,9.41667,0,8.25C0,6.22222,0.645833,4.43403,1.9375,2.88542C3.22917,1.33681,4.875,0.375,6.875,0C6.625,1.375,6.70139,2.71875,7.10417,4.03125C7.50694,5.34375,8.20139,6.49306,9.1875,7.47917C10.1736,8.46528,11.3229,9.15972,12.6354,9.5625C13.9479,9.96528,15.2917,10.0417,16.6667,9.79167C16.3056,11.7917,15.3472,13.4375,13.7917,14.7292C12.2361,16.0208,10.4444,16.6667,8.41667,16.6667Z" fill="#566273" fill-opacity="1"` }) })
                })
                .appendChild({
                    child: DOMComposer.newRaw({ tag: 'svg', rawAttributes: `id="sun" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="22" height="22" viewBox="0 0 22 22"` })
                        .appendChild({ child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M10,3C10,3,10,0,10,0C10,0,12,0,12,0C12,0,12,3,12,3C12,3,10,3,10,3ZM10,22C10,22,10,19,10,19C10,19,12,19,12,19C12,19,12,22,12,22C12,22,10,22,10,22ZM19,12C19,12,19,10,19,10C19,10,22,10,22,10C22,10,22,12,22,12C22,12,19,12,19,12ZM0,12C0,12,0,10,0,10C0,10,3,10,3,10C3,10,3,12,3,12C3,12,0,12,0,12ZM17.7,5.7C17.7,5.7,16.3,4.3,16.3,4.3C16.3,4.3,18.05,2.5,18.05,2.5C18.05,2.5,19.5,3.95,19.5,3.95C19.5,3.95,17.7,5.7,17.7,5.7ZM3.95,19.5C3.95,19.5,2.5,18.05,2.5,18.05C2.5,18.05,4.3,16.3,4.3,16.3C4.3,16.3,5.7,17.7,5.7,17.7C5.7,17.7,3.95,19.5,3.95,19.5ZM18.05,19.5C18.05,19.5,16.3,17.7,16.3,17.7C16.3,17.7,17.7,16.3,17.7,16.3C17.7,16.3,19.5,18.05,19.5,18.05C19.5,18.05,18.05,19.5,18.05,19.5ZM4.3,5.7C4.3,5.7,2.5,3.95,2.5,3.95C2.5,3.95,3.95,2.5,3.95,2.5C3.95,2.5,5.7,4.3,5.7,4.3C5.7,4.3,4.3,5.7,4.3,5.7ZM11,17C9.33333,17,7.91667,16.4167,6.75,15.25C5.58333,14.0833,5,12.6667,5,11C5,9.33333,5.58333,7.91667,6.75,6.75C7.91667,5.58333,9.33333,5,11,5C12.6667,5,14.0833,5.58333,15.25,6.75C16.4167,7.91667,17,9.33333,17,11C17,12.6667,16.4167,14.0833,15.25,15.25C14.0833,16.4167,12.6667,17,11,17Z" fill="#566273" fill-opacity="1"` }) })
                })
                .setEvent({ event: 'click', callback: setThemeCallback, alias: 'change-theme' })
        })
        .appendChild({
            child: DOMComposer.new({ tag: 'button' })
                .setAttribute({ name: 'id', value: 'change-lang-button' })
                .setAttribute({ name: 'class', value: 'flexbox circle align-center-h align-center-v mr-1' })
                .setAttribute({ name: 'type', value: 'button' })
                .appendChild({
                    child: DOMComposer.newRaw({ tag: 'svg', rawAttributes: `id="lang-ko" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10.825 11.4" width="1em" height="0.9em"` })
                        .appendChild({ child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M 3.525 6.275 C 3.958 6.275 4.329 6.179 4.637 5.988 C 4.946 5.796 5.1 5.508 5.1 5.125 C 5.1 4.742 4.946 4.45 4.637 4.25 C 4.329 4.05 3.958 3.95 3.525 3.95 C 3.092 3.95 2.721 4.05 2.412 4.25 C 2.104 4.45 1.95 4.742 1.95 5.125 C 1.95 5.508 2.104 5.796 2.412 5.988 C 2.721 6.179 3.092 6.275 3.525 6.275 Z M 0 2.5 C 0 2.5 0 1.4 0 1.4 C 0 1.4 2.85 1.4 2.85 1.4 C 2.85 1.4 2.85 0 2.85 0 C 2.85 0 4.15 0 4.15 0 C 4.15 0 4.15 1.4 4.15 1.4 C 4.15 1.4 7.025 1.4 7.025 1.4 C 7.025 1.4 7.025 2.5 7.025 2.5 C 7.025 2.5 0 2.5 0 2.5 Z M 3.525 7.375 C 2.742 7.375 2.071 7.179 1.513 6.787 C 0.954 6.396 0.675 5.842 0.675 5.125 C 0.675 4.392 0.954 3.833 1.513 3.45 C 2.071 3.067 2.742 2.875 3.525 2.875 C 4.325 2.875 5.004 3.067 5.563 3.45 C 6.121 3.833 6.4 4.392 6.4 5.125 C 6.4 5.858 6.121 6.417 5.563 6.8 C 5.004 7.183 4.325 7.375 3.525 7.375 Z M 1.7 11.4 C 1.7 11.4 1.7 7.9 1.7 7.9 C 1.7 7.9 3.025 7.9 3.025 7.9 C 3.025 7.9 3.025 10.3 3.025 10.3 C 3.025 10.3 9.625 10.3 9.625 10.3 C 9.625 10.3 9.625 11.4 9.625 11.4 C 9.625 11.4 1.7 11.4 1.7 11.4 Z M 7.825 8.775 C 7.825 8.775 7.825 0 7.825 0 C 7.825 0 9.1 0 9.1 0 C 9.1 0 9.1 3.75 9.1 3.75 C 9.1 3.75 10.825 3.75 10.825 3.75 C 10.825 3.75 10.825 4.85 10.825 4.85 C 10.825 4.85 9.125 4.85 9.125 4.85 C 9.125 4.85 9.125 8.775 9.125 8.775 C 9.125 8.775 7.825 8.775 7.825 8.775 Z" fill="#566273" fill-opacity="1"` }) })
                })
                .appendChild({
                    child: DOMComposer.newRaw({ tag: 'svg', rawAttributes: `id="lang-en" xmlns="http://www.w3.org/2000/svg" viewBox="12.025 0.1 8.225 10.95" width="8.225px" height="10.95px"` })
                        .appendChild({ child: DOMComposer.newRaw({ tag: 'path', rawAttributes: `d="M 15.675 9.35 C 16.142 9.35 16.596 9.242 17.038 9.025 C 17.479 8.808 17.883 8.5 18.25 8.1 C 18.25 8.1 18.25 5.45 18.25 5.45 C 17.867 5.5 17.513 5.558 17.188 5.625 C 16.862 5.692 16.558 5.767 16.275 5.85 C 15.525 6.083 14.962 6.375 14.587 6.725 C 14.212 7.075 14.025 7.483 14.025 7.95 C 14.025 8.383 14.175 8.725 14.475 8.975 C 14.775 9.225 15.175 9.35 15.675 9.35 Z M 15.1 11.05 C 14.15 11.05 13.4 10.779 12.85 10.238 C 12.3 9.696 12.025 8.958 12.025 8.025 C 12.025 7.158 12.3 6.45 12.85 5.9 C 13.4 5.35 14.283 4.908 15.5 4.575 C 15.883 4.475 16.304 4.383 16.763 4.3 C 17.221 4.217 17.717 4.142 18.25 4.075 C 18.217 3.292 18.033 2.721 17.7 2.362 C 17.367 2.004 16.85 1.825 16.15 1.825 C 15.717 1.825 15.288 1.904 14.863 2.063 C 14.438 2.221 13.892 2.5 13.225 2.9 C 13.225 2.9 12.425 1.5 12.425 1.5 C 12.975 1.083 13.621 0.746 14.363 0.488 C 15.104 0.229 15.858 0.1 16.625 0.1 C 17.808 0.1 18.708 0.467 19.325 1.2 C 19.942 1.933 20.25 3 20.25 4.4 C 20.25 4.4 20.25 10.825 20.25 10.825 C 20.25 10.825 18.575 10.825 18.575 10.825 C 18.575 10.825 18.425 9.7 18.425 9.7 C 17.958 10.117 17.446 10.446 16.888 10.688 C 16.329 10.929 15.733 11.05 15.1 11.05 Z" fill="#566273" fill-opacity="1"` }) })
                })
                .setEvent({ event: 'click', callback: changeLangCallback, alias: 'change-lang' })
        })
    );

    resumeComposed.push(DOMComposer.new({ tag: 'time' })
        .setAttribute({ name: 'id', value: 'last-update' })
        .setAttribute({ name: 'class', value: 'block text-align-right-h' })
        .setInnerText({ text: i18n.t(actualCommonData.general.lastUpdate) + ': ' + 'lastUpdateText' })
    );

    resumeComposed.push(createProfileSection(actualResumeData.profile, actualCommonData.general));
    resumeComposed.push(createEducationSection(actualResumeData.education, actualCommonData.education));
    resumeComposed.push(createWorkExperienceSection(actualResumeData.workExperience, actualCommonData.projects));
    resumeComposed.push(createProjectSection(actualResumeData.currentProjects, actualCommonData.projects));
    resumeComposed.push(createProjectSection(actualResumeData.maintainingProjects, actualCommonData.projects));
    resumeComposed.push(createProjectSection(actualResumeData.previousProjects, actualCommonData.projects));
    resumeComposed.push(createCertificationsSection(actualResumeData.certifications));
    resumeComposed.push(createSkillsSection(actualResumeData.skills, actualCommonData.projects));
    resumeComposed.push(createProjectProgressSection(actualResumeData.projectProgress, actualCommonData.projects));
    resumeComposed.push(createScrollToTopButton());
    return resumeComposed;
};

export { getResume, events };