<script>
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

function handleKeydown(event) {
		let key = event.key;
        if (key === 'Escape') {
            dispatch('escape');
        }
}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="c-modal" style="position: absolute;">
    <h2>
        <slot name="title" />
    </h2>
    <div>
        <slot name="body"></slot>
    </div>
    <div class='grid-row justify-right'>
        <slot name="cta"></slot>
    </div>
</div>