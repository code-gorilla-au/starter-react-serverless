<script lang="ts">
	import * as Card from '$lib/components/ui/card';
</script>

<Card.Root class="mx-auto mt-20 w-full max-w-sm sm:mt-40">
	<Card.Header>
		<Card.Title class="text-2xl">Logout</Card.Title>
		<Card.Description>Successfully logged out</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="mt-4 text-center">
			<a href="/login" class="underline"> Sign in </a>
		</div>
	</Card.Content>
</Card.Root>

<svelte:head>
	<title>Logout | Delightable</title>
</svelte:head>
