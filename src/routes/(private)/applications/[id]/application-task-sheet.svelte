<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import * as Sheet from '$components/ui/sheet';
	import { Button } from '$components/ui/button';
	import type { TaskDto } from '$lib/applications/types';
	import { Notes } from '$components/notes';
	import { prettyDate, truncate } from '$lib/hooks/formats';
	import { BaseInput } from '$components/base-input';
	import { Pencil } from '@lucide/svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { Separator } from '$components/ui/separator';
	import { toast } from 'svelte-sonner';

	type Props = {
		open: boolean;
		applicationId: string;
		task?: TaskDto;
	};

	let { task, applicationId, open = $bindable() }: Props = $props();

	const taskUrl = $derived(`/applications/${applicationId}/tasks/${task?.id}`);

	async function routeToTaskEditPage(e: Event) {
		e.preventDefault();

		await goto(taskUrl);
	}
</script>

{#if !task?.id}
	<Sheet.Root {open}>
		<Sheet.Content>
			<div>
				<p>No Task selected</p>
			</div>
		</Sheet.Content>
	</Sheet.Root>
{:else}
	<Sheet.Root bind:open>
		<Sheet.Content
			onInteractOutside={() => {
				open = false;
			}}
			side="right"
		>
			<Sheet.Header>
				<Sheet.Title class="flex items-center gap-2">
					<Button onclick={routeToTaskEditPage} variant="ghost" size="sm"
						><Pencil /></Button
					>
					<p class="capitalize">{truncate(task.name)}</p>
				</Sheet.Title>
				<div class="row">
					<p class="row-label">Description</p>
					<p class="row-value">{task.description}</p>
				</div>
				<div class="row">
					<p class="row-label">Staus</p>
					<p class="row-value capitalize">{task.status}</p>
				</div>
				<div class="row">
					<p class="row-label">Created</p>
					<p class="row-value">{prettyDate(task.createdAt)}</p>
				</div>
				{#if task.dueDate}
					<div class="row">
						<p class="row-label">Due Date</p>
						<p class="row-value">{prettyDate(task.dueDate)}</p>
					</div>
				{/if}
			</Sheet.Header>
			<Notes class="p-3" notes={task.notes} />
			<div class="p-3">
				<Separator />
				<form
					method="POST"
					action="?/addTaskNote"
					class="flex items-center justify-between gap-2"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								toast.success('Note added', { position: 'top-center' });
								await invalidateAll();
							}

							return await applyAction(result);
						};
					}}
				>
					<BaseInput required name="note" placeholder="Add note" />
					<input hidden name="taskId" value={task.id} />
					<input type="hidden" name="applicationId" value={applicationId} />

					<Sheet.Close>
						<Button size="sm" class="text-xs" type="submit">+ Add</Button>
					</Sheet.Close>
				</form>
			</div>
		</Sheet.Content>
	</Sheet.Root>
{/if}

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
