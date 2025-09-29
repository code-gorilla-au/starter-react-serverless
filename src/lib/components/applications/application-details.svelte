<script lang="ts">
	import * as DropdownMenu from '$components/ui/dropdown-menu';
	import { EllipsisVertical } from '@lucide/svelte';
	import { prettyDate } from '$lib/hooks/formats';
	import type { ApplicationDto } from '$lib/applications/types';
	import { Button } from '$components/ui/button';

	type Props = {
		application: ApplicationDto;
	};

	let { application }: Props = $props();
</script>

<div class="dashboard-card flex flex-col gap-1">
	<div class="row">
		<h3 class="row-label">Company</h3>
		<div class="flex w-1/2 items-center justify-between gap-2">
			<h3 class="row-value">{application.company}</h3>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button size="sm" {...props} variant="ghost"><EllipsisVertical /></Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56" align="start">
					<DropdownMenu.Group>
						<DropdownMenu.Item>
							<a class="w-full" href={`/applications/${application.id}/edit`}>
								Edit
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<a class="w-full" href={`/applications/${application.id}/delete`}>
								Delete
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<a class="w-full" target="_blank" href={application.url}>
								External link
							</a>
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>

	<div class="row">
		<h3 class="row-label">Position</h3>
		<div class="w-1/2">
			<h3 class="row-value">{application.position}</h3>
		</div>
	</div>

	<div class="row">
		<h3 class="row-label">Salary</h3>
		<div class="w-1/2">
			<h3 class="row-value">{application.salary}</h3>
		</div>
	</div>

	<div class="row">
		<h3 class="row-label">Status</h3>
		<div class="w-1/2">
			<h3 class="row-value capitalize">{application.status}</h3>
		</div>
	</div>

	<div class="row">
		<h3 class="row-label">Date Applied</h3>
		<div class="w-1/2">
			<h3 class="row-value">{prettyDate(application.startDate)}</h3>
		</div>
	</div>
</div>

<style lang="postcss">
	@reference "$design";
	.row {
		@apply flex justify-between;
	}
	.row-label {
		@apply text-xs font-semibold text-muted-foreground;
	}
	.row-value {
		@apply text-sm font-semibold;
	}
</style>
