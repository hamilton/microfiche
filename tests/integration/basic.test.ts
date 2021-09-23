/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from "fs";
import type { Server } from "http";

import {  getChromeDriver, getFirefoxDriver, extensionLogsPresent, WAIT_FOR_PROPERTY, spinUpServers } from "./utils";
import { until } from "selenium-webdriver";
import type { WebDriver } from 'selenium-webdriver';
import minimist from "minimist";

const args = (minimist(process.argv.slice(2)));
for (const arg of ["test_browser", "load_extension", "headless_mode"]) {
  if (!(arg in args)) {
    throw new Error(`Missing required option: --${arg}`);
  }
}

const testBrowser = args["test_browser"];
const loadExtension = args["load_extension"] === "true";
const headlessMode = args["headless_mode"] === "true";

// @ts-ignore
export let webDriver;
switch (testBrowser) {
  case "chrome":
    webDriver = getChromeDriver;
    break;
  case "firefox":
    webDriver = getFirefoxDriver;
    break;
  default:
    throw new Error(`Unknown test_browser: ${testBrowser}`);
}

console.info(`Running with test_browser: ${testBrowser}, load_extension: ${loadExtension}, headless_mode: ${headlessMode}`);

// Wait ten minutes overall before Jest times the test out.
jest.setTimeout(60 * 10000);

// @ts-ignore
let driver:WebDriver;
function flagString (goalpost:string, message:string) {
  return `[${goalpost}] ${message}`
}
let startFlag:Function;
let endFlag:Function;
let screenshotCount = 0;

let servers:Server[];

function getBrowserConsoleEntries(key: string) {
  const logFile = fs.readFileSync("./integration.log").toString();
  const r = new RegExp(`(?<=console.log: "\\[START\\] ${key}")([\\s\\S]*?)(?=console.log: "\\[END\\] ${key}")`, 'g');
  // @ts-ignore
  return logFile.match(r)[0].split('\n').filter(s => s.length && s !== '"');
}

describe("Basic data collection flow", function () {
  beforeAll(() => {
    servers = spinUpServers();
  });
  afterAll((done) => {
    servers.forEach( s => { s.close(); } );
    done();
  })

  beforeEach(async () => {
    driver = await webDriver(loadExtension, headlessMode);
    startFlag = async (message:string) => {
      return await driver.executeScript(`console.log("${flagString("START", message)}")`);
    }
    endFlag = async (message:string) => {
      return await driver.executeScript(`console.log("${flagString("END", message)}")`);
    }

    await driver.wait(async () => {
      return (await driver.getAllWindowHandles()).length === 1;
    }, WAIT_FOR_PROPERTY);

  });

  afterEach(async () => {
    await driver.quit();
  });

  it("simulates a page viskt, then another page visit in th same tab", async function () {
    const TEST = "simulate-page-visit-then-another";
    await driver.executeScript(`console.log("[START] ${TEST}")`);
    await driver.get("http://localhost:8091");
    await driver.wait(until.titleIs('site01'), 1000);
    await driver.sleep(1000);
    await driver.get("http://localhost:8092");
    await driver.executeScript(`console.log("[END] ${TEST}")`);

    // get the log.
    const matches = getBrowserConsoleEntries(TEST);

    expect(matches[0]).toContain('eventType:"page-visit-start"');
    expect(matches[0]).toContain('"adding to cache" "events"');

    expect(matches[1]).toContain('eventType:"attention-start"');
    expect(matches[1]).toContain('"adding to cache" "events"');

    expect(matches[2]).toContain('eventType:"page-visit-stop"');
    expect(matches[2]).toContain('"adding to cache" "events"');
    
    expect(matches[3].includes('"adding to cache" "pages"')).toBeTruthy();
    expect(matches[3].includes('maxScrollHeight') && matches[3].includes('maxPixelScrollDepth')).toBeTruthy();

    expect(matches[4].includes('eventType:"page-visit-start"')).toBeTruthy();
    expect(matches[4].includes('"adding to cache" "events"')).toBeTruthy();
  });
});