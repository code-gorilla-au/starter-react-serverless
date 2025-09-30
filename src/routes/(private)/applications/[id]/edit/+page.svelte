<script lang="ts">
	import { PageTitle } from '$components/page-title';
	import { type PageProps } from './$types';
	import { BaseInput } from '$components/base-input/index.js';
	import { DatePicker } from '$components/date-picker';
	import { type DateValue, fromDate } from '@internationalized/date';
	import type { ApplicationDtoStatus } from '$lib/applications/types';
	import { BaseSelect } from '$components/base-select';
	import { Button } from '$components/ui/button';
	import { goto } from '$app/navigation';
	import { EditableNotes } from '$components/notes/index.js';

	let { data, form }: PageProps = $props();

	let application = $derived(data.application);

	type FormData = {
		startDate: DateValue;
		status: ApplicationDtoStatus;
	};

	const formData = $state<FormData>({
		startDate: fromDate(data.application.startDate, 'UTC'),
		status: data.application.status
	});

	let formStartDate = $derived(formData.startDate.toDate('UTC').toISOString());

	const statusData = [
		{
			label: 'Applied',
			value: 'applied'
		},
		{
			label: 'Interview',
			value: 'interview'
		},
		{
			label: 'Offer',
			value: 'offer'
		},
		{
			label: 'Rejected',
			value: 'rejected'
		},
		{
			label: 'No Response',
			value: 'no-response'
		}
	];
</script>

<PageTitle
	backAction={async () => {
		await goto(`/applications/${application.id}`);
	}}
	title="Edit Application"
	subtitle="Application for {application.company}: {application.position}"
/>
<div class="flex w-full flex-wrap gap-4">
	<form
		method="POST"
		action="?/updateApplication"
		class="dashboard-card flex min-w-xs flex-1 flex-col gap-1"
	>
		<input name="id" type="hidden" value={application.id} />

		<BaseInput
			required
			name="company"
			label="Company"
			description="Company for the application"
			value={application.company}
		/>

		<BaseInput
			required
			name="position"
			label="Position"
			description="Position applying"
			value={application.position}
		/>

		<BaseInput
			name="salary"
			label="Salary"
			description="Salary range"
			value={application.salary}
		/>

		<BaseInput
			required
			name="url"
			label="Job URL"
			description="External URL for application"
			value={application.url}
		/>

		<div>
			<input type="hidden" name="startDate" bind:value={formStartDate} />
			<span>Date applied</span>
			<DatePicker placeholder="Date Applied" bind:value={formData.startDate} />
			<p class="mt-1 text-sm text-muted-foreground">Date applied for the position</p>
		</div>

		<BaseSelect name="status" label="Status" bind:value={formData.status} data={statusData} />

		{#if form?.error}
			<div class="card-destructive my-5">
				<p>{form.error}</p>
			</div>
		{/if}

		<div class="my-5 flex items-center justify-end">
			<Button type="submit">Update</Button>
		</div>
	</form>
	<div class="dashboard-card min-w-sm flex-2">
		<EditableNotes formAction="?/updateApplicationNote" notes={application.notes} />
	</div>
</div>
<svelte:head>
	<title>Edit application | Delightable</title>
</svelte:head>
