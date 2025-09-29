<script lang="ts">
	import type { PageProps } from './$types';
	import { PageTitle } from '$components/page-title';
	import { ApplicationsGrid } from '$components/applications';
	import { Plus } from '@lucide/svelte';
    import {Button} from "$components/ui/button";
    import {goto} from "$app/navigation";

	let { data }: PageProps = $props();

	let defaultCampaign = $derived(data.defaultCampaign);
	let applications = $derived(data.applications);

	let resolveSubtitle = $derived.by(() => {
		if (defaultCampaign) {
			return `Applications for ${defaultCampaign.name}`;
		}

		return 'Applications for a campaign';
	});
</script>

<PageTitle title="Applications" subtitle={resolveSubtitle} >
    <Button onclick={async () => { await goto('/applications/create')}} variant="ghost" size="icon" ><Plus size={14} /> </Button>
</PageTitle>

<ApplicationsGrid {applications} />

<svelte:head>
	<title>Applications | Delightable</title>
</svelte:head>
