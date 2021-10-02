/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from "fs";
import path from "path";
import http from "http";
import type { Server } from "http"

import { Builder, Locator, logging, WebDriver } from "selenium-webdriver";
import { until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox";
import chrome from "selenium-webdriver/chrome";
import minimist from "minimist";

const TEST_EXTENSION = "../../web-ext-artifacts/uwef-0.0.0.zip";

// The number of milliseconds to wait for some
// property to change in tests. This should be
// a long time to account for slow CI.
export const WAIT_FOR_PROPERTY = 10000;


function spinUpServerFor(file:string) {
  return http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    // throw away everything that isn't index.html for now
    if (req.url?.includes('html')) {
      fs.createReadStream(path.join(file, req.url || '')).pipe(res);
    } else {
      res.write("ok");
    }
  })
}

let serversSpunUp = false;
let pageServer:Server;

let port = 8040;

export function expectEvent(log:string, eventName:string) {
  expect(log).toContain(eventName);
}

export function spinUpPageServer() {
  if (!serversSpunUp) {
    pageServer = spinUpServerFor('./tests/integration/sites');

    pageServer.listen(port);
    serversSpunUp = true;
  }
  return pageServer;
}

export function getDemarcations(driver:WebDriver, testName:string) {
  return {
    async startDemarcation() {
      return await driver.executeScript(`console.log("${addTestDemarcation("START", testName)}")`);
    },
    async endDemarcation() {
      return await driver.executeScript(`console.log("${addTestDemarcation("END", testName)}")`);
    }
  }
}

export async function loadSite(driver:WebDriver, siteKey:string) {
  await driver.get(`http://localhost:${port}/${siteKey}.html`);
  await driver.wait(until.titleIs(siteKey), 1000);
  await driver.sleep(10);
}

export async function loadTestSites(driver:WebDriver, testName:string, ...siteKeys:string[]) {
  const { startDemarcation, endDemarcation } = getDemarcations(driver, testName);
  await startDemarcation();
  for (const siteKey of siteKeys) {
    await loadSite(driver, siteKey);
  }
  await endDemarcation();
  return getBrowserConsoleEntries(testName);
}

export function getBrowserConsoleEntries(key: string) {
  const logFile = fs.readFileSync("./integration.log").toString();
  const r = new RegExp(`(?<=console.log: "\\[START\\] ${key}")([\\s\\S]*?)(?=console.log: "\\[END\\] ${key}")`, 'g');
  // @ts-ignore
  return logFile.match(r)[0].split('\n').filter(s => s.length && s !== '"');
}

export function addTestDemarcation (goalpost:string, message:string) {
  return `[${goalpost}] ${message}`
}

export function processArguments(processArgv:string[]) {
  const args = (minimist(processArgv.slice(2)));
  for (const arg of ["test_browser", "headless_mode"]) {
    if (!(arg in args)) {
      throw new Error(`Missing required option: --${arg}`);
    }
  }
  return args;
}

export function getDriver(testBrowser:string) {
  let webDriver;
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
  return webDriver;
}

/**
 * Find the element and perform an action on it.
 *
 * @param {WebDriver} driver
 *        The Selenium driver to use.
 * @param {Locator} locator
 *        The locator for an element to look for and execute actions on.
 * @param {Function} action
 *        A function in the form `e => {}` that will be called
 *        and receive the element once ready.
 */
export async function findAndAct(driver: WebDriver, locator: Locator, action: Function) {

  // FIXME slow animations can obscure elements that the user is trying to interact with, without
  // a signal to know that they are complete the best we can do is retry them. Let's log it though,
  // the fact that it's happening at all means it might be a bad experience for users with slow and/or busy hardware.
  await driver.wait(async () => {
    try {
      const element = await driver.findElement(locator);
      await driver.wait(until.elementIsEnabled(element), WAIT_FOR_PROPERTY);
      await driver.wait(until.elementIsVisible(element), WAIT_FOR_PROPERTY);

      await action(element);
      return true;
    } catch (ex) {
      console.debug(`Element at locator ${locator} not ready when expected, retrying: ${ex.name}, ${ex.message}`);
      return false;
    }
  }, WAIT_FOR_PROPERTY);
}

/**
* Get a Selenium driver for using the Firefox browser.
*
* @param {Boolean} loadExtension
*        Whether or not to load a WebExtension on start.
* @param {Boolean} headlessMode
*        Whether or not to run Firefox in headless mode.
* @returns {Promise<WebDriver>} a WebDriver instance to control Firefox.
*/
export async function getFirefoxDriver(headlessMode: boolean): Promise<WebDriver> {
  const firefoxOptions = new firefox.Options();
  firefoxOptions.setPreference("devtools.console.stdout.content", true);

  if (headlessMode) {
    firefoxOptions.headless();
    firefoxOptions.addArguments("-width=1920", "-height=1080");
  }

  const firefoxPrefs = new logging.Preferences()
  firefoxPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  const driver = await new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(firefoxOptions)
    .setLoggingPrefs(firefoxPrefs)
    .setFirefoxService(new firefox.ServiceBuilder().setStdio("inherit"))
    .build();

  // Extensions can only be loaded temporarily at runtime for Firefox Release.
  const isTemporaryAddon = true;
  // @ts-ignore this appears to be missing from the type definition, but it exists!
  const ok = await driver.installAddon(`${__dirname}/${TEST_EXTENSION}`, isTemporaryAddon);

  return driver;
}

/**
* Get a Selenium driver for using the Chrome browser.
*
* @param {boolean} loadExtension
*        Whether or not to load a WebExtension on start.
* @param {boolean} headlessMode
*        Whether or not to run Firefox in headless mode.
* @returns {Promise<WebDriver>} a WebDriver instance to control Chrome.
*/
export async function getChromeDriver(headlessMode: boolean) {
  const chromeOptions = new chrome.Options();

  if (headlessMode) {
    throw new Error("Chrome Headless does not support extensionss")
  }

  const loggingPrefs = new logging.Preferences();
  loggingPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  if (headlessMode) {
    chromeOptions.headless();
    chromeOptions.addArguments("window-size=1920,1080");
  }

  const encode = (file:string) => {
    var stream = fs.readFileSync(file);
    return Buffer.from(stream).toString("base64");
  }

  chromeOptions.addExtensions(encode(path.resolve(`${__dirname}/${TEST_EXTENSION}`)));

  return await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .setLoggingPrefs(loggingPrefs)
    .build();
}
