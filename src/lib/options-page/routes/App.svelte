<script lang="ts">
  import { onMount } from 'svelte';
  import Main from "./Main.svelte";
  import { downloadJSON } from './download';
  import { get, size, reset } from '../state';

  import type { ModuleConfiguration } from "../../config-interface";
  import type { LiveModuleInformation } from "../live-module-information"

  export let namespaces:ModuleConfiguration[];

  let data = [];
  let newNamespaces:LiveModuleInformation[] = [];
  async function update(ns:ModuleConfiguration[]) {

    let nns:LiveModuleInformation[] = [];
    for (const n of ns) {
      const s = await size({ namespace: n.namespace });
      nns.push({ ...n, size: s })
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
