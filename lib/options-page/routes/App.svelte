<script>
  import { onMount } from 'svelte';
  import Main from "./Main.svelte";
  import { downloadJSON } from './download';
  import { get, size, reset } from '../state';
  export let namespaces;

  let data = [];
  let newNamespaces = [];
  async function update(ns) {
    let nns = [...ns.map(n=>({...n}))];
    for (const n of nns) {
      n.size = await size({ namespace: n.namespace });
    }
    return nns;
  }

onMount(async () => {
  newNamespaces = await update(namespaces);
})

// set up event listener + send event
</script>

<svelte:window on:focus={async () => {
  newNamespaces = await update(namespaces);
}} />

<Main 
  namespaces={newNamespaces} 
  on:download={async (event) => {
    const namespace = event.detail;
    const data = await get({ namespace });
    downloadJSON(data, `${namespace}-${new Date().toISOString().replace(/:/g, '-').replace('.', '-')}.json`);
  }}
  on:reset={async (event) => {
    const namespace = event.detail;
    await reset({ namespace });
    newNamespaces = await update(namespaces);
  }}
/>
