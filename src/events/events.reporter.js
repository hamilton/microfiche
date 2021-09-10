import Reporter from "../../lib/reporter";

const event = new Reporter({ collectorName: "events" });

// Event properties that both of these event types consume.
const sharedEventProperties = {
    pageId: "string",
    eventType: "string",
    timestamp: "number"
}

event.addSchema("event", {...sharedEventProperties});

export default event;