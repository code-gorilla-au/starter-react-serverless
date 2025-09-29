<script lang="ts">
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	const df = new DateFormatter('en-AU', {
		dateStyle: 'long'
	});

	const dfShort = new DateFormatter('en-AU', {
		dateStyle: 'short'
	});

	type Props = {
		ref?: HTMLElement | null;
		formatShort?: boolean;
		placeholder?: string;
		value?: DateValue;
		class?: string;
		onValueChange?: (value: DateValue | undefined) => void;
	};

	let {
		ref = $bindable(null),
		value = $bindable(),
		onValueChange,
		class: className,
		formatShort,
		placeholder
	}: Props = $props();

	let renderPlaceholder = $derived(placeholder ? placeholder : 'Pick a date');

	let renderDate = $derived.by(() => {
		if (!value) {
			return renderPlaceholder;
		}

		if (formatShort) {
			return dfShort.format(value.toDate(getLocalTimeZone()));
		}

		return df.format(value.toDate(getLocalTimeZone()));
	});
</script>

<Popover.Root>
	<Popover.Trigger
		class={cn(
			buttonVariants({
				variant: 'outline',
				class: cn('w-full justify-start text-left font-normal', className)
			}),
			!value && 'text-muted-foreground'
		)}
	>
		<CalendarIcon />
		{renderDate}
	</Popover.Trigger>
	<Popover.Content bind:ref class="w-auto p-0">
		<Calendar type="single" bind:value {onValueChange} />
	</Popover.Content>
</Popover.Root>
