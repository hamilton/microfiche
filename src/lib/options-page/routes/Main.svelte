<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import { tweened } from 'svelte/motion';
    import { elasticOut as easing } from 'svelte/easing';
    import { fly, fade } from "svelte/transition";

    import NamespaceGrid from "../components/NamespaceGrid.svelte";
    import NamespaceControls from "../components/NamespaceControls.svelte";
    import CheapDialog from "../components/CheapDialog.svelte";
    import Logo from "../components/Logo.svelte";

    import type { LiveModuleInformation } from "../live-module-information";

    export let namespaces:LiveModuleInformation[];

    let spinner = tweened(1, {duration: 700, easing});
    let mounted = false;

    onMount(() => {
        mounted = true;
        spinner.set(0);
    });

    const dispatch = createEventDispatcher();

    let showConfirmation = false;
    let confirm:({ title:string, size: number, namespace:string });
    const volumeFormatter = new Intl.NumberFormat();

</script>

{#if mounted}
    <div class="admin" in:fade={{ duration: 400 }}>
        <header>
            <h1><Logo /></h1>
        </header>
        <main>
            <div class='content-container'>
            {#if showConfirmation}
            <div in:fly={{y: 2.5, duration: 100 }}>
                <CheapDialog on:escape={() => { showConfirmation = false; }}>
                    <svelte:fragment slot="title">
                        🗑️ Clear all data for "{confirm.title}"?
                    </svelte:fragment>
                    <svelte:fragment slot="body">
                        This will clear {volumeFormatter.format(confirm.size)} entr{#if confirm.size === 1}y{:else}ies{/if} the data from this collection.
                        You can't undo this operation, so proceed carefully!
                    </svelte:fragment>
                    <svelte:fragment slot='cta'>
                        <button class="btn-secondary" on:click={() => { 
                            showConfirmation = false;
                        }}>cancel</button>
                        <button class="btn-alarm" on:click={() => { 
                            dispatch('reset', confirm.namespace);
                            showConfirmation = false; }}>clear data</button>
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
                                    on:clear={() => { 
                                        showConfirmation = true;
                                        confirm = { title, size: size, namespace }; 
                                    }} 
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
                    <a href='https://github.com/hamilton/microfiche'>Github</a>
                </li>
                <li>
                    <a href='https://github.com/hamilton/microfiche#readme'>About</a>
                </li>
                <li>
                    <a href='https://github.com/hamilton/microfiche/issues'>File an issue</a>
                </li>
            </ul>
        </footer>
    </div>
{/if}
