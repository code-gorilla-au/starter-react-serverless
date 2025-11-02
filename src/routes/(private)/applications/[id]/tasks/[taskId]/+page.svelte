<script lang="ts">
	import { PageTitle } from '$components/page-title/index.js';
	import { type PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { BaseInput } from '$components/base-input';
	import { BaseSelect } from '$components/base-select';
	import { DatePicker } from '$components/date-picker';
	import { type DateValue, fromDate } from '@internationalized/date';
	import type { TaskStatusDto } from '$lib/applications/types';
	import { Button } from '$components/ui/button';
	import { Textarea } from '$components/ui/textarea';
	import { EditableNotes } from '$components/notes';

	let { data, params }: PageProps = $props();

	let task = $derived(data.task);
	let applicationId = $derived(params.id);
	let taskId = $derived(params.taskId);

	async function routeBackToApplication() {
		await goto(`/applications/${applicationId}`);
	}

	type FormData = {
		dueDate?: DateValue;
		status: TaskStatusDto;
	};

	const formData = $state<FormData>({
		dueDate: data.task.dueDate ? fromDate(data.task.dueDate, 'UTC') : undefined,
		status: data.task.status
	});

	const taskStatus = [
		{
			label: 'Active',
			value: 'active'
		},
		{
			label: 'Completed',
			value: 'completed'
		},
		{
			label: 'Closed',
			value: 'closed'
		},
		{
			label: 'Archived',
			value: 'archived'
		}
	];
</script>

<PageTitle backAction={routeBackToApplication} title={task.name} />

<div class="flex w-full flex-wrap gap-4">
	<form
		method="POST"
		action="?/updateTask"
		class="dashboard-card flex min-w-xs flex-1 flex-col gap-1"
	>
		<input type="hidden" name="applicationId" value={applicationId} />

		<BaseInput name="name" label="Name" value={task.name} />
		<div>
			<span class="text-sm">Description</span>
			<Textarea
				name="description"
				placeholder="Description of the task"
				value={task.description}
			/>
		</div>
		<BaseSelect name="status" label="Status" data={taskStatus} bind:value={formData.status} />
		<div class="py-1">
			<span class="text-sm">Due date</span>
			<DatePicker bind:value={formData.dueDate} />
		</div>
		<div class="my-5 flex items-center justify-end gap-2">
			<Button
				type="button"
				variant="destructive"
				onclick={async (e: Event) => {
					e.preventDefault();
					await goto(`/applications/${applicationId}/tasks/${taskId}/delete`);
				}}
			>
				Delete
			</Button>
			<Button type="submit">Update</Button>
		</div>
	</form>

	<div class="dashboard-card min-w-sm flex-2">
		<EditableNotes formAction="?/updateTaskNote" notes={task.notes} />
	</div>
</div>

<svelte:head>
	<title>Task: {task.name} | Delightable</title>
</svelte:head>
