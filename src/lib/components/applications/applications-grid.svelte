<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade, fly } from 'svelte/transition';
	import type { ApplicationDto } from '$lib/applications/types';
	import { EmptySlate } from '$components/empty-slate';
	import { Grid } from '$components/grid';
	import { ApplicationCard } from '$components/applications';

	type Props = {
		applications: ApplicationDto[];
	};

	let { applications }: Props = $props();

	let hasApplications = $derived(applications.length > 0);
</script>

{#if !hasApplications}
	<EmptySlate
		caution
		title="No applications for the campaign"
		description="Create a new application to get started"
	>
		<a href="/applications/create" class="mt-2 underline">Create Application</a>
	</EmptySlate>
{:else}
	<Grid>
		{#each applications as application (application.id)}
			<div in:fade out:fly={{ x: 100 }} animate:flip={{ delay: 0, duration: 110 }}>
				<ApplicationCard {application} />
			</div>
		{/each}
	</Grid>
{/if}
