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
	import { filterApplication } from './filters.js';
	import { compareAsc, compareDesc } from 'date-fns';
	import { Badge } from '$components/ui/badge/index.js';
	import { ApplicationsTable } from '$components/applications/index.js';

	let { data }: PageProps = $props();
	let defaultCampaign = $derived(data.defaultCampaign);
	let resolveSubtitle = $derived.by(() => {
		if (defaultCampaign) {
			return `Applications for ${defaultCampaign.name}`;
		}

		return 'Applications for a campaign';
	});

	let search = $state('');

	let filterOption = $state<'ascending' | 'descending'>('descending');

	function styleFilterOption(option: 'ascending' | 'descending') {
		if (filterOption === option) {
			return 'bg-primary text-primary-foreground';
		}

		return 'bg-secondary text-secondary-foreground';
	}

	function orderedActiveApplications() {
		return [...data.applications]
			.sort((a, b) => {
				if (filterOption === 'ascending') {
					return compareAsc(a.startDate, b.startDate);
				}

				return compareDesc(a.startDate, b.startDate);
			})
			.filter((a) => a.status !== 'no-response' && a.status !== 'rejected');
	}

	const completeApplications = $derived(
		data.applications.filter((a) => a.status === 'no-response' || a.status === 'rejected')
	);

	const activeApplicationsFilter = new SimpleFilter(orderedActiveApplications());

	const debouncedSearch = debouncedInput((input: string) => {
		activeApplicationsFilter.filterBy(filterApplication(input));
	}, 10);

	function updateSortOption(option: 'ascending' | 'descending') {
		filterOption = option;
		activeApplicationsFilter.subscribe(orderedActiveApplications());
	}
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

<h3 class="heading-3">Active applications</h3>

<div class="my-4">
	<span class="text-xs">Sort by:</span>
	<button onclick={() => updateSortOption('ascending')}>
		<Badge class={styleFilterOption('ascending')}>Ascending</Badge>
	</button>
	<button onclick={() => updateSortOption('descending')}>
		<Badge class={styleFilterOption('descending')}>Descending</Badge>
	</button>
</div>

<ApplicationsGrid applications={activeApplicationsFilter.data} />
<ApplicationsTable applications={activeApplicationsFilter.data} />

<h3 class="heading-3 mt-10 mb-5">Complete applications</h3>

<ApplicationsGrid applications={completeApplications} />

<svelte:head>
	<title>Applications | Delightable</title>
</svelte:head>
