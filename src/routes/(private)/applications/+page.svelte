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
	import { ApplicationsTable } from '$components/applications/index.js';
	import { ArrowDownNarrowWide, ArrowUpNarrowWide, Rows2, Grid2x2 } from '@lucide/svelte';

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

	const activeOptionStyle = 'bg-primary text-primary-foreground rounded p-0.5';
	const inactiveOptionStyle = 'bg-secondary text-secondary-foreground rounded p-0.5';

	function styleFilterOption(option: 'ascending' | 'descending') {
		if (filterOption === option) {
			return activeOptionStyle;
		}

		return inactiveOptionStyle;
	}

	let viewOption = $state<'grid' | 'table'>('grid');

	function styleViewOption(option: 'grid' | 'table') {
		if (viewOption === option) {
			return activeOptionStyle;
		}
		return inactiveOptionStyle;
	}

	function updateViewOption(option: 'grid' | 'table') {
		viewOption = option;
	}

	function orderedActiveApplications() {
		return [...data.applications]
			.filter((a) => a.status !== 'no-response' && a.status !== 'rejected')
			.sort((a, b) => {
				if (filterOption === 'ascending') {
					return compareAsc(a.startDate, b.startDate);
				}

				return compareDesc(a.startDate, b.startDate);
			});
	}

	const completeApplications = $derived(data.completeApps);

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

<div class="my-4 flex items-center justify-end gap-2">
	<span class="text-xs">View:</span>
	<button onclick={() => updateViewOption('grid')}>
		<Grid2x2 class={styleViewOption('grid')} />
	</button>
	<button onclick={() => updateViewOption('table')}>
		<Rows2 class={styleViewOption('table')} />
	</button>
</div>

<div class="my-4 flex items-center justify-between">
	<h3 class="heading-3">Active applications</h3>
	<div class="flex items-center gap-2">
		<span class="text-xs">Sort by:</span>
		<button onclick={() => updateSortOption('ascending')}>
			<ArrowUpNarrowWide class={styleFilterOption('ascending')} />
		</button>
		<button onclick={() => updateSortOption('descending')}>
			<ArrowDownNarrowWide class={styleFilterOption('descending')} />
		</button>
	</div>
</div>

{#if viewOption === 'grid'}
	<ApplicationsGrid applications={activeApplicationsFilter.data} />
{:else}
	<ApplicationsTable applications={activeApplicationsFilter.data} />
{/if}

<h3 class="heading-3 mt-10 mb-5">Complete applications</h3>

{#if viewOption === 'grid'}
	<ApplicationsGrid applications={completeApplications} />
{:else}
	<ApplicationsTable applications={completeApplications} />
{/if}

<svelte:head>
	<title>Applications | Delightable</title>
</svelte:head>
