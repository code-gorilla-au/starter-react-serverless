<script lang="ts">
	import type { PageProps } from './$types';
	import { PageTitle } from '$components/page-title';
	import { ApplicationsGrid } from '$components/applications';
	import { Plus } from '@lucide/svelte';
	import { Button } from '$components/ui/button';
	import { goto } from '$app/navigation';
	import { SimpleFilter } from '$lib/hooks/filters.svelte';
	import { debouncedInput } from '$lib/forms';
	import { Searchbar } from '$components/searchbar/index.js';

	let { data }: PageProps = $props();

	let defaultCampaign = $derived(data.defaultCampaign);

	let search = $state('');

	const filteredApps = new SimpleFilter(data.applications);
	const debouncedSearch = debouncedInput((input: string) => {
		filteredApps.filterBy((app) => {
			if (input === '') {
				return true;
			}

			for (const [key, value] of Object.entries(app)) {
				if (key === 'notes') {
					continue;
				}

				if (typeof value !== 'string') {
					continue;
				}

				const term = input.toLowerCase().trim();
				const searchField = value.toLowerCase();
				if (searchField.includes(term)) {
					return true;
				}
			}

			return false;
		});
	}, 10);

	let resolveSubtitle = $derived.by(() => {
		if (defaultCampaign) {
			return `Applications for ${defaultCampaign.name}`;
		}

		return 'Applications for a campaign';
	});
</script>

<PageTitle title="Applications" subtitle={resolveSubtitle}>
	<div class="flex items-center gap-6">
		<Searchbar
			bind:value={search}
			onSearch={debouncedSearch}
			onClear={() => {
				search = '';
				debouncedSearch(search);
			}}
		/>
		<Button
			onclick={async () => {
				await goto('/applications/create');
			}}
			variant="ghost"
			size="icon"
		>
			<Plus size={14} />
		</Button>
	</div>
</PageTitle>

<ApplicationsGrid applications={filteredApps.data} />

<svelte:head>
	<title>Applications | Delightable</title>
</svelte:head>
