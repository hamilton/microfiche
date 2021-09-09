import Dexie from "dexie";
import EventStreamInspector from "../lib/event-stream-inspector";

let databaseInstantiated = false;
let DB : Dexie;

let dbVersion = 0;

function initialize() {
    if (!databaseInstantiated) {
        DB = new Dexie("untitled-webextension-framework");    
        databaseInstantiated = true;
        const inspector = new EventStreamInspector(DB);
        inspector.initialize();
    }
    return DB;
}

let existingNamespaces : Array<string> = [];

const DEFAULTS = {
    devMode: false,
    replaceOnSamePrimaryKey: undefined
}

interface LocalCacheArguments {
    devMode?: boolean,
    replaceOnSamePrimaryKey?: string | undefined
}

export function createLocalCacheTable(namespace : string, additionalArguments : LocalCacheArguments = {}) {
    const { replaceOnSamePrimaryKey, devMode } = Object.assign({}, DEFAULTS, additionalArguments);
    if (existingNamespaces.includes(namespace)) {
        throw Error(`namepsace ${namespace} already exists`);
    }
    existingNamespaces.push(namespace);

    const database : Dexie = initialize();
    dbVersion += 1;
    let indices = "++id,createdAt";
    if (replaceOnSamePrimaryKey) {
        indices = `${replaceOnSamePrimaryKey},createdAt`
    }
    DB.version(dbVersion).stores({
        [namespace]: indices
    });

    return async function addToCache(datapoint : object) {
        if (devMode) {
            console.debug(namespace, datapoint);
        };
        // @ts-ignore
        datapoint.createdAt = +new Date();
        if (replaceOnSamePrimaryKey) {
            // @ts-ignore
            await database[namespace].put(datapoint);
        } else {
            // @ts-ignore
            await database[namespace].add(datapoint);
        }
    }
}

// {
//     events: "++id,createdAt",
//     pages: "pageId,createdAt"
// }

/* 

How do we want this to work?

import cacheLocally from "./cache-locally";

reporter.addEndpoint(cacheLocally);

reporter.onData("some-event-name", (datapoint) => {
    cacheLocally(point);
})
reporter.emit("some-event-name", cacheLocally);

cacheLocally(
    namespace,
    reporter
)


*/