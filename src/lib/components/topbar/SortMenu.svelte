<script>
	import Dropdown from '$lib/components/ui/Dropdown.svelte';

	let { controller } = $props();

	const COLUMNS = [
		{ k: 'city_name', l: 'City' },
		{ k: 'school_name', l: 'School' },
		{ k: 'class_name', l: 'Class' },
		{ k: 'student_name', l: 'Student' },
		{ k: 'exam_type', l: 'Exam Type' },
		{ k: 'essay_date', l: 'Date' },
		{ k: 'final', l: 'Final Score' },
		{ k: 'c1', l: 'Comp 1' },
		{ k: 'c2', l: 'Comp 2' },
		{ k: 'c3', l: 'Comp 3' },
		{ k: 'c4', l: 'Comp 4' },
		{ k: 'c5', l: 'Comp 5' }
	];

	function getLabel(key) { return COLUMNS.find(c => c.k === key)?.l || key; }
	function handleAdd(key) { controller.toggleSort(key, true); }
	function handleRemove(key) {
		const idx = controller.sortState.findIndex(s => s.key === key);
		if (idx > -1) controller.sortState.splice(idx, 1);
	}
</script>

{#snippet sortIcon()}
	<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
	</svg>
{/snippet}

<Dropdown label="Sort" icon={sortIcon} active={controller.sortState.length > 0} width="w-72">
	<div class="flex flex-col">
		<!-- Active Sorts -->
		{#if controller.sortState.length > 0}
			<div class="px-2 py-2 space-y-2">
				<span class="text-xs font-bold text-[#9F9FA9] uppercase tracking-wider pl-1">Sort By</span>
				{#each controller.sortState as rule}
					<div class="flex items-center justify-between bg-[#FAFAFA] rounded-[6px] p-1.5 border border-[#D4D4D8]">
						<span class="text-sm font-medium text-[#3F3F46] ml-1">{getLabel(rule.key)}</span>
						
						<div class="flex items-center gap-1">
							<button 
								class="text-xs font-bold text-[#3F3F46] hover:bg-gray-200 px-1.5 py-0.5 rounded uppercase w-12 text-center transition-colors"
								onclick={() => rule.dir = rule.dir === 'asc' ? 'desc' : 'asc'}
							>
								{rule.dir}
							</button>
							<button 
								class="text-[#9F9FA9] hover:text-[#EC003F] hover:bg-red-50 p-0.5 rounded transition-colors"
								onclick={() => handleRemove(rule.key)}
							>
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
							</button>
						</div>
					</div>
				{/each}
			</div>
			<div class="border-t border-[#D4D4D8] my-1"></div>
		{/if}

		<!-- Add Sort -->
		<div class="px-2 py-2">
			<span class="text-xs font-bold text-[#9F9FA9] uppercase tracking-wider pl-1">Add Sort Rule</span>
			<div class="mt-1 max-h-48 overflow-y-auto space-y-0.5">
				{#each COLUMNS as col}
					{#if !controller.sortState.find(s => s.key === col.k)}
						<button
							class="w-full text-left px-2 py-1.5 text-sm text-[#3F3F46] hover:bg-gray-100 rounded-[6px] flex items-center gap-2"
							onclick={() => handleAdd(col.k)}
						>
							<span class="w-1.5 h-1.5 rounded-full bg-[#D4D4D8]"></span>
							{col.l}
						</button>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</Dropdown>