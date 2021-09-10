/** 
 * This module manages the following:
 * - provides a storage endpoint for saving `AttentionEvent` and `AudioEvent` instances
 * - handles communication with the extension page that enables the user to inspect the events already collected and
 * download them
 * This functionality is handled through the {@link EventStreamInspector} class.
 * @example
 * // basic usage with the `onPageData` listener from {@link attention-reporter}
 * const inspector = new EventStreamInspector();
 * onPageData.addListener(async (data) => {
 *  // this datapoint will be viewable on the extension page
 *  await inspector.storage.push(data); 
 * }, {
 *     matchPatterns: ["<all_urls>"],
 *     privateWindows: false
 * });
 * @property {EventStreamStorage} storage - The {@link EventStreamStorage} instance.
 * @module EventStreamInspector
 */
import browser from "webextension-polyfill";

/**
 * @class EventStreamInspector
 * @classdesc This class manages the following:
 * - provides a storage endpoint for saving `AttentionEvent` and `AudioEvent` instances
 * - handles communication with the extension page that enables the user to inspect the events already collected and
 * download them
 * This functionality is handled through the {@link EventStreamInspector} class.
 * @property {EventStreamStorage} storage - The {@link EventStreamStorage} instance.
 */
export default class EventStreamInspector {
    constructor(storage) {
        this.storage = storage;
        this._connectionPort = {};
        /** @property {EventStreamStorage} storage - The {@link EventStreamStorage} instance. */
        this.initialize();
    }

	/**
	 * Initializes the listener used to communicate with this web extension's optional
     * extension page.
	 *
	 * @private
	 */
    initialize() {
        browser.runtime.onConnect.addListener(
            p => {
                this._onPortConnected(p);
            }
        );
    }

    /**
     * Creates the required listeners after the inspector has connected to the extension page.
     * @private
     */
    _onPortConnected(port) {
        const sender = port.sender;
        if ((sender.id != browser.runtime.id)) {
            console.error("Rally Study - received message from unexpected sender");
            port.disconnect();
            return;
        }

        this._connectionPort = port;
        this._connectionPort.onMessage.addListener(
            m => this._handleMessage(m, sender));
        this._connectionPort.onDisconnect.addListener(e => {
            console.log("Rally Study - disconnect or error", e);
            this._connectionPort = null;
        });
    }

    /**
     * Routes messages from the extension page to the corresponding private method.
     * @private
     */
    async _handleMessage(message) {
        switch (message.type) {
            case "size": {
                const size = await this.storage[message.data.namespace].count();
                this._connectionPort.postMessage(
                    { type: `size-${message.data.namespace}`, data: size });
                break;
            }
            case "get": {
                const data = await this.storage[message.data.namespace].toArray();
                this._connectionPort.postMessage(
                    { type: `get-${message.data.namespace}`, data });
                break;
            }
            case "reset": {
                await this.storage[message.data.namespace].clear();
                this._connectionPort.postMessage(
                    { type: `reset-${message.data.namespace}` });
                break;
            }
            default: {
                return Promise.reject(
                    new Error(`Rally Study - unexpected message type ${message.type}`));
            }
                
        }
    }
}