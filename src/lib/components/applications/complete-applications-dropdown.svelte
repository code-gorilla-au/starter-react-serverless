<script lang="ts">
	import * as DropdownMenu from '$components/ui/dropdown-menu';
	import { Button } from '$components/ui/button';
	import { EllipsisVertical } from '@lucide/svelte';

	type Props = {
		deleteOlderThanDays: (e: Event, numberDays?: number) => void;
	};
	let { deleteOlderThanDays }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button size="sm" {...props} variant="ghost"><EllipsisVertical /></Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56" align="start">
		<DropdownMenu.Label>Delete Applications</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item
				onclick={(e) => {
					deleteOlderThanDays(e, 14);
				}}
			>
				Last 14 days
			</DropdownMenu.Item>
			<DropdownMenu.Item
				onclick={(e) => {
					deleteOlderThanDays(e, 30);
				}}
			>
				Last 30 days
			</DropdownMenu.Item>
			<DropdownMenu.Item
				onclick={(e) => {
					deleteOlderThanDays(e);
				}}
			>
				All
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
