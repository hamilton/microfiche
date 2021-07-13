# The Playtest
## collection and reporting

### Design goals
- data collection functions should be mostly functional, only closing over `document` and `window` to the extent that these are needed. This mostly-functional approach makes your data collection much cleaner, easier to test, and easier to reuse.
- the collectors should not be too big. Right now, the biggest contribution to them is immer's `produce` function, which adds 15kb per collection effort. This is both not very big but probably avoidable if we were to handle immer differently than we are right now.
- indexeddb might be a good solution, so let's try that.

## to use this repository to collect your own data and play with it:

1. fork or clone this repository
2. run `npm install`
3. if you are:
   1. a chrome user: run `npm run build:addon`, then [follow the instructions to load an unpacked web extension](https://developer.chrome.com/docs/extensions/mv2/getstarted/).
   2. a firefox user: 
      1. you'll have to use Nightly. Set `xpinstall.signatures.required` to `false` in `about:config`. 
      2. then run `npm run build` in this directory.
      3. Then you can load the add-on from `about:addons`.
4. browse for a few days to generate data.
5. Go the the extension page and click the `download JSON` on the top right.

