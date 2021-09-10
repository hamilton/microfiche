/** generates the intermediate background script which
 * stitches together all the modules needed to run this collection effort.
 */

import glob from "glob";
import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";

// @ts-ignore
import webScienceRollupPlugin from "@mozilla/web-science/rollup-plugin";

import type { ModuleConfiguration } from '../lib/config-interface';

export function generateBackgroundScript(args : { configs : Array<ModuleConfiguration>, isDevMode : boolean }) {
    const allArguments = {...{ isDevMode: true }, ...args};
    const { isDevMode, configs } = allArguments;

    return {
        input: "./src/build/background-template.ts",
        output: {
          file: "dist/background.js",
          sourcemap: isDevMode ? "inline" : false,
        },
        plugins: [
          replace({
            __ENABLE_DEVELOPER_MODE__: isDevMode,
            __INITIALIZE_REPORTERS__: `
// import and instantiate the reporters associated with app.config.ts
${configs.map(module => {
    return `import ${module.namespace} from "../../${module.src + module.namespace + '.reporter.ts'}";`
}).join("\n")}
${configs.map(module => {
  return `${module.namespace}();`
}).join("\n")}
  `
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

export function generateCollectorContentScripts(args : { configs : Array<ModuleConfiguration>, isDevMode : boolean }) {
    const allArguments = {...{
        isDevMode: true
    }, ...args};
    const { isDevMode, configs } = allArguments;

    const collectors = configs
    .map(collector => {
      const inputs = glob.sync(`${collector.src}*.collector.ts`);
      
      return inputs.map(input => {
        // convert to js destination name.
        const destination = input.split('/').slice(-1)[0].slice(0, -3) + ".js";
          return {
            input,
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
              typescript(),
              !isDevMode && terser()
            ],
          }
      })
    }).flat();
    return collectors;
}