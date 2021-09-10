<script>
    import { createEventDispatcher } from 'svelte';
    export let title;
    export let size;
    export let description;
    export let namespace;
    const dispatch = createEventDispatcher();

    const volumeFormatter = new Intl.NumberFormat();
</script>

<div class='align-left' style="padding-right: 2rem;">
    <div style="padding-top:.45rem; font-weight: 700;">
        {title}
    </div>
    {#if description}
        <div style="padding-top:.2rem; font-size: .95rem;">{description}</div>
    {/if}
</div>
<div class='as-number' style="padding-top:.45rem;">
    {#if size}
        {volumeFormatter.format(~~size)}
    {:else}
        <span class='no-data'>no data</span>
    {/if}
</div>
<div>
    <button disabled={size === 0} on:click={() => { dispatch("clear", title); }} class='btn-secondary'>🗑️ clear</button>
</div>
<div>
    <button disabled={size === 0} on:click={() => { dispatch("download", namespace); }}>{#if size === 0}😴{:else}🥳{/if} download</button>
</div>