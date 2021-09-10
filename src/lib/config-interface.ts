/**
 * 
 * We're exporting the ModuleConfiguration interface in its own file
 * so we can use it in various parts of the system.
 */

export interface ModuleConfiguration {
    /** the namepsace */
    namespace: string,
    /** the title that appears on the options page */
    title: string,
    /** the description that appears on the options page */
    description: string,
    src: string,
    replaceOnSamePrimaryKey? : boolean,
    primaryKey? : string,
    matchPatterns? : Array<string>
}