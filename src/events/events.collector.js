/* 
This collector captures _only_ the individual page visit events.
*/

import Collector from '../../lib/collector';
const eventsCollector = new Collector();

function submitEvent(collector, eventType, timestamp, pageId) {
    collector.send("event", { eventType, timestamp, pageId });
}

function handleEvent(eventType) {
    return (collector, pageInfo, pageManager) => {
        submitEvent(collector, eventType, pageInfo.timeStamp, pageManager.pageId);
    }
}

eventsCollector.on('page-visit-start', handleEvent('page-visit-start'));
eventsCollector.on('page-visit-stop', handleEvent('page-visit-stop'));
eventsCollector.on('attention-start', handleEvent('attention-start'));
eventsCollector.on('attention-stop', handleEvent('attention-stop'));
eventsCollector.on('audio-start', handleEvent('audio-start'));
eventsCollector.on('audio-stop', handleEvent('audio-stop'));

// we will need to poll every second the current system time, and compare vs.
// the last entry we have.
// If the time diff > ~1 second, then this is a good sign that someone slammed their
// laptop shut but the system will never know. So we will create special "attention-stop" events
// for this eventuality.

// eventsCollector.on('interval', (collector, pageInfo, pageManager) => {
//     // update the two timestamps;
//     collector.updateState((state) => {
//         if (!("timeTracking" in state)) {
//             state.timeTracking = [];
//         }
//         // remove the first element of the array.
//         if (state.timeTracking.length === 2) {
//             state.shift();
//         }
//         state.push(new Date());
//     });
//     const [firstTime, secondTime] = collector.get().timeTracking;
//     const timeElapseIsTooLarge = secondTime - firstTime > 2000;

//     if (pageManager.hasAttention && timeElapseIsTooLarge) {
//         submitEvent(collector, 'attention-stop', firstTime, pageManager.pageId);
//         submitEvent(collector, 'attention-start', secondTime, pageManager.pageId);
//     }
//     if (pageManager.hasAudio && timeElapseIsTooLarge) {
//         submitEvent(collector, 'audio-stop', firstTime, pageManager.pageId);
//     }

// }, 1000);

eventsCollector.run();