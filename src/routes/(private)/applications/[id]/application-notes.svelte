<script lang="ts">
	import { enhance } from '$app/forms';
	import { BaseInput } from '$components/base-input/index.js';
	import { Button } from '$components/ui/button/index.js';
	import { Separator } from '$components/ui/separator/index.js';
	import type { ApplicationDto } from '$lib/applications/types';
	import { Notes } from '$components/notes';

	type Props = {
		application: ApplicationDto;
		campaignId: string;
	};

	let { application, campaignId }: Props = $props();
</script>

<div class="rounded-lg bg-secondary/30 p-4">
	<Notes notes={application.notes} />
	<Separator class="my-2" />
	<form
		method="POST"
		action="?/addApplicationNote"
		class="flex items-center justify-between gap-2"
		use:enhance
	>
		<BaseInput required name="note" placeholder="Add note" />
		<input type="hidden" name="applicationId" value={application.id} />
		<input type="hidden" name="campaignId" value={campaignId} />

		<Button size="sm" class="text-xs" type="submit">+ Add</Button>
	</form>
</div>
