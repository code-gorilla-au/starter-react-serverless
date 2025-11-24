<script lang="ts">
	import { X } from '@lucide/svelte';
	import { ScrollArea } from '$components/ui/scroll-area';
	import { Separator } from '$components/ui/separator';
	import * as Table from '$lib/components/ui/table/index.js';
	import type { TaskDto } from '$lib/applications/types';
	import { BaseInput } from '$components/base-input/index.js';
	import { Button } from '$components/ui/button';
	import { prettyDate, truncate } from '$lib/hooks/formats';
	import { DatePicker } from '$components/date-picker';
	import type { DateValue } from '@internationalized/date';
	import { addApplicationTask } from '$lib/applications/queries.remote';

	type Props = {
		applicationId: string;
		tasks: TaskDto[];
		onSelectTask?: (task: TaskDto) => void;
	};

	let { tasks, applicationId, onSelectTask }: Props = $props();

	let showAddTaskForm = $state(false);
	let formDisabled = $state(false);
	let formData = $state<{ dueDate?: DateValue }>({
		dueDate: undefined
	});

	function hideAddTaskForm(e: Event) {
		e.preventDefault();
		showAddTaskForm = false;
	}
</script>

<div class="dashboard-card min-w-sm flex-2">
	<div>
		<h2 class="heading-2">Tasks</h2>
		<div></div>
	</div>
	<Separator class="my-1" />
	<ScrollArea class="h-[500px]">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head>Due Date</Table.Head>
					<Table.Head>Created</Table.Head>
					<Table.Head>Notes</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each tasks as task (task.id)}
					<Table.Row
						onclick={(e: Event) => {
							e.preventDefault();
							onSelectTask?.(task);
						}}
					>
						<Table.Cell class="capitalize">{truncate(task.name)}</Table.Cell>
						<Table.Cell class="capitalize">{task.status}</Table.Cell>
						{#if task.dueDate}
							<Table.Cell>{prettyDate(task.dueDate)}</Table.Cell>
						{:else}
							<Table.Cell>-</Table.Cell>
						{/if}
						<Table.Cell>{prettyDate(task.createdAt)}</Table.Cell>
						<Table.Cell>{task.notes.length}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</ScrollArea>
	<Separator class="my-1" />
	{#if !showAddTaskForm}
		<Button variant="link" onclick={() => (showAddTaskForm = true)}>+ Add task</Button>
	{:else}
		<form
			class="flex items-center gap-2"
			{...addApplicationTask.enhance(async ({ submit, form }) => {
				formDisabled = true;

				await submit();
				form.reset();

				showAddTaskForm = false;
				formDisabled = false;
			})}
		>
			<input type="hidden" name="applicationId" value={applicationId} />
			{#if formData.dueDate}
				<input type="hidden" name="dueDate" value={formData.dueDate?.toString()} />
			{/if}
			<button
				type="button"
				class="cursor-pointer rounded-full p-0.5 hover:bg-accent"
				onclick={hideAddTaskForm}><X size={16} /></button
			>
			<BaseInput required type="text" placeholder="Task name" name="name" />
			<DatePicker
				placeholder="Due date"
				formatShort
				class="w-1/3"
				bind:value={formData.dueDate}
			/>
			<Button disabled={formDisabled} size="sm" class="text-xs" type="submit">
				{#if formDisabled}
					Adding...
				{:else}
					+ Add task
				{/if}
			</Button>
		</form>
	{/if}
</div>

<style lang="postcss">
	@reference "$design";

	.dashboard-card {
		@apply rounded-lg bg-secondary/30 p-4;
	}
</style>
