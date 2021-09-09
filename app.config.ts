/* 
This is an array of modules that we'd like to include in this build.
A module is defined as a single collector and a reporter.
A collector collects information from a page visit.
A reporter defines the schemas in the database and handles the inserting of the
information collected by each module.
*/
import type { ModuleConfiguration } from "./lib/config-interface";

// We utilize typescript to validate our configuration.
const config : Array<ModuleConfiguration> = [
    {
        namespace: "events",
        title: "Attention & Audio Events",
        description: "How and here you browse, measured.",
        src: "src/events/"
    },
    {
        namespace: "pages",
        title: "Page Elements",
        description: "Core features of each page you've visited.",
        src: "src/pages/",
        replaceOnSamePrimaryKey: true,
        primaryKey: "pageId"
    }
];

export default config;