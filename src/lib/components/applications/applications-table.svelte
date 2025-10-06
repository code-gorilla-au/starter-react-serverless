<script lang="ts">
	import type { ApplicationDto } from '$lib/applications/types';
	import * as Table from '$components/ui/table';
	import { prettyDate } from '$lib/hooks/formats';
	import { EmptySlate } from '$components/empty-slate';
	import { Button } from '$components/ui/button';
	import { ApplicationDropdownMenu } from '$components/applications/index.js';

	type Props = {
		applications: ApplicationDto[];
	};

	let { applications }: Props = $props();
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Company</Table.Head>
			<Table.Head>Position</Table.Head>
			<Table.Head>Status</Table.Head>
			<Table.Head>Applied</Table.Head>
			<Table.Head class="text-right">No. Notes</Table.Head>
			<Table.Head />
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#if applications.length === 0}
			<Table.Row>
				<Table.Cell colspan={5}>
					<EmptySlate
						caution
						title="No applications for the campaign"
						description="Create a new application to get started"
					>
						<a href="/applications/create" class="mt-2 underline">Create Application</a>
					</EmptySlate>
				</Table.Cell>
			</Table.Row>
		{:else}
			{#each applications as application (application.id)}
				<Table.Row>
					<Table.Cell class="capitalize">{application.company}</Table.Cell>

					<Table.Cell class="capitalize">{application.position}</Table.Cell>
					<Table.Cell class="capitalize">{application.status}</Table.Cell>
					<Table.Cell class="w-[50px]">{prettyDate(application.startDate)}</Table.Cell>
					<Table.Cell align="right">{application.notes.length}</Table.Cell>
					<Table.Cell align="right">
						<ApplicationDropdownMenu {application} />
					</Table.Cell>
				</Table.Row>
			{/each}
		{/if}
	</Table.Body>
</Table.Root>
