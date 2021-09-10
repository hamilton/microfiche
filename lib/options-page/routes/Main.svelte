<script>
    import { onMount, createEventDispatcher } from "svelte";
    import { tweened } from 'svelte/motion';
    import { elasticOut as easing } from 'svelte/easing';
    import { fly, fade } from "svelte/transition";

    import NamespaceGrid from "../components/NamespaceGrid.svelte";
    import NamespaceControls from "../components/NamespaceControls.svelte";
    import CheapDialog from "../components/CheapDialog.svelte";
    // export let namespaces;
    export let namespaces;
    export let startingTime;

    let spinner = tweened(1, {duration: 700, easing});
    let mounted = false;
    onMount(() => {
        mounted = true;
        spinner.set(0);
    });

    const dispatch = createEventDispatcher();

    let confirm = undefined;
    const volumeFormatter = new Intl.NumberFormat();

</script>

<!-- <style>
.cta {
    display: flex;
    gap: .5em;
}
</style> -->
{#if mounted}
    <div class="admin" in:fade={{ duration: 800 }}>
        <!-- <header>
            <h1>Event Stream Inspector</h1>
            <div class='cta'>
                <button disabled={data.length === 0} on:click={() => { dispatch('reset-data'); }} class='btn btn-secondary'>Reset Data</button>
                <button on:click={() => downloadJSON(data, `browsing-${new Date().toISOString().replace(/:/g, '-').replace('.', '-')}.json`)} disabled={data.length === 0} class="btn btn-primary download-csv"><Table size="1.25em" />
                    Download JSON</button>
            </div>
        </header> -->
        <header>
            <h1><span style="display: inline-block; transform: rotate({$spinner * 270 * 1}deg);">📺</span> RallyTV</h1>
        </header>
        <main>
            <div class='content-container'>
            {#if confirm}
            <div in:fly={{y: 2.5, duration: 100 }}>
                <CheapDialog on:escape={() => { confirm = undefined; }}>
                    <svelte:fragment slot="title">
                        🗑️ Clear all data for "{confirm.title}"?
                    </svelte:fragment>
                    <svelte:fragment slot="body">
                        This will clear {volumeFormatter.format(confirm.size)} entr{#if confirm.size === 1}y{:else}ies{/if} the data from this collection.
                        You can't undo this operation, so proceed carefully!
                    </svelte:fragment>
                    <svelte:fragment slot='cta'>
                        <button class="btn-secondary" on:click={() => { 
                            confirm = undefined;
                        }}>cancel</button>
                        <button class="btn-alarm" on:click={() => { 
                            dispatch('reset', confirm.namespace);
                            confirm = undefined; }}>clear data</button>
                    </svelte:fragment>
                </CheapDialog>
            </div>
            {:else}
                <div in:fly={{y:2.5, duration: 100 }}>
                    <div>
                        <h2>🏗️ Download <span style="font-weight: 400;">The Datasets You've Built</span></h2>
                        <NamespaceGrid>
                            {#each namespaces as { title, size, namespace, description }}
                                <NamespaceControls 
                                    on:clear={() => { confirm = { title, size: size, namespace }; }} 
                                    on:download 
                                    {title} 
                                    {size}
                                    {description}
                                    {namespace}
                                 /> 
                            {/each}
                        </NamespaceGrid>
                    </div>
                </div>
            {/if}
            </div>
        </main>
        <footer>
            <ul>
                <li>
                    <a href='https://rally.mozilla.org'>Rally</a>
                </li>
                <li>
                    <a href='https://rally.mozilla.org'>About</a>
                </li>
                <li>
                    <a href='https://rally.mozilla.org'>Reach Out</a>
                </li>
            </ul>
        </footer>
    </div>
{/if}
