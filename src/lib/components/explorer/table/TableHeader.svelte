<script>
	let { controller } = $props();

	const COLUMNS = [
		{ k: 'city_name', l: 'City', w: 'w-32' },
		{ k: 'school_name', l: 'School', w: 'w-48' },
		{ k: 'class_name', l: 'Class', w: 'w-32' },
		{ k: 'student_name', l: 'Student', w: 'w-48' },
		{ k: 'exam_type', l: 'Exam', w: 'w-24' },
		{ k: 'essay_date', l: 'Date', w: 'w-28' },
		{ k: 'final', l: 'Final', w: 'w-20' },
		{ k: 'c1', l: 'C1', w: 'w-16' },
		{ k: 'c2', l: 'C2', w: 'w-16' },
		{ k: 'c3', l: 'C3', w: 'w-16' },
		{ k: 'c4', l: 'C4', w: 'w-16' },
		{ k: 'c5', l: 'C5', w: 'w-16' }
	];

	function getSortIcon(key) {
		const sort = controller.sortState.find(s => s.key === key);
		if (!sort) return '↕'; 
		return sort.dir === 'asc' ? '↑' : '↓';
	}
	
	function isActive(key) {
		return controller.sortState.some(s => s.key === key);
	}
</script>

<thead class="bg-[#E4E4E7] text-[#3F3F46] uppercase text-xs font-bold tracking-wider border-b border-[#D4D4D8] sticky top-0 z-20">
	<tr>
		{#each COLUMNS as col}
			<th 
				class="px-4 py-3 cursor-pointer hover:brightness-95 transition-all select-none whitespace-nowrap group text-left {col.w}"
				onclick={(e) => controller.toggleSort(col.k, e.shiftKey)}
			>
				<div class="flex items-center gap-1">
					{col.l}
					<span class="{isActive(col.k) ? 'text-blue-600 font-extrabold' : 'text-gray-400 opacity-0 group-hover:opacity-100'}">
						{getSortIcon(col.k)}
					</span>
				</div>
			</th>
		{/each}
	</tr>
</thead>