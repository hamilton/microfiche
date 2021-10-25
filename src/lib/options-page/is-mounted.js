// eslint-disable-next-line node/no-extraneous-import
import { onMount } from "svelte";
// eslint-disable-next-line node/no-extraneous-import
import { writable } from "svelte/store";

export default function isMounted() {
    const { set, subscribe } = writable(false);
    onMount(() => { set(true) });
    return { subscribe };
}