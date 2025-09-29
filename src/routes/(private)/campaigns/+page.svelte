<script lang="ts">
	import { PageTitle } from '$components/page-title';
	import type { PageProps } from './$types';
	import { CampaignsGrid } from '$components/campaigns/index.js';

	let { data }: PageProps = $props();

	let campaigns = $derived(data.campaigns);
</script>

<PageTitle title="Campaigns" subtitle="Manage your campaigns" />

<CampaignsGrid {campaigns} />

<svelte:head>
	<title>Campaigns | Delightable</title>
</svelte:head>
