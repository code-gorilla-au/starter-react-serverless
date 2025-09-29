<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card';
	import { BaseInput } from '$lib/components/base-input';
	import { type PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<Card.Root class="mx-auto mt-20 w-full max-w-sm sm:mt-40">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" class="grid gap-2">
			<BaseInput name="email" id="email" label="Email" required />
			<BaseInput
				autocomplete="off"
				type="password"
				name="password"
				id="password"
				label="Password"
				required
			></BaseInput>
			{#if form?.error}
				<div class="card-destructive">
					<p>Username or password is invalid</p>
				</div>
			{/if}

			<Button type="submit" class="my-2 w-full">Login</Button>
		</form>
		<div class="mt-4 text-center text-sm">
			Don't have an account?
			<a href="/register" class="underline"> Sign up </a>
		</div>
	</Card.Content>
</Card.Root>

<svelte:head>
	<title>Login | Delightable</title>
</svelte:head>
