<script lang="ts">
	import NavMain from './nav-main.svelte';
	import NavUser from './nav-user.svelte';
	import CampaignSwitcher from './team-switcher.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import type { ComponentProps } from 'svelte';

	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import SquareKanban from '@lucide/svelte/icons/square-kanban';
	import File from '@lucide/svelte/icons/file';
	import type { CampaignDto } from '$lib/campaigns/types';
	import { page } from '$app/state';
	import type { UserSession } from '$lib/server/auth';

	type Props = ComponentProps<typeof Sidebar.Root> & {
		defaultCampaign?: CampaignDto;
		campaigns: CampaignDto[];
		session: UserSession;
	};

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		campaigns,
		session,
		defaultCampaign,
		...restProps
	}: Props = $props();

	let currentUrl = $derived(page.url.pathname);

	const data = $derived({
		navMain: [
			{
				title: 'Campaigns',
				url: '/campaigns',
				icon: SquareKanban,
				isActive: currentUrl.includes('/campaigns')
			},
			{
				title: 'Applications',
				url: '/applications',
				icon: File,
				isActive: currentUrl.includes('/applications')
			},
			{
				title: 'Documentation',
				url: '/documentation',
				icon: BookOpenIcon,
				isActive: currentUrl.includes('/documentation')
			}
		]
	});
</script>

<Sidebar.Root {collapsible} {...restProps}>
	<Sidebar.Header>
		<CampaignSwitcher {defaultCampaign} {campaigns} />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={session} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
