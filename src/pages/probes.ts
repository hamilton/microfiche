/**
 * 
 * @param {*} documentElement 
 * @returns {string} the content or innerText of the selected DOM element
 */
 function getContentsHavingSelector(str : string, documentElement : Document) {
    const e : HTMLElement | null = documentElement.querySelector(str);
    return e === null ? undefined : e.textContent || e.innerText;
}


export function getContentByElementName(tag : string, documentElement : Document) {
    return getContentsHavingSelector(tag, documentElement);
}

export function getContentByTagProperty(tag : string, documentElement : Document) {
    return getContentsHavingSelector(`meta[property='${tag}']`, documentElement);
}