/** 
 * This module wraps `browser.storage.local` to provide an asynchronous array-like API.
 * @example
 * const storage = new EventStreamStorage();
 * async function demo() {
 *  // push an event onto the array.
 *  const length = await storage.push({"url": "https://example.biz"});
 *  // get the current length. It should be the same as length above.
 *  const sameLength = await storage.length();
 * 
 *  // data should be [{"url": "https://example.biz"}]
 *  const data = await storage.get();
 * 
 *  // resetting will set length back to 0.
 *  await storage.reset();
 * }
 * @module EventStreamStorage
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 import browser from 'webextension-polyfill';
 import { get, save, reset, size } from '../src/attention-storage'
 
/**
 * @class EventStreamStorage
 */ export default class EventStreamStorage {
    constructor() {
      this._initialize();
    }

  /** 
   * get all data in storage and return an array
   * 
   * @async
   * @example
   * // existing storage object
   * event.on('something', async () => {
   *  // get existing storage here
   *  const values = await storage.get();
   *  console.log(values);
   * });
   * @returns {array} the stored events
   */
    async get() {
      try {
        //const data = await browser.storage.local.get(null);
        const data = await get();
        delete data.index;
        // objects respect integer index order, so just return 
        return Object.values(data);
      } catch (err) {
        console.error(`Storage - failed to read from the local storage`, err);
        return Promise.resolve();
      }
    }

  /** 
   * pushes a new event into storage
   * 
   * @async
   * @example
   * event.on('newEvent', async (event) => {
   *  const newLength = await storage.set(event);
   *  console.log({ newLength });
   * });
   * @returns {number} the current length of the storage object
   */
    async push(value) {
      // const index = (await browser.storage.local.get("index")).index;
      // await browser.storage.local.set({ [index]: value });
      // const next = index + 1;
      // await browser.storage.local.set({ index: next });
      await save(value);
      return await size();
    }

  /** 
   * clears the storage instance
   * @example
   * event.on('deletion', async () => {
   *  await storage.reset();
   * });
   * @async
   */
    async reset() {
      //browser.storage.local.clear();
      reset();
      this._initialize();
    }
  
  /** 
   * 
   * @async
   * 
   * @example
   * event.on('next-event', async (event) => {
   *  const currentLength = await storage.length();
   *  if (currentLength < 100) {
   *    await storage.push(event);
   *  }
   * });
   * @returns {number} the current length of the storage array
   */
    async length() {
      //return (await browser.storage.local.get('index')).index;
      return await size();
    }

    async _initialize() {
        //await browser.storage.local.set({ index: 0 });
    }
  }
  