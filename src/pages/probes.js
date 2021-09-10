/**
 * 
 * @param {*} documentElement 
 * @returns {string} the content or innerText of the selected DOM element
 */
 function getContentsHavingSelector(str, documentElement) {
    const e = documentElement.querySelector(str);
    return e === null ? undefined : e.content || e.innerText;
}


export function getContentByElementName(tag, documentElement) {
    return getContentsHavingSelector(tag, documentElement);
}

export function getContentByTagProperty(tag, documentElement) {
    return getContentsHavingSelector(`meta[property='${tag}']`, documentElement);
}