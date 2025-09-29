<script lang="ts">
	import { fly, slide } from 'svelte/transition';
	import { formatDate } from '$lib/hooks/formats';
	import { Separator } from '$components/ui/separator';
	import { ScrollArea } from '$components/ui/scroll-area';
	import type { NoteDto } from '$lib/applications/types';
	import { cn } from '$lib/utils';

	type Props = {
		class?: string;
		scrollClass?: string;
		notes: NoteDto[];
	};
	let { notes, class: className, scrollClass }: Props = $props();
</script>

<div class={cn(className)}>
	<div>
		<h2 class="heading-3">Notes</h2>
	</div>
	<Separator class="my-1" />
	<ScrollArea class={cn(' h-[200px] overflow-hidden', scrollClass)}>
		<div class="">
			{#each notes as note (note.id)}
				<div
					in:fly={{ y: 20 }}
					out:slide
					class="flex w-full flex-col gap-0.5 border-b border-accent"
				>
					<p class="text-sm">{note.content}</p>
					<div class="flex justify-end">
						<p class="text-xs font-semibold text-muted-foreground">
							{formatDate(note.createdAt)}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</ScrollArea>
</div>
