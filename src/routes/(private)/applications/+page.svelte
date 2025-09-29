<script lang="ts">
	import type { PageProps } from './$types';
	import { PageTitle } from '$components/page-title';
	import { ApplicationsGrid } from '$components/applications';

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

<PageTitle title="Applications" subtitle={resolveSubtitle} />

<ApplicationsGrid {applications} />

<svelte:head>
	<title>Applications | Delightable</title>
</svelte:head>
