<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
    <!-- PAGE CONTENT -->
    <main class="flex-1">
        {@render children()}
    </main>
</div>
