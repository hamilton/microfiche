<script>
    import { fly } from 'svelte/transition';
    import NamespaceGrid from '../components/NamespaceGrid.svelte';
    import NamespaceControls from "../components/NamespaceControls.svelte";
    import CheapDialog from '../components/CheapDialog.svelte';
    import Main from "../routes/Main.svelte";

    let namespaces = [
        {
            title: "Attention Stream", 
            namespace: "attention", 
            size: 5610, 
            description: "How you work, play, and distract yourself on this thing called the internet."
        },
        {
            title: "Tab Hoarder", 
            namespace: "tabs", 
            size: 1, 
            description: "Wouldn't it be great if you could see a history of all your tabs? All your Mess? All your struggles? Now you can, you hoarder."},
        {
            title: "Twitter Contents", 
            namespace: "twitter", 
            size: 0
        },
        {
            title: "Second Brain", 
            namespace: "content", 
            size: 1530,
            description: "Indexes all of the content you see and makes it easy and fun to search and recall things. Reminds of you of things worth looking at juuuuust the right time."
        }
    ];

    let confirm = undefined;
    const volumeFormatter = new Intl.NumberFormat();
</script>

<Main {namespaces} on:reset={(event) => {
    //namespaces = namespaces.filter(n => n.name !== event.detail);
    const index = namespaces.findIndex(n => n.namespace === event.detail);
    if (index !== undefined) {
        namespaces[index].size = 0;
    }
}} />
<!-- 
{#if confirm}
<div transition:fly={{y: 2.5, duration: 100 }}>
    <CheapDialog on:escape={() => { confirm = undefined; }}>
        <svelte:fragment slot="title">
            🗑️ Clear all data for {confirm.name}?
        </svelte:fragment>
        <svelte:fragment slot="body">
            This will clear {volumeFormatter.format(confirm.size)} entr{#if confirm.size === 1}y{:else}ies{/if} the data from this collection.
            You can't undo this operation, so proceed carefully!
        </svelte:fragment>
        <svelte:fragment slot='cta'>
            <button class="btn-secondary" on:click={() => { confirm = undefined;  }}>cancel</button>
            <button class="btn-alarm" on:click={() => { 
                namespaces[confirm.index].size = 0;
                confirm = undefined; }}>clear data</button>
        </svelte:fragment>
    </CheapDialog>
</div>
{:else}
    <div transition:fly={{y:2.5, duration: 100 }}>
        <div style="position: absolute;">
            <NamespaceGrid>
                {#each namespaces as { name, size }, index (name)}
                    <NamespaceControls on:clear={() => { confirm = { title, size, index }; }} on:download={console.log} title={title} {size} />    
                {/each}
            </NamespaceGrid>
        </div>
    </div>
{/if} -->
