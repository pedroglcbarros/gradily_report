<script>
	import FilterBar from '../topbar/FilterBar.svelte';
	let { controller, children } = $props();
</script>

<div class="flex flex-col h-screen bg-white overflow-hidden font-sans text-[#3F3F46]">
	
	<!-- Top Section: Header + Toolbar -->
	<div class="shrink-0 bg-white z-30 flex flex-col">
		
		<!-- Row 1: Branding & Description -->
		<div class="px-6 pt-6 pb-2">
			<div class="flex items-baseline gap-3 mb-1">
				<h1 class="text-5xl font-bold text-[#27272A] tracking-tight">Gradily Report</h1>
				<span class="italic text-2xl text-[#9F9FA9]">Data Explorer</span>
			</div>
			<p class="tex-base text-[#52525C] max-w-3xl pt-6 pb-3">
				The following report contains data from all the evaluations made by students for the initial period of Gradily’s operations. The data here presented accounts for all applicable essay evaluations from students of all valid cities and schools.
			</p>
		</div>

		<div class="px-6 pb-4 flex justify-end">
			<span class="text-base italic text-[#71717A]">
				Showing {controller.sortedRows.length} row{controller.sortedRows.length !== 1 ? 's' : ''}
			</span>
		</div>

		<!-- Row 2: Unified Control Toolbar -->
		<div class="px-6 pt-2">
			<FilterBar {controller} />
		</div>
	</div>

	<!-- Main Content: Data Table -->
	<div class="flex-1 overflow-hidden relative bg-white p-6 pt-4">
		{@render children()}
	</div>

</div>