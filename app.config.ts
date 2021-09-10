/* 
This is an array of modules that we'd like to include in this build.
A module is defined as a single collector and a reporter.
A collector collects information from a page visit.
A reporter defines the schemas in the database and handles the inserting of the
information collected by each module.
*/
import type { ModuleConfiguration } from "./src/lib/config-interface";

// We utilize typescript to validate our configuration.
export const modules : Array<ModuleConfiguration> = [
    /**
     * DEFAULT MODULES
     * These are the two modules that are included in the basic build.
     */
     {
        namespace: "pages",
        title: "Page Elements",
        description: "Core features of each page you've visited.",
        src: "src/modules/pages/",
        /**
         * Update any existing entry with the same pageId.
         * This enables us to update the page information as we collect
         * more data.
         */
        replaceOnSamePrimaryKey: true,
        primaryKey: "pageId"
    },
    {
        namespace: "events",
        title: "Attention & Audio Events",
        description: "How and here you browse, measured.",
        src: "src/modules/events/"
    },

    /**
     * Add your modules below.
     */
];