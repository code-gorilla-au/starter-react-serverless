<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/campaigns');
	});
</script>

<svelte:head>
	<title>Delightable</title>
</svelte:head>
