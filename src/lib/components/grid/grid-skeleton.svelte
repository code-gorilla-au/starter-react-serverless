<script lang="ts">
	import Grid from '$lib/components/grid/grid.svelte';
	import { Skeleton } from '$components/ui/skeleton';
	import { cn } from '$lib/utils';

	interface GridSkeletonProps {
		count?: number;
		itemClass?: string;
	}

	let { count = 8, itemClass = '' }: GridSkeletonProps = $props();

	let items = $derived(Array.from({ length: Math.max(0, Math.floor(count)) }, (_, i) => i));
</script>

<Grid>
	{#each items as i (i)}
		<Skeleton class={cn(itemClass)} />
	{/each}
</Grid>
