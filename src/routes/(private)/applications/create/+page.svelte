<script lang="ts">
	import { PageTitle } from '$components/page-title/index.js';
	import { goto } from '$app/navigation';
	import { BaseInput } from '$components/base-input/index.js';
	import { Button } from '$components/ui/button';
	import { Label } from '$components/ui/label';
	import { DatePicker } from '$components/date-picker';
	import { type PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let campaignId = $derived(data?.defaultCampaign?.id ?? '');
	let startDate = $state<string | undefined>(undefined);

	async function routeBack() {
		await goto('/applications');
	}
</script>

<PageTitle backAction={routeBack} title="Create application" subtitle="Create a new application" />

<form method="POST" class="base-form">
	<input type="hidden" name="campaignId" value={campaignId} />
	<BaseInput name="company" label="Company" description="Name of the company and or recruiter" />
	<BaseInput name="position" label="Position" description="Position advertised" />
	<BaseInput name="salary" label="Salary" description="Salary range" />
	<BaseInput name="url" label="Url" description="Link for the job application" />
	<div>
		<input type="hidden" name="startDate" bind:value={startDate} />
		<Label class="mb-1" for="startDate">Date applied</Label>
		<DatePicker
			onValueChange={(value) => {
				if (!value) {
					return;
				}

				startDate = value.toString();
			}}
		/>
		<p class="mt-1 text-sm text-muted-foreground">Date of when you've applied</p>
	</div>
	{#if form?.error}
		<div class="card-destructive">
			<p>{form?.error}</p>
		</div>
	{/if}

	<div class="mt-10 flex justify-end">
		<Button type="submit">Create application</Button>
	</div>
</form>

<svelte:head>
	<title>Create application | Delightable</title>
</svelte:head>
