<script lang="ts">
	import ApplicationNotes from './application-notes.svelte';
	import ApplicationDetails from '$components/applications/application-details.svelte';
	import ApplicationTaskSheet from './application-task-sheet.svelte';
	import TaskTable from './tasks-table.svelte';
	import { PageTitle } from '$components/page-title';
	import { goto } from '$app/navigation';
	import { type PageProps } from './$types';
	import type { TaskDto } from '$lib/applications/types';
	import { getApplication } from '$lib/applications/queries.remote';

	let { params }: PageProps = $props();
	let application = $derived(await getApplication(params.id));
	let tasks = $derived(application?.tasks ?? []);

	let openTaskSheet = $state(false);
	let selectedApplicationTask = $state<TaskDto | undefined>(undefined);

	function setSelectedTask(task: TaskDto) {
		selectedApplicationTask = task;
		openTaskSheet = true;
	}
</script>

<PageTitle
	backAction={async () => {
		await goto('/applications');
	}}
	title="Application"
	subtitle="Application for: {application.company}"
/>

<div class="flex w-full flex-wrap gap-3">
	<div class="flex flex-1 flex-col gap-3">
		<ApplicationDetails {application} />
		<ApplicationNotes {application} />
	</div>
	<TaskTable applicationId={application.id} {tasks} onSelectTask={setSelectedTask} />
</div>

<ApplicationTaskSheet
	bind:open={openTaskSheet}
	applicationId={application.id}
	task={selectedApplicationTask}
/>

<svelte:head>
	<title>Application | Delightable</title>
</svelte:head>

<style lang="postcss">
	@reference "$design";
</style>
