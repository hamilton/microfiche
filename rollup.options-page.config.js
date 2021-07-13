/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import commonjs from "@rollup/plugin-commonjs";
 import resolve from "@rollup/plugin-node-resolve";
 // options page plugins
 import svelte from "rollup-plugin-svelte";
 import livereload from 'rollup-plugin-livereload';
 import { terser } from 'rollup-plugin-terser';
 import css from 'rollup-plugin-css-only';
 
console.log('GENERATE OPTIONS PAGE');

   const production = !process.env.ROLLUP_WATCH;
   /**
   * Server.for the developer mode options page.
   */
  function serve() {
     let server;
 
     function toExit() {
         if (server) server.kill(0);
     }
 
     return {
         writeBundle() {
             if (server) return;
             server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
                 stdio: ['ignore', 'inherit', 'inherit'],
                 shell: true
             });
 
             process.on('SIGTERM', toExit);
             process.on('exit', toExit);
         }
     };
 }
  
 export default (cliArgs) => [ {
     input: "lib/options-page/main.js",
     output: {
       sourcemap: true,
       format: "iife",
       name: "app",
       file: "public/build/bundle.js",
     },
     plugins: [
       svelte({
         compilerOptions: {
           // enable run-time checks when not in production
           dev: !production
         }
       }),
       // we'll extract any component CSS out into
       // a separate file - better for performance
       css({ output: 'bundle.css' }),
   
       // If you have external dependencies installed from
       // npm, you'll most likely need these plugins. In
       // some cases you'll need additional configuration -
       // consult the documentation for details:
       // https://github.com/rollup/plugins/tree/master/packages/commonjs
       resolve({
         browser: true,
         dedupe: ["svelte"],
       }),
       commonjs(),
   
       // In dev mode, call `npm run start` once
       // the bundle has been generated
       !production && serve(),
   
       // Watch the `public` directory and refresh the
       // browser on changes when not in production
       !production && livereload("public"),
   
       // If we're building for production (npm run build
       // instead of npm run dev), minify
       production && terser(),
     ],
     watch: {
       clearScreen: false,
     },
   }
 ];
 