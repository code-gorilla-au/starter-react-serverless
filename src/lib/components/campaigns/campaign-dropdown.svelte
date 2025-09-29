<script lang="ts">
	import * as DropdownMenu from '$components/ui/dropdown-menu';
	import { EllipsisVertical } from '@lucide/svelte';
	import { Button } from '$components/ui/button';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button size="sm" variant="ghost" {...props}>
				<EllipsisVertical />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56" align="start">
		<DropdownMenu.Label>Campaign Menu</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item>
				<a class="w-full" href="/applications"> Applications </a>
			</DropdownMenu.Item>
			<DropdownMenu.Item>Archive</DropdownMenu.Item>
			<DropdownMenu.Item>Delete</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
