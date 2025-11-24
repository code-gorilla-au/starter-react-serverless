<script lang="ts">
	import { BaseInput } from '$components/base-input/index.js';
	import { Button } from '$components/ui/button/index.js';
	import { Separator } from '$components/ui/separator/index.js';
	import type { ApplicationDto } from '$lib/applications/types';
	import { Notes } from '$components/notes';
	import { addApplicationNote } from '$lib/applications/queries.remote';

	type Props = {
		application: ApplicationDto;
	};

	let { application }: Props = $props();
</script>

<div class="rounded-lg bg-secondary/30 p-4">
	<Notes notes={application.notes} />
	<Separator class="my-2" />
	<form
		{...addApplicationNote.enhance(async ({ submit, form }) => {
			await submit();
			form.reset();
		})}
		class="flex items-center justify-between gap-2"
	>
		<BaseInput required name="note" placeholder="Add note" />
		<input type="hidden" name="applicationId" value={application.id} />

		<Button size="sm" class="text-xs">+ Add</Button>
	</form>
</div>
