<script lang="ts">
	import AppSidebar from '$lib/components/sidebar/app-sidebar.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { type LayoutProps } from './$types';
	import { page } from '$app/state';

	let { data, children }: LayoutProps = $props();

	let campaigns = $derived(data.campaigns);
	let campaignName = $derived(data?.defaultCampaign?.name ?? 'Campaign');
	let pageParts = $derived(
		page.url.pathname
			.split('/')
			.map((part) => {
				for (const param of Object.values(page.params)) {
					if (part === param) {
						return '...';
					}
				}

				return part;
			})
			.filter((part) => part !== '')
	);
	let session = $derived(data.session);
</script>

<Sidebar.Provider>
	<AppSidebar {campaigns} {session} />
	<Sidebar.Inset>
		<header
			class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
		>
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
						<Breadcrumb.Item class="hidden md:block">
							<Breadcrumb.Link href="/campaigns">
								{campaignName}
							</Breadcrumb.Link>
						</Breadcrumb.Item>
						{#each pageParts as part (part)}
							<Breadcrumb.Separator class="hidden md:block" />
							<Breadcrumb.Item class="hidden md:block">
								<Breadcrumb.Link>
									{part}
								</Breadcrumb.Link>
							</Breadcrumb.Item>
						{/each}
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
		</header>
		<div class="px-4 py-2">
			{@render children?.()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
