import { pageManager, events, messaging } from "@mozilla/web-science";
export default class Reporter {
    constructor({ collectorName, matchPatterns = ['<all_urls>'] }) {
        this.matchPatterns = matchPatterns;
        this.collectorName = collectorName;
        this.schemas = [];
        this.notifyAboutPrivateWindows = false;
        this.onPageData = events.createEvent({
            addListenerCallback: this._addListener.bind(this),
            removeListenerCallback: this._removeListener.bind(this)});
        // the storage instance stores the data and registers the namespace
        // for the app.
        //this.storage = new Storage({ namespace: collectorName });
    }

    _addListener(listener, options) {
        this._startMeasurement(options);
    }

    _removeListener(listener) {
        // if (!this.hasAnyListeners()) {
            this._stopMeasurement();
        // }
    }

    _pageDataListener(pageData) {
        // If the page is in a private window and the module should not measure private windows,
        // ignore the page
        if(!(this.notifyAboutPrivateWindows) && pageData.privateWindow) {
            return;
        }
    
        // Delete the type string from the content script message
        delete pageData.type;
        this.onPageData.notifyListeners([ pageData ]);
    }

    addSchema(schemaNamespace, schema) {
        this.schemas.push({ schema, schemaNamespace });
    }

    async _startMeasurement(matchPatterns = ['<all_urls>']) {
        await pageManager.initialize();

        this.registeredContentScript = await browser.contentScripts.register({
            matches: this.matchPatterns,
            js: [{
                file: `/dist/content-scripts/${this.collectorName}.collector.js`
            }],
            runAt: "document_start"
        });
        if (!this.schemas.length) { throw Error('the reporter must have at least one schema') }
        this.schemas.forEach(({ schemaNamespace, schema }) => {
            messaging.registerSchema(schemaNamespace, schema);
            messaging.onMessage.addListener(this._pageDataListener.bind(this), {type: schemaNamespace, schema });
        });

    }

    async _stopMeasurement() {
        this.schemas.forEach(({ schemaNamespace }) => {
            messaging.unregisterSchema(schemaNamespace);
            //messaging.unregisterListener(schemaNamespace, this._pageDataListener);    
        })
        
        this.registeredContentScript.unregister();
        this.registeredContentScript = null;
        this.notifyAboutPrivateWindows = false;
    }

    addListener(callback, options) {
        this.onPageData.addListener(callback, options);
    }
}