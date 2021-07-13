async function sendToCore(port, type, payload) {
    const msg = {
        type,
        data: payload
    };

    port.postMessage(msg);
}

/**
 * Wait for a message coming on a port.
 *
 * @param {runtime.Port} port
 *        The communication port to expect the message on.
 * @param {String} type
 *        The name of the message to wait for.
 * @returns {Promise} resolved with the content of the response
 *          when the message arrives.
 */
async function waitForCoreResponse(port, type) {
return await new Promise(resolve => {
    const handler = msg => {
    if (msg.type === type) {
        port.onMessage.removeListener(handler);
        resolve(msg.data);
    }
    };
    port.onMessage.addListener(handler);
});
}

let _connectionPort;


async function initialize() {
    // _stateChangeCallbacks holds all the callbacks we want to execute
    // once the background sends a message with a new state.
    // initialize the connection port.
    _connectionPort =
      browser.runtime.connect({name: "rally-study-options-page"});
    // _connectionPort.onMessage.addListener(
    //   m => _handleMessage(m));
    // The onDisconnect event is fired if there's no receiving
    // end or in case of any other error. Log an error and clear
    // the port in that case.
    _connectionPort.onDisconnect.addListener(e => {
      console.error("Rally Study - there was an error connecting to the background script", e);
      _connectionPort = null;
    });
}

initialize();

export function createAction(name) {
    return async (message = {}) => {
        try {
        const response =
            waitForCoreResponse(_connectionPort, `${name}-${message.namespace}`);

        await sendToCore(_connectionPort, name, message);
        return await response;
        } catch(err) {
        console.error(err);
        } 
    }
}