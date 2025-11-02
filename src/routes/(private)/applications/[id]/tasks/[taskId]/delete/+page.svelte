<script lang="ts">
	import { PageTitle } from '$components/page-title/index.js';
	import { type PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { Button } from '$components/ui/button';
	import { deleteTask, getTask } from '$lib/applications/queries.remote';

	let { params }: PageProps = $props();
	let applicationId = $derived(params.id);
	let taskId = $derived(params.taskId);
	let task = $derived(await getTask({ applicationId, taskId }));
	let routeBackUrl = $derived(`/applications/${applicationId}/tasks/${taskId}`);
</script>

<PageTitle
	backAction={async () => {
		await goto(routeBackUrl);
	}}
	title="Delete {task.name}"
/>

<div class="mx-auto mt-30 max-w-md text-center">
	<h2 class="heading-2">Danger zone</h2>
	<h3 class="text-xl">This is a permanent action, it cannot be undone</h3>
	<p class="my-5">A you sure you wish to proceed?</p>

	<div class="flex justify-center gap-10">
		<Button
			onclick={async (e: Event) => {
				e.preventDefault();

				await goto(routeBackUrl);
			}}
			variant="outline">Cancel</Button
		>
		<Button
			type="button"
			onclick={async (e: Event) => {
				e.preventDefault();
				await deleteTask({ applicationId, taskId });
				await goto(`/applications/${applicationId}`);
			}}
			variant="default"
		>
			Confirm
		</Button>
	</div>
</div>

<svelte:head>
	<title>Delete Task | Delightable</title>
</svelte:head>
