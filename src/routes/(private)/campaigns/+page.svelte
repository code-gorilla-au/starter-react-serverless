<script lang="ts">
	import { PageTitle } from '$components/page-title';
	import type { PageProps } from './$types';
	import { CampaignsGrid } from '$components/campaigns/index.js';
    import {Button} from "$components/ui/button";
	import { Plus } from '@lucide/svelte';
    import {goto} from "$app/navigation";

	let { data }: PageProps = $props();

	let campaigns = $derived(data.campaigns);
</script>

<PageTitle title="Campaigns" subtitle="Manage your campaigns" >
    <Button onclick={async () => { await goto('/campaigns/create')}} variant="ghost"><Plus size={14} /></Button>
</PageTitle>

<CampaignsGrid {campaigns} />

<svelte:head>
	<title>Campaigns | Delightable</title>
</svelte:head>
