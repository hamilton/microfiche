let observer;
const listeners = [];

function matchSelectorElements() {
    listeners.forEach(({ selector, callback }) => {
        document
            .querySelectorAll(selector)
            .forEach(callback);
    })
}

export default function listenForInsertions(selector, callback) {
    listeners.push({
        selector, callback
    });
    if (!observer) {
        observer = new MutationObserver(matchSelectorElements);
        observer.observe(
            document.documentElement,
            {
                childList: true, subtree: true
            }
        )
    }
}