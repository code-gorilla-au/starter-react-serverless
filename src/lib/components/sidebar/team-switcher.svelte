<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import type { CampaignDto } from '$lib/campaigns/types';
	import { onMount } from 'svelte';

	type Props = {
		defaultCampaign?: CampaignDto;
		campaigns: CampaignDto[];
	};

	let { campaigns, defaultCampaign }: Props = $props();
	const sidebar = useSidebar();

	let activeCampaign = $state<CampaignDto | undefined>(defaultCampaign);
	let hasCampaigns = $derived(campaigns.length > 0);
	onMount(() => {
		if (hasCampaigns) {
			activeCampaign = campaigns[0];
		}
	});
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		{#if !hasCampaigns}
			<span></span>
		{:else}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton
							{...props}
							size="lg"
							class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-medium">
									{activeCampaign?.name}
								</span>
								<span class="truncate text-xs">{activeCampaign?.description}</span>
							</div>
							<ChevronsUpDownIcon class="ml-auto" />
						</Sidebar.MenuButton>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
					align="start"
					side={sidebar.isMobile ? 'bottom' : 'right'}
					sideOffset={4}
				>
					<DropdownMenu.Label class="text-xs text-muted-foreground"
						>Campaigns</DropdownMenu.Label
					>
					{#each campaigns as campaign, index (campaign.id)}
						<DropdownMenu.Item
							onSelect={() => (activeCampaign = campaign)}
							class="gap-2 p-2"
						>
							{campaign.name}
							<DropdownMenu.Shortcut>⌘{index + 1}</DropdownMenu.Shortcut>
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
	</Sidebar.MenuItem>
</Sidebar.Menu>
