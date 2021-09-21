/**
 * @jest-environment jsdom
 */
import Collector from "../../src/lib/collector";
import type { PageManager as PageManagerType, PageInfo } from "../../src/lib/collector";

interface TestCollectorState {
    value: number,
    anotherValue: number,
    text: string,
    time: number
}

interface TestPageManager extends PageManagerType {
    sendMessage: jest.Mock<Function>
}

declare global {
    var PageManager: TestPageManager;
}

const fcn1 = (collector:Collector) => { 
    collector.updateState((state:TestCollectorState) => {
        state.value = 10;
    })
};
const fcn2 = (collector:Collector) => { 
    collector.updateState((state:TestCollectorState) => {
        state.value = 20; state.text = 'test'; 
    });
};
const fcn3 = (collector:Collector, params: PageInfo) => { 
    collector.updateState((state:TestCollectorState) => {
        state.time = params.timeStamp;
    });
};

function mockPageManager() {
    const pageVisitStartCallbacks:Function[] = [];
    const pageVisitStopCallbacks:Function[] = [];
    const pageAttentionUpdateCallbacks:Function[] = [];
    const pageAudioUpdateCallbacks:Function[] = [];
    let pageVisitStarted = false;
    let pageVisitStartTime = 0;
    const PM : TestPageManager = { 
        pageId: 'whatever', url: "https://example.com",
        onPageVisitStart: {
            listeners: pageVisitStartCallbacks,
            addListener: (callback: Function) => { pageVisitStartCallbacks.push(callback) },
            send(params = { timeStamp: 1000 }){ 
                pageVisitStarted = true;
                pageVisitStartCallbacks.forEach(fcn => { fcn(params); } );
            }
        },
        onPageVisitStop: {
            listeners: pageVisitStopCallbacks,
            addListener: (callback: Function) => { pageVisitStopCallbacks.push(callback) },
            send: (params = { timeStamp: 1000 }) => { 
                pageVisitStopCallbacks.forEach(fcn => { fcn(params); } ) 
            }
        },
        onPageAttentionUpdate: {
            listeners: pageAttentionUpdateCallbacks,
            addListener: (callback: Function) => { pageAttentionUpdateCallbacks.push(callback) },
            send: (params = { timeStamp: 1000, pageHasAttention: true }) => {
                PM.pageHasAttention = params.pageHasAttention;
                pageAttentionUpdateCallbacks.forEach(fcn => { fcn(params); } );
            }
        },
        onPageAudioUpdate: {
            listeners: pageAudioUpdateCallbacks,
            addListener: (callback: Function) => { pageAudioUpdateCallbacks.push(callback) },
            send: (params = { timeStamp: 1000 }) => { 
                pageAudioUpdateCallbacks.forEach(fcn => { fcn(params); } ) 
            }
        },
        sendMessage: jest.fn(),
        pageHasAttention: true,
        pageHasAudio: true,
        get pageVisitStarted() {
            return pageVisitStarted;
        },
        get pageVisitStartTime() {
            return pageVisitStartTime
        }
    };
    PM.pageHasAttention = true;
    return PM;
}

