/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { 
  spinUpPageServer, 
  processArguments, 
  getDriver, 
  addTestDemarcation, 
  getBrowserConsoleEntries, 
  WAIT_FOR_PROPERTY, 
  loadTestSites
} from "./utils";
import { until, By } from "selenium-webdriver";
import type { WebDriver } from 'selenium-webdriver';
import type { Server } from "http";

const args = processArguments(process.argv);

const testBrowser = args["test_browser"];
const headlessMode = args["headless_mode"] === "true";

// @ts-ignore
export let webDriver = getDriver(testBrowser);

console.info(`Running with test_browser: ${testBrowser}, headless_mode: ${headlessMode}`);

// Wait ten minutes overall before Jest times the test out.
jest.setTimeout(60 * 10000);

// @ts-ignore
let driver:WebDriver;

let server:Server;

function expectationsForLoadOneSiteThenAnother(loglines:string[]) {

  expect(loglines[0]).toContain('eventType:"page-visit-start"');
  expect(loglines[0]).toContain('"adding to cache" "events"');

  expect(loglines[1]).toContain('eventType:"attention-start"');
  expect(loglines[1]).toContain('"adding to cache" "events"');

  expect(loglines[2]).toContain('eventType:"page-visit-stop"');
  expect(loglines[2]).toContain('"adding to cache" "events"');
  
  // index 3 or 4 could be either the articles or pages payload.
  expect(
    loglines[4].includes('"adding to cache" "articles"') ||
    loglines[3].includes('"adding to cache" "articles"')
  ).toBeTruthy();

  expect(
    loglines[4].includes('"adding to cache" "pages"') ||
    loglines[3].includes('"adding to cache" "pages"')
  ).toBeTruthy();

  expect(
    (loglines[3].includes('maxScrollHeight') && loglines[3].includes('maxPixelScrollDepth')) ||
    loglines[4].includes('maxScrollHeight') && loglines[4].includes('maxPixelScrollDepth')
  ).toBeTruthy();


  expect(loglines[5].includes('eventType:"page-visit-start"')).toBeTruthy();
  expect(loglines[5].includes('"adding to cache" "events"')).toBeTruthy();
}

describe("Basic data collection flow", function () {
  beforeAll(() => {
    server = spinUpPageServer();
  });
  afterAll((done) => {
    server.close();
    done();
  })

  beforeEach(async () => {
    driver = await webDriver(headlessMode);

    await driver.wait(async () => {
      return (await driver.getAllWindowHandles()).length === 1;
    }, WAIT_FOR_PROPERTY);


  });

  afterEach(async () => {
    await driver.quit();
  });

  it("simulates a page visit, then switches to a new tab and loads a page in it", async function () {
    const matches = await loadTestSites(
      driver, 
      "page-visit-then-new-tab-page-visit", 
      "site-01", 
      "site-02"
    );
    expectationsForLoadOneSiteThenAnother(matches);
  });
});