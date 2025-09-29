<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';

	type Props = {
		label?: string;
		required?: boolean;
		disabled?: boolean;
		name: string;
		value?: string;
		data: {
			label: string;
			value: string;
			disabled?: boolean;
		}[];
	};

	let { name, required, disabled, value = $bindable(), label, data }: Props = $props();

	const triggerContent = $derived(data.find((f) => f.value === value)?.label ?? 'Select a fruit');
</script>

<div>
	<span class="text-sm">{label}</span>
	<Select.Root {required} {disabled} type="single" {name} bind:value>
		<Select.Trigger class="w-full">
			{triggerContent}
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				{#each data as data (data.value)}
					<Select.Item value={data.value} label={data.label} disabled={data.disabled}>
						{data.label}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</div>
