<script lang="ts">
	import * as DropdownMenu from '$components/ui/dropdown-menu';
	import { Button } from '$components/ui/button';
	import { EllipsisVertical } from '@lucide/svelte';
	import type { ApplicationDto } from '$lib/applications/types';

	type Props = {
		application: ApplicationDto;
	};
	let { application }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button size="sm" {...props} variant="ghost"><EllipsisVertical /></Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56" align="start">
		<DropdownMenu.Label>Application Menu</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item>
				<a class="w-full" href={`/applications/${application.id}`}> View </a>
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<a class="w-full" href={`/applications/${application.id}/edit`}> Edit </a>
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<a class="w-full" href={`/applications/${application.id}/delete`}>Delete</a>
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<a class="w-full" target="_blank" href={application.url}> External link </a>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
