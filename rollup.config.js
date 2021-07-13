/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { 
  generateBackgroundScript, 
  generateCollectorContentScripts } from "./lib/generate-rollup-config";

import config from "./src/app.config.js";

function isDevMode(cliArgs) {
  return Boolean(cliArgs["config-enable-developer-mode"]);
}

export default (cliArgs) => {
  /** Generate the intermediate background script into dist, and then read that into rollup. */
  const backgroundScript = generateBackgroundScript({ config, isDevMode: isDevMode(cliArgs) });
  const contentScripts = generateCollectorContentScripts({ config, isDevMode: isDevMode(cliArgs) });
  /** Return the rollup configurations for these two main components. */
  return [
    backgroundScript,
    ...contentScripts
  ]
}
