<script lang="ts">
	import { PageTitle } from '$components/page-title/index.js';
	import { type PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { Button } from '$components/ui/button';

	let { data }: PageProps = $props();
	let application = $derived(data.application);
	let routeBackUrl = $derived(`/applications/${application.id}`);
</script>

<PageTitle
	backAction={async () => {
		await goto(routeBackUrl);
	}}
	title="Delete {application.company}: {application.position}"
/>

<div class="mx-auto mt-30 max-w-md text-center">
	<h2 class="heading-2">Danger zone</h2>
	<h3 class="text-xl">This is a permanent action, it cannot be undone</h3>
	<p class="my-5">A you sure you wish to proceed?</p>

	<form class="flex justify-center gap-10" method="POST" action="?/deleteApplication">
		<input type="hidden" name="applicationId" value={application.id} />
		<Button
			onclick={async (e: Event) => {
				e.preventDefault();

				await goto(routeBackUrl);
			}}
			variant="outline">Cancel</Button
		>
		<Button type="submit" variant="default">Confirm</Button>
	</form>
</div>

<svelte:head>
	<title>Delete | Delightable</title>
</svelte:head>
