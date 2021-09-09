/** generates the intermediate background script which
 * stitches together all the modules needed to run this collection effort.
 * There's probably a better way to do this but I'm ok with this as it is now.
 */

import fs from "fs";

import glob from "glob";
import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";

// @ts-ignore
import webScienceRollupPlugin from "@mozilla/web-science/rollup-plugin";

//import type { ModuleConfiguration } from './config-interface'

function imports(config) {
    return config.map(module => {
        return `import ${module.namespace} from "../${module.src + module.namespace + '.reporter.js'}";`
    }).join('\n');
}

function storage(configs) {
    return `
const RALLY_TV_DB = new Dexie("RallyTV");    
RALLY_TV_DB.version(1).stores({
    ${configs.map(c => {
    const keys = `"${c.replaceOnSamePrimaryKey ? c.primaryKey : "++id"},createdAt"`;
    return `${c.namespace}: ${keys}`
}).join(',\n\t')}
});
`
}

function instantiation(configs) {
    return configs.map(module => {
        const operation = module.replaceOnSamePrimaryKey && module.primaryKey ? "put" : "add";
        return `
${module.namespace}.addListener(
    async (data) => {
        if (__ENABLE_DEVELOPER_MODE__) {
                console.debug("${module.namespace}", data);
        }
        data.createdAt = +new Date();
        await RALLY_TV_DB["${module.namespace}"].${operation}(data);
    }, {
        matchPatterns: ${JSON.stringify(module.matchPatterns) ||'["<all_urls>"]'},
        privateWindows: false
    }
);
`}).join('\n') 
}

function optionsPage() {
    return `
function openPage() {
    browser.runtime.openOptionsPage().catch(e => {
        console.error(\`Study Add-On - Unable to open the control panel\`, e);
    });
}
browser.browserAction.onClicked.addListener(openPage);    
    `
}

export function backgroundScript(configs) {
    return `
import Dexie from "dexie";
import browser from "webextension-polyfill";
import EventStreamInspector from "../lib/event-stream-inspector";
${imports(configs)};
${storage(configs)}
const inspector = new EventStreamInspector(RALLY_TV_DB);
inspector.initialize();
${instantiation(configs)}
${optionsPage()}
`
}

export function generateIntermediateBackgroundScript(args) {
    const allArguments = {
        ... { output: "dist/intermediate-background.js" },
        ...args
    };
    const { configs, output } = allArguments;
    const bgScript = backgroundScript(configs);
    fs.writeFileSync(output, bgScript);
}

export function generateBackgroundScript(args) {
    const allArguments = {...{
        input: "dist/intermediate-background.js",
        output: "dist/background.js",
        isDevMode: true
    }, ...args};
    const { input, output, isDevMode, configs } = allArguments;
    generateIntermediateBackgroundScript({ 
        configs,
        output: input
      });
    console.log(`Generated intermediate background script at ${input}`)
    return {
        input,
        output: {
          file: output,
          sourcemap: isDevMode ? "inline" : false,
        },
        plugins: [
          replace({
            // In Developer Mode, the study does not submit data and
            // gracefully handles communication errors with the Core
            // Add-on.
            __ENABLE_DEVELOPER_MODE__: isDevMode,
          }),
          webScienceRollupPlugin(),
          resolve({
            browser: true,
          }),
          commonjs(),
          typescript(),
          !isDevMode && terser()
        ],
    }
}

export function generateCollectorContentScripts(args) {
    const allArguments = {...{
        isDevMode: true
    }, ...args};
    const { isDevMode, configs } = allArguments;

    const collectors = configs
    .map(collector => {
      const inputs = glob.sync(`${collector.src}*.collector.js`);
      return inputs.map(input => {
        const destination = input.split('/').slice(-1)[0];
          return {
            input, //`src/${collector}`,
            output: {
              file: `dist/content-scripts/${destination}`,
              sourcemap: isDevMode ? "inline" : false,
              format: 'iife'
            },
            plugins: [
              replace({
                __ENABLE_DEVELOPER_MODE__: isDevMode,
              }),
              webScienceRollupPlugin(),
              resolve({
                browser: true,
              }),
              commonjs(),
              !isDevMode && terser()
            ],
          }
      })
    }).flat();
    return collectors;
}