/**
 * CAUTION: this is the template background script that compiles into the final background.
 */

import browser from "webextension-polyfill";
// @ts-ignore
__INITIALIZE_REPORTERS__

function openPage() {
    browser.runtime.openOptionsPage().catch(e => {
        console.error(`Study Add-On - Unable to open the control panel`, e);
    });
}

browser.browserAction.onClicked.addListener(openPage);