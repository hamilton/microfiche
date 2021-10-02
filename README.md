# Untitled Web Extension Framework

`untitled web extension framework` helps you collect and gives access to data about how you browse.
You can select any number of modules that collects aspects of your browsing history or build your own
using very simple primitives. You can choose to send the data to an endpoint or just store it locally
to be downloaded later.

The framework is built on CITP's `web-science`, which handles the "attention events" at the root of the framework.

## Installation instructions:

1. fork or clone this repository
2. run `npm install`
3. if you are:
   1. a chrome user: run `npm run build:addon`, then [follow the instructions to load an unpacked web extension](https://developer.chrome.com/docs/extensions/mv2/getstarted/).
   2. a firefox user: 
      1. you'll have to use Nightly. Set `xpinstall.signatures.required` to `false` in `about:config`. 
      2. then run `npm run build` in this directory.
      3. Then you can load the add-on from `about:addons`.
4. browse for a few days to generate data.
5. Go the the extension page and download the data.

## Modules

A data collection module contains two files:
1. a _collector_, which runs on a page and is responsible for collecting page elements, and
2. a _reporter_, which runs in a background script and is responsible for defining the collection schema & doing something with the results.

This repository comes with three modules:

- `pages`, which is the core module behind the framework. This module collects _page visits_ as discrete elements, along with fields such as `title` and `description`. It also records the maximum scroll depth of your page visit. The page visit data collected in other modules should be joined against the `pageId` in this one.
- `events`, which collects all the `attention` and `audio` events triggered by a user. An _attention event_ represents the user shifting focus to a specific page visit. We record a "start" and "stop" event when attention changes. An example of "start" events could be that the user triggers a new page load, a new view in an SPA, switches tabs, or switches windows. An example of  "stop" event is when a user closes a tab, ends a page visit by loading a new URL in the tab, closes the window, or lets the browser idle for more than 15 seconds. Because playing video could end up triggering the attention stop event, we also collect when the browser has active unmuted audio playing or not.
- `articles`, which is the first of a series of niche modules. Collects the full-page content & byline of any page that registers as an article by Readability.

## Adapters

Every module utilizes some kind of _adapter_, which tells the framwork what to do with the collected data. For now, the only adapter is `cache-locally`, which stores the collected data in a namespaced IndexedDB table in the options page. Down the line, we'll additionally add modules to send data to other endpoints.

## The attention model

The below diagram describes the attention model used by this framework. A _page visit_ may have any number of discrete attention or audio events in its lifecycle. This framework gives hooks that enable you to collect data at various points in the page visit life cycle.

![the attention model](./attention-model.png)