describe('Collector.js', function() {
   let collector:Collector;
   beforeEach(function() {
       collector = new Collector();
       const pmMock = mockPageManager();
       global.PageManager = pmMock;
       global.window.webScience = {
           pageManager: pmMock
       }
   })
   describe('constructor', function() {
       it('keeps in local state the initialState and namespace', function() {
           expect(collector._state).toEqual({});
           const collectorTwo = new Collector({ initialState: { test: 100 }});
           expect(collectorTwo._state).toEqual({ test: 100 });
       })
   })
   describe('.collect', function() {
       it('throws if the event is an unrecognized string', function() {
           expect(() => collector.on('whatever', () => {})).toThrow();
       });
       it('adds callbacks to collectors', function() {
           collector.on('page-visit-start', fcn1);
           expect('page-visit-start' in collector.eventHandlers).toBe(true);
           expect(collector.eventHandlers['page-visit-start'][0]).toBe(fcn1);
           collector.on('page-visit-start', fcn2);
           expect('page-visit-start' in collector.eventHandlers).toBe(true);
           expect(collector.eventHandlers['page-visit-start'][0]).toBe(fcn1);
           expect(collector.eventHandlers['page-visit-start'][1]).toBe(fcn2);
           expect(collector.eventHandlers['page-visit-start'].length).toBe(2);
           collector.on('page-visit-stop', fcn3);
           expect('page-visit-stop' in collector.eventHandlers).toBe(true);
           expect(collector.eventHandlers['page-visit-stop'][0]).toBe(fcn3);
       })
   })

   // FIXME: these tests really got out of hand. Yeesh.
   describe("_addCallbacksToListener", function() {
        it('adds to the onPageVisitStart listener', function() {
            collector.on('page-visit-start', fcn1);
            collector.on('page-visit-start', fcn2);
            collector.on('page-visit-start', fcn3);
            collector._addCallbacksToListener('page-visit-start');
            expect(PageManager.onPageVisitStart.listeners.length).toBe(1);
            PageManager.onPageVisitStart.send({ timeStamp: 1000});
        })
        it('transforms the state object', function() {
            collector.on('page-visit-start', fcn1);
            collector.on('page-visit-start', fcn2);
            collector.on('page-visit-start', fcn3);
            collector._addCallbacksToListener('page-visit-start');
            PageManager.onPageVisitStart.send({ timeStamp: 60000000 });
            expect(collector._state).toEqual({ value: 20, text: 'test', time: 60000000 });
        })
        it('calls PageManager.sendMessage when there is a string (the namespace) as the second argument', function() {
            collector.on('page-visit-start', fcn1);
            collector.on('page-visit-start', fcn2);
            collector.on('page-visit-start', fcn3);
            collector.on('page-visit-start', (collector:Collector) => {
                collector.send('test', collector.get());
            })
            // this function will send whatever the payload is to the "test" namespace as-is
            collector._addCallbacksToListener('page-visit-start');
            PageManager.onPageVisitStart.send({ timeStamp: 60000000 });
            expect(PageManager.sendMessage.mock.calls.length).toBe(1);
            expect(PageManager.sendMessage.mock.calls[0][0]).toEqual({ type: "test", value: 20, text: "test", time: 60000000 });
        })
        it('calls PageManager.sendMessage when collector.report has a function as the second argument', function() {
            collector.on('page-visit-start', fcn1);
            collector.on('page-visit-start', fcn2);
            collector.on('page-visit-start', fcn3);
            collector.on('page-visit-start', (collector:Collector) => {
                collector.send('test', collector.get());
            });

            collector._addCallbacksToListener('page-visit-start');
            PageManager.onPageVisitStart.send({ timeStamp: 60000000 });
            expect(PageManager.sendMessage.mock.calls.length).toBe(1);
            expect(PageManager.sendMessage.mock.calls[0][0]).toEqual({ type: "test", value: 20, text: "test", time: 60000000 });
        })
        it('handles PageManager events during a full single-page lifecycle', function() {
            const check = jest.fn();
            const pageVisitStart1 = (collector:Collector, { timeStamp }:PageInfo) => { check('pageVisitStart1'); collector.updateState((state:TestCollectorState) => { state.time = timeStamp; state.count = 1;}) };
            const pageAttentionStart1 = (collector:Collector, { timeStamp }:PageInfo) => { check('pageAttentionStart1'); collector.updateState((state:TestCollectorState) => { state.time = timeStamp; state.count += 1;}) };
            const pageAttentionStop1 = (collector:Collector, { timeStamp }:PageInfo) => { check('pageAttentionStop1'); collector.updateState((state:TestCollectorState) => { state.time = timeStamp; state.count += 1;}) };
            const pageAttentionStop2 = (collector:Collector, { timeStamp }:PageInfo) => { check('pageAttentionStop2'); collector.updateState((state:TestCollectorState) => { state.time = timeStamp; state.count += 1; state.extra = true;}) };
            const pageVisitStop1 = (collector:Collector, { timeStamp }:PageInfo) => { check('pageVisitStop1'); collector.updateState((state:TestCollectorState) => { state.time = timeStamp; state.count += 1;}) };
            collector.on('page-visit-start', pageVisitStart1);
            collector.on('attention-start', pageAttentionStart1);
            collector.on('attention-stop', pageAttentionStop1);
            collector.on('attention-stop', pageAttentionStop2);
            collector.on('page-visit-stop', pageVisitStop1);
            collector.on("page-visit-stop", (collector:Collector) => { collector.send('test', collector.get()) });

            collector._addAllCallbacks();

            // run through each PageManager event as if the tab is active.
            PageManager.onPageVisitStart.send({ timeStamp: 6000000 });
            PageManager.onPageAttentionUpdate.send({ timeStamp: 6000020, pageHasAttention: true });
            // global.PageManager.pageHasAttention = true;
            PageManager.onPageAttentionUpdate.send({ timeStamp: 6000010, pageHasAttention: false });
            PageManager.onPageVisitStop.send({ timeStamp: 6000030 });

            expect(collector._state).toEqual({ time: 6000030, count: 5, extra: true});
            expect(PageManager.sendMessage.mock.calls[0][0]).toEqual({ type: "test", time: 6000030, count: 5, extra: true });

            // let's check the ordering of the calls.
            expect(check.mock.calls[0][0]).toBe('pageVisitStart1');
            expect(check.mock.calls[1][0]).toBe('pageAttentionStart1');
            expect(check.mock.calls[2][0]).toBe('pageAttentionStop1');
            expect(check.mock.calls[3][0]).toBe('pageAttentionStop2');
            expect(check.mock.calls[4][0]).toBe('pageVisitStop1');
        })
    })
    describe('_runIntervals', function() {
        it('will not run intervals if none are declared', async function() {
            // FIXME: figure out a good test case here.
            expect(() => {collector._runIntervals();}).not.toThrow();
            
        })
        it('handles a single interval collection', function() {
            jest.useFakeTimers();
            collector.on('interval', (collector:Collector) => {
                collector.updateState((state:TestCollectorState) => { state.value = (state.value || 0) + 1; });
            }, 500);
            collector._addCallbacksToListener('interval');
            jest.advanceTimersByTime(1501);
            const state = collector.get();
            expect(state).toEqual({ value: 3 });
        })
        it('handles multiple simultaneous interval collections', function() {
            jest.useFakeTimers();
            collector.on('interval', (collector:Collector) => {
                collector.updateState((state:TestCollectorState) => { state.value = (state.value || 0) + 1; });
            }, 500);
            collector.on('interval', (collector:Collector) => {
                collector.updateState((state:TestCollectorState) => { state.anotherValue = (state.anotherValue || 0) + 1; });
            }, 200);
            collector._addCallbacksToListener('interval');
            jest.advanceTimersByTime(1501);
            const state = collector.get();
            expect(state).toEqual({ value: 3, anotherValue: 7 });
        })
    })
    describe("running more than one collector", function() {
        it('registers callbacks in order that they are called', async function() {
            const c1 = new Collector();
            const collectorMock = jest.fn();
            const c2 = new Collector();
            c1.on('page-visit-start', () => collectorMock('first'));
            c2.on('page-visit-start', () => collectorMock('second'));
            
            // we are testing the order in which the callbacks are added to
            // the pageManager listener.
            c1._addAllCallbacks();
            c2._addAllCallbacks();

            PageManager.onPageVisitStart.send({ timeStamp: 6000000 });

            expect(collectorMock.mock.calls.length).toBe(2);
            expect(collectorMock.mock.calls[0][0]).toBe('first');
            expect(collectorMock.mock.calls[1][0]).toBe('second');
        })
    })
});