// import { Rally, runStates } from "@mozilla/rally";
import browser from "webextension-polyfill";
// import attention from "./attention/attention.reporter";
import config from "./app.config.js";
import run from "../lib/rallytv"

// function collectEventDataAndSubmit(devMode) {
//   attention.addListener(async (data) => {
//     if (devMode) {
//       console.debug("attentionEvent", data);
//     }
//     attention.storage.push(data);
//   }, {
//       matchPatterns: ["<all_urls>"],
//       privateWindows: false
//   });
// }

function openPage() {
  browser.runtime.openOptionsPage().catch(e => {
    console.error(`Study Add-On - Unable to open the control panel`, e);
  });
}

// function letsGetCollecting(devMode) {
//   collectEventDataAndSubmit(devMode);
//   browser.browserAction.onClicked.addListener(openPage);
// }

//letsGetCollecting(__ENABLE_DEVELOPER_MODE__);
run();