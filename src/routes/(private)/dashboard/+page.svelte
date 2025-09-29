<script lang="ts">
	import { type PageProps } from './$types';
	import { EmptySlate } from '$components/empty-slate';

	let { data }: PageProps = $props();

	let hasCampaign = $derived(data.campaigns?.length > 0);
</script>

<h1>dashboard</h1>

{#if !hasCampaign}
	<EmptySlate
		class="mt-20"
		caution={true}
		title="No campaigns found"
		description="A campaign is needed to start tracking your applications"
	>
		<a href="/campaigns/create" class="underline">Create a campaign</a>
	</EmptySlate>
{/if}

<svelte:head>
	<title>Dashboard | Delightable</title>
</svelte:head>
