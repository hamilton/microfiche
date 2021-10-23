import Dexie from "dexie";
import EventStreamInspector from "../lib/event-stream-inspector";

let databaseInstantiated = false;
let DB : Dexie;

let dbVersion = 0;

function initializeBackend() {
    if (!databaseInstantiated) {
        DB = new Dexie("microfiche");    
        databaseInstantiated = true;
        const inspector = new EventStreamInspector(DB);
        inspector.initialize();
    }
    return DB;
}

let existingNamespaces : Array<string> = [];

interface LocalCacheArguments {
    devMode?: boolean,
    replaceOnSamePrimaryKey?: string | undefined
}

const DEFAULTS = {
    devMode: false,
    replaceOnSamePrimaryKey: undefined
}

export function createLocalCacheTable(namespace : string, additionalArguments : LocalCacheArguments = {}) {
    const { replaceOnSamePrimaryKey, devMode } = Object.assign({}, DEFAULTS, additionalArguments);

    // Throw if this namespace has already been declared. Otherwise, add to list of existinNamespaces.
    if (existingNamespaces.includes(namespace)) {
        throw Error(`namepsace ${namespace} already exists`);
    }
    existingNamespaces.push(namespace);

    const database : Dexie = initializeBackend();
    dbVersion += 1;
    let indices = "++id,createdAt";
    if (replaceOnSamePrimaryKey) {
        indices = `${replaceOnSamePrimaryKey},createdAt`
    }
    DB.version(dbVersion).stores({
        [namespace]: indices
    });

    return async function addToCache(datapoint : object) {
        console.log('adding to cache', namespace, datapoint);
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