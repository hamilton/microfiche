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

    let spinner = tweened(1, {duration: 700, easing});
    let mounted = false;
    onMount(() => {
        mounted = true;
        spinner.set(0);
    });R

    const dispatch = createEventDispatcher();

    let confirm = undefined;
    const volumeFormatter = new Intl.NumberFormat();

</script>

{#if mounted}
    <div class="admin" in:fade={{ duration: 800 }}>
        <header>
            <h1><span style="display: inline-block; transform: rotate({$spinner * 270 * 1}deg);">📺</span> Untitled Webextension Framework</h1>
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
                    <a href='https://github.com/hamilton/untitled-webextension-framework'>Github</a>
                </li>
                <li>
                    <a href='https://github.com/hamilton/untitled-webextension-framework'>About</a>
                </li>
                <li>
                    <a href='https://github.com/hamilton/untitled-webextension-framework'>Reach Out</a>
                </li>
            </ul>
        </footer>
    </div>
{/if}
