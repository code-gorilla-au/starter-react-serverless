<script lang="ts">
	import { PageTitle } from '$components/page-title/index.js';
	import { goto } from '$app/navigation';
	import { BaseInput } from '$components/base-input/index.js';
	import { DatePicker } from '$components/date-picker/index.js';
	import { Label } from '$components/ui/label';
	import { Button } from '$components/ui/button/index.js';
	import { type PageProps } from './$types';

	let { form }: PageProps = $props();
	let startDate = $state<string | undefined>(undefined);
</script>

<PageTitle
	backAction={async () => {
		await goto('/campaigns');
	}}
	title="Create campaign"
	subtitle="Create a new campaign"
/>

<form method="POST" class="mx-auto flex max-w-sm flex-col gap-1">
	<BaseInput
		label="Name"
		name="name"
		placeholder="Campaign name"
		description="Name of the campaign to group applications"
	/>
	<BaseInput
		label="Description"
		name="description"
		placeholder="Brief description"
		description="Additional information about the campaign"
	/>
	<input type="hidden" name="startDate" bind:value={startDate} />

	<div>
		<Label class="mb-1" for="startDate">Start date</Label>
		<DatePicker
			onValueChange={(value) => {
				if (!value) {
					return;
				}

				startDate = value.toString();
			}}
		/>
		<p class="mt-1 text-sm text-muted-foreground">Date the campaign will start</p>
	</div>

	{#if form?.error}
		<div class="card-destructive">
			<p>{form.error}</p>
		</div>
	{/if}

	<div class="mt-10 flex justify-end">
		<Button type="submit">Create</Button>
	</div>
</form>

<svelte:head>
	<title>Create campaign | Delightable</title>
</svelte:head>
