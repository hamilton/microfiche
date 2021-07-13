/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 jest.mock('webextension-polyfill', () => require('sinon-chrome/webextensions'));
 const browser = require("webextension-polyfill");
 const sinon = require('sinon');
 
 const EventStreamInspector = require('../../lib/event-stream-inspector').default;

 describe('EventStreamInspector', function () {
  let webExtensionStorage = {};
  let inspector;
  beforeAll(function() {
    global.browser = browser;
    global.browser.storage = {};
    global.browser.storage.local = {
      async get(key) {
        if (key === null) {
          return webExtensionStorage;
        }
        const value = webExtensionStorage[key];
        return { [key]: value };
      },
      async set(obj) {
        const [key, value] = Object.entries(obj)[0];
        webExtensionStorage[key] = value;
      },
      async clear() {
        webExtensionStorage = {};
      },
    };
  });

    afterAll(function() {
      browser.flush();
      delete global.browser;
    })
  
   beforeEach(function () {
    webExtensionStorage = {};
    inspector = new EventStreamInspector();
   });

   describe('_onPortConnected()', function () {
    it('rejects unknown sender addon', function () {
      const fakePort = {
         sender: {
          id: "unknown-addon",
         },
         disconnect: sinon.spy(),
      };
      inspector._onPortConnected(fakePort);
      expect(fakePort.disconnect.calledOnce).toBeTruthy();
    });

    it('rejects unknown sender url', function () {
      // Mock the URL of the options page.
      const TEST_OPTIONS_URL = "install.sample.html";
      browser.runtime.getURL.returns(TEST_OPTIONS_URL);

      const fakePort = {
         sender: {
          id: "~~~~~~",
          url: "unknown-url.html"
         },
         disconnect: sinon.spy(),
      };

      // Provide an unknown message type and a valid origin:
      // it should fail due to the unexpected type.
      inspector._onPortConnected(fakePort);
      expect(fakePort.disconnect.calledOnce).toBeTruthy();
    });
  });

  describe('_handleMessage', function() {
    it('rejects unknown messages', function () {
      // Mock the URL of the options page.
      const TEST_OPTIONS_URL = "install.sample.html";
      browser.runtime.getURL.returns(TEST_OPTIONS_URL);

      // Provide an unknown message type and a valid origin:
      // it should fail due to the unexpected type.
      expect(() => inspector._handleMessage({type: "test-unknown-type", data: {}})).rejects.toThrowError();
    });

    it('dispatches get-data messages', async function () {
      // Mock the URL of the options page.
      const TEST_OPTIONS_URL = "install.sample.html";
      browser.runtime.getURL.returns(TEST_OPTIONS_URL);
      inspector._sendDataToUI = jest.fn();
      await inspector._handleMessage(
        {type: "get-data"}
      );

      expect(inspector._sendDataToUI.mock.calls.length).toBe(1);
    });

    it('dispatches reset messages', async function () {
      // Mock the URL of the options page.
      const TEST_OPTIONS_URL = "install.sample.html";
      browser.runtime.getURL.returns(TEST_OPTIONS_URL);
      inspector._reset = jest.fn();
      await inspector._handleMessage(
        { type: "reset" }
      );

      expect(inspector._reset.mock.calls.length).toBe(1);
    });
  })

  describe('._getData', function() {
    it('sends the current events to the port', async function() {
      const events = [
        { elapsed: 1023, url: "https://example.biz" }
      ]
      inspector.storage.get = jest.fn(() => Promise.resolve(events));
      inspector._connectionPort = { postMessage: jest.fn() }
      await inspector._getData('test');
      expect(inspector._connectionPort.postMessage.mock.calls.length).toBe(1);
      expect(inspector._connectionPort.postMessage.mock.calls[0][0]).toEqual({type: "receive-data", data: events });
      expect(inspector.storage.get.mock.calls.length).toBe(1);
    })
  })

  describe('._reset', function() {
    it('sends the current events to the port', async function() {
    //   const events = [
    //     { elapsed: 1023, url: "https://example.biz" }
    //   ]
      inspector.storage.reset = jest.fn(() => Promise.resolve());
      inspector._connectionPort = { postMessage: jest.fn() };
      await inspector._reset();
      expect(inspector._connectionPort.postMessage.mock.calls.length).toBe(1);
      expect(inspector._connectionPort.postMessage.mock.calls[0][0]).toEqual({ type: "reset-finished" });
      expect(inspector.storage.reset.mock.calls.length).toBe(1);
    })
  })
  
  afterEach(function () {
    browser.flush();
    jest.resetModules();
  });
});