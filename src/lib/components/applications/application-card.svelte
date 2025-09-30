<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import ApplicationCardDropdown from './application-card-dropdown.svelte';
	import type { ApplicationDto } from '$lib/applications/types';
	import { formatDate } from '$lib/hooks/formats';

	type Props = {
		application: ApplicationDto;
	};

	let { application }: Props = $props();
</script>

<Card>
	<CardHeader class="flex items-center justify-between">
		<CardTitle>{application.company}</CardTitle>
		<div>
			<ApplicationCardDropdown {application} />
		</div>
	</CardHeader>
	<CardContent>
		<div class="card-row">
			<p class="row-label">Position</p>
			<p class="row-value">{application.position}</p>
		</div>
		<div class="card-row">
			<p class="row-label">Status</p>
			<p class="row-value capitalize">{application.status}</p>
		</div>
		<div class="card-row">
			<p class="row-label">Salary</p>
			<p class="row-value">{application.salary}</p>
		</div>
		<div class="card-row">
			<p class="row-label">Applied</p>
			<p class="row-value">{formatDate(application.startDate)}</p>
		</div>
	</CardContent>
</Card>

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
