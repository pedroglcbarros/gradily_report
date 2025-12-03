<script>
	let { controller } = $props();

	// Column mapping to match the Header/Body structure exactly
	const COLS = [
		'city_name', 
		'school_name', 
		'class_name', 
		'student_name', 
		'exam_type', 
		'essay_date', 
		'final', 
		'c1', 'c2', 'c3', 'c4', 'c5'
	];
</script>

<tfoot class="sticky bottom-0 z-20 bg-[#E4E4E7] text-xs shadow-[0_-2px_10px_rgba(0,0,0,0.05)] border-t border-[#D4D4D8]">
	<tr>
		{#each COLS as col}
			<td class="px-4 py-3 text-left whitespace-nowrap">
				{#if controller.aggregates[col]}
					<div class="flex flex-col">
						<span class="text-[10px] uppercase text-[#71717A] font-bold tracking-wider">
							{controller.aggregates[col].label}
						</span>
						<span class="font-mono font-bold text-[#27272A] mt-0.5">
							{controller.aggregates[col].value}
						</span>
					</div>
				{:else}
					<span class="text-gray-400">-</span>
				{/if}
			</td>
		{/each}
	</tr>
</tfoot>