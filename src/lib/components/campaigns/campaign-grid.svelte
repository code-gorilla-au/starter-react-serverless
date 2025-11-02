<script lang="ts">
	import type { CampaignDto } from '$lib/campaigns/types';
	import { EmptySlate } from '$components/empty-slate';
	import { Grid } from '$components/grid';
	import { Card, CardTitle } from '$components/ui/card';
	import { CardContent, CardHeader } from '$components/ui/card/index.js';
	import { formatDate, prettyDate } from '$lib/hooks/formats';
	import { Badge } from '$components/ui/badge';
	import CampaignDropdown from './campaign-dropdown.svelte';

	type Props = {
		campaigns: CampaignDto[];
	};

	let { campaigns }: Props = $props();
</script>

{#if campaigns.length === 0}
	<EmptySlate
		class="mt-20"
		caution={true}
		title="No campaigns found"
		description="A campaign is needed to start tracking your applications"
	>
		<a href="/campaigns/create" class="underline">Create a campaign</a>
	</EmptySlate>
{:else}
	<Grid>
		{#each campaigns as campaign (campaign.id)}
			<Card class="w-full">
				<CardHeader class="flex items-center justify-between">
					<CardTitle>{campaign.name}</CardTitle>
					<CampaignDropdown />
				</CardHeader>
				<CardContent>
					<p>{campaign.description}</p>
					<div class="card-row">
						<p class="row-label">Days active:</p>
						<p class="row-value">{formatDate(campaign.startDate)}</p>
					</div>
					<div class="card-row">
						<p class="row-label">Date started:</p>
						<p class="row-value">{prettyDate(campaign.startDate)}</p>
					</div>
					{#if campaign.endDate}
						<div class="card-row">
							<p class="row-label">End date:</p>
							<p class="row-value">{prettyDate(campaign.endDate)}</p>
						</div>
					{/if}
					{#if campaign.isDefault}
						<Badge>Default</Badge>
					{/if}
				</CardContent>
			</Card>
		{/each}
	</Grid>
{/if}

<style lang="postcss">
	@reference "$design";

	.card-row {
		@apply mb-2 flex items-baseline;
	}

	.row-label {
		@apply w-1/2 text-xs text-muted-foreground;
	}
	.row-value {
		@apply flex-1 text-sm;
	}
</style>
