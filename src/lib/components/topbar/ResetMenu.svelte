<script>
	import Dropdown from '$lib/components/ui/Dropdown.svelte';
	let { controller } = $props();
</script>

{#snippet resetIcon()}
	<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
	</svg>
{/snippet}

<Dropdown label="Reset" icon={resetIcon} width="w-48" variant="reset">
	<div class="py-1">
		<button 
			class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-2 transition-colors"
			onclick={() => controller.resetAll()}
		>
			<span>Reset Everything</span>
		</button>
		<div class="border-t border-gray-100 my-1"></div>
		<button 
			class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
			onclick={() => controller.resetFilters()}
		>
			Reset Filters Only
		</button>
		<button 
			class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
			onclick={() => controller.resetSort()}
		>
			Reset Sorting Only
		</button>
		<button 
			class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
			onclick={() => controller.resetGroup()}
		>
			Reset Grouping Only
		</button>
	</div>
</Dropdown>