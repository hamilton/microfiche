/* global pageManager */

// Declare the untyped WebScience libraries attachedd to window.
declare global {
    interface Window { 
        webScience: any;
        pageManager: any;
        pageManagerHasLoaded : Array<Function>
    }
}

// @ts-ignore
import { produce } from "immer/dist/immer.cjs.production.min";

const EVENTS = ['interval', 'page-visit-start', 'page-visit-stop', 'attention-start', 'attention-stop', 'audio-start', 'audio-stop'];

interface CollectorArguments {
    initialState?: object
}

interface eventHandler {
    [key: string]: Array<Function>;
}

export default class Collector {
    _state : object;
    collectors : object;
    reporters : object;
    collectionIntervals : Array<Function>;
    eventHandlers : eventHandler;
    eventIntervals : Array<{ callback : Function, timing : number, id?: number}>;

    constructor(args : CollectorArguments) {
        const initialState = args.initialState;
        // If no initial state is passed in, opt for a plain object.
        this._state = {...(initialState || {})};
        this.collectors = {};
        this.reporters = {};
        this.collectionIntervals = [];
        this.eventHandlers = {};
        this.eventIntervals = [];
    }

    get() {
        return produce(this._state, () => {});
    }

    updateState(callback : Function) {
        this._state = produce(this._state, callback);
        return this._state;
    }

    send(namespace : string, payload : Object) {
        const pageManager = window.webScience.pageManager;
        pageManager.sendMessage({
            type: namespace,
            ...payload
        });
    }

    on(event : string, callback : Function, timing : number) {
        if (!EVENTS.includes(event)) throw Error(`collect received an unrecognized event type "${event}"`);
        if (!(callback instanceof Function)) throw Error(`the collect callback must be a function. Instead received ${typeof callback}`);
        if (event === 'interval') {
            this.eventIntervals.push({
                callback, timing
            })
        } else {
            this.eventHandlers[event] = [...(this.eventHandlers[event] || []), callback];
        }
    }

    _executeEventCallbacks(event : string, params : any) {
        const pageManager = window.webScience.pageManager;
        this.eventHandlers[event].forEach((callback : Function) => {
            try {
                callback(this, params, pageManager);
            } catch (err) {
                console.error(err);
            }
        });
    }

    _runIntervals() {
        const pageManager = window.webScience.pageManager;
        if (this.eventIntervals.length) {
            this.eventIntervals.forEach((interval) => {
                interval.id = window.setInterval(() => {
                    try {
                        interval.callback(this, { timeStamp: +new Date() }, pageManager);
                    } catch (err) {
                        console.error(err);
                    }
                    
                }, interval.timing);
            });
        }
    }

    _addCallbacksToListener(event : string) {
        const pageManager = window.webScience.pageManager;

        if ((event !== 'interval') && !(event in this.eventHandlers)) { return; }
        if (event === 'interval') {
            this._runIntervals();
            return;
        }

        // FIXME: what is this type?
        let pageManagerEvent : { addListener : Function };
        if (event === 'page-visit-start') { pageManagerEvent = pageManager.onPageVisitStart; }
        else if (event === 'page-visit-stop') { pageManagerEvent = pageManager.onPageVisitStop; }
        else if (event === 'attention-start') { pageManagerEvent = pageManager.onPageAttentionUpdate; }
        else if (event === 'attention-stop') { pageManagerEvent = pageManager.onPageAttentionUpdate; }
        else if (event === 'audio-start') { pageManagerEvent = pageManager.onPageAudioUpdate; }
        else if (event === 'audio-stop') { pageManagerEvent = pageManager.onPageAudioUpdate; }
        else { throw Error(`event "${event}" not recognized`); }

        // run page visit start asap if pageManager is already running.
        if (event === 'page-visit-start' && pageManager.pageVisitStarted) {
            this._executeEventCallbacks('page-visit-start', { timeStamp: pageManager.pageVisitStartTime });
            return;
        }

        // FIXME: does pageManager output types? Probably not.
        pageManagerEvent.addListener((params : any) => {
            const thisCallbackShouldBeRun = 
            (event === 'attention-start' && pageManager.pageHasAttention) || // actual attention start
            (event === 'attention-stop' && !pageManager.pageHasAttention) || // actual attention end
            (event === 'audio-start' && pageManager.pageHasAudio) || // actual audio start
            (event === 'audio-stop' && !pageManager.pageHasAudio) || // actual audio end
            (event === 'page-visit-start' || event === 'page-visit-stop');
            if (event in this.eventHandlers && thisCallbackShouldBeRun) {
                this._executeEventCallbacks(event, params);
            }
        });
    }

    _addAllCallbacks() {
        this._addCallbacksToListener('page-visit-start');
        this._addCallbacksToListener('attention-start');
        this._addCallbacksToListener('audio-start');
        this._addCallbacksToListener('attention-stop');
        this._addCallbacksToListener('audio-stop');
        this._addCallbacksToListener('page-visit-stop');
        this._addCallbacksToListener('interval');
    }

    run() {
        if (("webScience" in window) && ("pageManager" in window.webScience)) {
            this._addAllCallbacks();
        }
        else {
            if(!("pageManagerHasLoaded" in window)) {
                window.pageManagerHasLoaded = [];
            }
            window.pageManagerHasLoaded.push(this._addAllCallbacks.bind(this));
        }
    }
}