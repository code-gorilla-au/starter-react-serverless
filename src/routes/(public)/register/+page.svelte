<script lang="ts">
	import { PageTitle } from '$lib/components/page-title';
	import { BaseInput } from '$lib/components/base-input';
	import { Button } from '$lib/components/ui/button';
	import { type PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<div class="page-container">
	<PageTitle class="mx-auto max-w-2xl" title="Register" subtitle="Create your account" />
	<form class="mx-auto flex max-w-sm flex-col gap-1" method="POST">
		<h3 class="heading-3 mb-5">Enter your personal details</h3>

		<BaseInput label="First name" type="text" name="firstName" />
		<BaseInput label="Last name" type="text" name="lastName" />
		<BaseInput label="Email" type="email" name="email" />
		<BaseInput label="Password" type="password" name="password" />
		{#if form?.error}
			<div class="card-destructive">
				<p>{form?.error}</p>
			</div>
		{/if}
		<div class="my-10 flex justify-end">
			<Button type="submit">Register user</Button>
		</div>
	</form>
</div>

<svelte:head>
	<title>Register Account | Delightable</title>
</svelte:head>
