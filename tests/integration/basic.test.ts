/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from "fs";
import { createReadStream } from "fs";
import readline from "readline";

import { findAndAct, getChromeDriver, getFirefoxDriver, extensionLogsPresent, WAIT_FOR_PROPERTY } from "./utils";
import { By, until } from "selenium-webdriver";
import minimist from "minimist";

const args = (minimist(process.argv.slice(2)));
console.debug(args);
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
let driver;
let screenshotCount = 0;

describe("Basic data collection flow", function () {
  beforeEach(async () => {
    driver = await webDriver(loadExtension, headlessMode);
    console.log(driver);
    // If installed, the extension will open this page.
    // if (loadExtension) {
    //   // Starting with a single tab.
    //   await driver.wait(async () => {
    //     return (await driver.getAllWindowHandles()).length === 2;
    //   }, WAIT_FOR_PROPERTY);

    //   // Close the original tab, which is blank.
    //   await driver.switchTo().window((await driver.getAllWindowHandles())[0]);
    //   await driver.close();
    //   // Site is now open in first tab position.
    //   await driver.switchTo().window((await driver.getAllWindowHandles())[0]);
    // } else {
    //   await driver.get("http://localhost:5000");
    // }

    // Starting with a single tab.
    await driver.wait(async () => {
      return (await driver.getAllWindowHandles()).length === 1;
    }, WAIT_FOR_PROPERTY);

  });

  afterEach(async () => {
    screenshotCount++;

    const image = await driver.takeScreenshot();
    let extension = loadExtension ? "extension" : "no_extension";
    let headless = headlessMode ? "headless" : "no_headless";

    const screenshotDir = `screenshots/${testBrowser}-${extension}-${headless}`;
    const screenshotFilename = `${screenshotDir}/out-${screenshotCount}.png`;
    try {
      await fs.promises.access(`./${screenshotDir}`)
    } catch (ex) {
      await fs.promises.mkdir(`./${screenshotDir}`);
    }
    await fs.promises.writeFile(screenshotFilename, image, "base64");
    console.log(`recorded screenshot: ${screenshotFilename}`)

    await driver.quit();
  });

  it("loads a single page", async function () {

    // start with page 1.
    await driver.get("http://localhost:8091");

    // what should come next 

    // await driver.wait(
    //   until.titleIs("Sign Up | Mozilla Rally"),
    //   WAIT_FOR_PROPERTY
    // );
    // await findAndAct(driver, By.css("button"), e => e.click());

    // // Google sign-in prompt should open
    // await driver.wait(async () => {
    //   return (await driver.getAllWindowHandles()).length === 2;
    // }, WAIT_FOR_PROPERTY);

    // await driver.switchTo().window((await driver.getAllWindowHandles())[1]);

    // await driver.wait(
    //   until.titleIs("Auth Emulator IDP Login Widget"),
    //   WAIT_FOR_PROPERTY
    // );

    // // FIXME this emulator auth pop-up isn't ready on the default "loaded" event, the window will close anyway so retry until it responds.
    // await driver.executeScript(`window.setInterval(() => document.querySelector(".mdc-button").click(), 1000)`);

    // await findAndAct(driver, By.id('autogen-button'), e => e.click());
    // await findAndAct(driver, By.id('sign-in'), e => e.click());

    // // Google sign-in prompt should close.
    // await driver.wait(async () => {
    //   return (await driver.getAllWindowHandles()).length === 1;
    // }, WAIT_FOR_PROPERTY);

    // // Switch back to original window.
    // await driver.switchTo().window((await driver.getAllWindowHandles())[0]);

    // await driver.wait(
    //   until.titleIs("Privacy Policy | Mozilla Rally"),
    //   WAIT_FOR_PROPERTY
    // );

    // // TODO add Cancel button test, not implemented by site yet.
    // await findAndAct(driver, By.xpath('//button[text()="Accept & Enroll"]'), e => e.click());
    // await findAndAct(driver, By.xpath('//button[text()="Skip for Now"]'), e => e.click());

    // await driver.wait(
    //   until.titleIs("Studies | Mozilla Rally"),
    //   WAIT_FOR_PROPERTY
    // );

    // // Start to join study, but cancel.
    // await findAndAct(driver, By.xpath('//button[text()="Join Study"]'), e => e.click());
    // await findAndAct(driver, By.xpath('//button[text()="Cancel"]'), e => e.click());

    // // Start to join study, and confirm.
    // await findAndAct(driver, By.xpath('//button[text()="Join Study"]'), e => e.click());
    // await findAndAct(driver, By.xpath('//button[text()="Accept & Enroll"]'), e => e.click());

    // if (loadExtension) {
    //   // FIXME need to load Chrome-compatible study metadata into firestore.
    //   if (testBrowser === "firefox") {
    //     await driver.wait(async () =>
    //       await extensionLogsPresent(driver, testBrowser, `Start data collection`),
    //       WAIT_FOR_PROPERTY
    //     );
    //   }
    // }

    // // Start to leave study, but cancel.
    // await findAndAct(driver, By.xpath('//button[text()="Leave Study"]'), e => e.click());
    // await findAndAct(driver, By.xpath('//button[text()="Cancel"]'), e => e.click());

    // // Start to leave study, and confirm.
    // await findAndAct(driver, By.xpath('//button[text()="Leave Study"]'), e => e.click());
    // await findAndAct(driver, By.xpath('(//button[text()="Leave Study"])[2]'), e => e.click());

    // if (loadExtension) {
    //   // FIXME need to load Chrome-compatible study metadata into firestore.
    //   if (testBrowser === "firefox") {
    //     await driver.wait(async () =>
    //       await extensionLogsPresent(driver, testBrowser, `Pause data collection`),
    //       WAIT_FOR_PROPERTY
    //     );
    //   }
    // }

    // FIXME the website hasn't implemented this yet
    // await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath('//button[text()="Accent & Enroll"]'))), WAIT_FOR_PROPERTY);
  });

  // it("fails to sign up for a new email account with invalid info", async function () {
  //   await driver.wait(
  //     until.titleIs("Sign Up | Mozilla Rally"),
  //     WAIT_FOR_PROPERTY
  //   );

  //   // Invalid email address fails.
  //   await driver.findElement(By.id('id_user_email')).sendKeys("test123");
  //   await driver.findElement(By.id('id_user_pw')).sendKeys("test1234");
  //   await findAndAct(driver, By.xpath('//button[text()="Sign Up"]'), e => e.click());

  //   await driver.findElement(By.id('id_user_email')).clear();
  //   await driver.findElement(By.id('id_user_pw')).clear();

  //   // Weak password fails.
  //   await driver.findElement(By.id('id_user_email')).sendKeys("test123");
  //   await driver.findElement(By.id('id_user_pw')).sendKeys("test1234");
  //   await findAndAct(driver, By.xpath('//button[text()="Sign Up"]'), e => e.click());

  //   await driver.findElement(By.id('id_user_email')).clear();
  //   await driver.findElement(By.id('id_user_pw')).clear();

  //   // Signing up into an ID already used registered with a different provider fails.
  //   await driver.findElement(By.id('id_user_email')).sendKeys("test123");
  //   await driver.findElement(By.id('id_user_pw')).sendKeys("test1234");
  //   await findAndAct(driver, By.xpath('//button[text()="Sign Up"]'), e => e.click());
  // });

  // it("fails to sign into website with invalid email credentials", async function () {
  //   await driver.wait(
  //     until.titleIs("Sign Up | Mozilla Rally"),
  //     WAIT_FOR_PROPERTY
  //   );

  //   // Totally invalid credentials fail
  //   await driver.findElement(By.id('id_user_email')).sendKeys("test123");
  //   await driver.findElement(By.id('id_user_pw')).sendKeys("test1234");
  //   await findAndAct(driver, By.xpath('//button[text()="Log In"]'), e => e.click());

  //   await driver.findElement(By.id('id_user_email')).clear();
  //   await driver.findElement(By.id('id_user_pw')).clear();

  //   // Logging into an ID already used registered with a different provider fails
  //   await driver.findElement(By.id('id_user_email')).sendKeys("test123");
  //   await driver.findElement(By.id('id_user_pw')).sendKeys("test1234");
  //   await findAndAct(driver, By.xpath('//button[text()="Log In"]'), e => e.click());
  // });

  // it("signs up for website with valid email credentials", async function () {
  //   // Valid credentials succeed.
  //   await driver.findElement(By.id('id_user_email')).sendKeys("test@example.com");
  //   await driver.findElement(By.id('id_user_pw')).sendKeys("validpass123");
  //   await findAndAct(driver, By.xpath('//button[text()="Sign Up"]'), e => e.click());

  //   await driver.findElement(By.id('id_user_email')).clear();
  //   await driver.findElement(By.id('id_user_pw')).clear();

  //   // Unverified account can be logged into, but cannot be used until verified.
  //   await driver.findElement(By.id('id_user_email')).sendKeys("test@example.com");
  //   await driver.findElement(By.id('id_user_pw')).sendKeys("validpass123");
  //   await findAndAct(driver, By.xpath('//button[text()="Log In"]'), e => e.click());

  //   const readInterface = readline.createInterface({
  //     input: createReadStream('integration.log'),
  //     output: process.stdout
  //   });

  //   let verifiedEmail = false;
  //   readInterface.on('line', async function (line) {
  //     if (!verifiedEmail && line.includes(`To verify the email address test@example.com, follow this link:`)) {
  //       const result = line.split(" ");
  //       const url = result[result.length - 1];
  //       await driver.executeScript(`window.open("${url}");`);
  //       verifiedEmail = true;
  //     }
  //   });

  //   // Wait for Selenium to open confirmation link.
  //   await driver.wait(async () => {
  //     return (await driver.getAllWindowHandles()).length >= 2;
  //   }, WAIT_FOR_PROPERTY);

  //   // Switch back to original window.
  //   await driver.switchTo().window((await driver.getAllWindowHandles())[0]);

  //   // Sign in again, need to get a new token that has email_verified as a claim.
  //   await driver.get("http://localhost:5000/signup");
  //   await driver.findElement(By.id('id_user_email')).sendKeys("test@example.com");
  //   await driver.findElement(By.id('id_user_pw')).sendKeys("validpass123");
  //   await findAndAct(driver, By.xpath('//button[text()="Log In"]'), e => e.click());

  //   await driver.wait(
  //     until.titleIs("Privacy Policy | Mozilla Rally"),
  //     WAIT_FOR_PROPERTY
  //   );

  //   // FIXME logout and log back in
  // });
});