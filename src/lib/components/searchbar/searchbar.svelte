<script lang="ts">
	import { Search, X } from '@lucide/svelte';
	import { BaseInput } from '$components/base-input';
	import { debouncedInput } from '$lib/forms';

	type Props = {
		value: string;
		debounceDelay?: number;
		onSearch: (search: string) => void;
		onClear?: (e: Event) => void;
	};

	let { debounceDelay = 500, onSearch, value = $bindable(), onClear }: Props = $props();

	const debouncedSearch = debouncedInput(onSearch, debounceDelay);
</script>

<div class="flex items-center gap-2">
	<div>
		{#if value !== ''}
			<button class="rounded-full bg-accent p-1" onclick={onClear}>
				<X size={14} />
			</button>
		{:else}
			<Search size={16} />
		{/if}
	</div>

	<BaseInput
		bind:value
		oninput={() => {
			debouncedSearch(value);
		}}
	/>
</div>
