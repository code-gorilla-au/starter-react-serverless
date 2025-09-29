<script lang="ts">
	import { formatDate } from '$lib/hooks/formats';
	import { ScrollArea } from '$components/ui/scroll-area';
	import type { NoteDto } from '$lib/applications/types';
	import { cn } from '$lib/utils';
	import Pencil from '@lucide/svelte/icons/pencil';
	import X from '@lucide/svelte/icons/x';
	import { BaseInput } from '$components/base-input/index.js';
	import { Button } from '$components/ui/button';

	type Props = {
		class?: string;
		scrollClass?: string;
		formAction: string;
		notes: NoteDto[];
	};

	let { notes, class: className, scrollClass, formAction }: Props = $props();

	let editNote = $state<string | undefined>(undefined);
</script>

<div class={cn(className)}>
	<div>
		<h2 class="heading-3">Notes</h2>
	</div>
	<ScrollArea class={cn('overflow-hidden', scrollClass)}>
		<div class="">
			{#each notes as note (note.id)}
				{#if editNote !== note.id}
					<div class="my-1 flex w-full flex-col gap-0.5 rounded-xl p-2 hover:bg-accent">
						<div class="flex gap-3">
							<button
								onclick={(e: Event) => {
									e.preventDefault();
									editNote = note.id;
								}}
							>
								<Pencil size={14} />
							</button>
							<p class="text-sm">{note.content}</p>
						</div>

						<div class="flex justify-end">
							<p class="text-xs font-semibold text-muted-foreground">
								{formatDate(note.createdAt)}
							</p>
						</div>
					</div>
				{:else}
					<form
						method="POST"
						action={formAction}
						class="my-1 flex w-full items-center gap-2 p-2"
					>
						<button
							type="button"
							onkeydown={(e: Event) => {
								console.log('keydown', e);
								e.preventDefault();
							}}
							onclick={(e: Event) => {
								console.log('click', e);
								e.preventDefault();
								editNote = undefined;
							}}
							class="rounded-full bg-accent p-1"><X size={14} /></button
						>
						<input type="hidden" name="noteId" value={note.id} />
						<BaseInput name="content" placeholder="Content" value={note.content} />
						<Button size="sm" type="submit">Update</Button>
					</form>
				{/if}
			{/each}
		</div>
	</ScrollArea>
</div>
