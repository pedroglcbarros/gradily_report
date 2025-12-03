<script>
	let { 
		filters = $bindable(), 
		uniqueCities = [], 
		uniqueSchools = [], 
		uniqueClasses = [], 
		availableMonths = [] 
	} = $props();

	const EXAM_TABS = [
		{ id: 'All', label: 'All Exams' },
		{ id: 'enem', label: 'ENEM' },
		{ id: 'saeb', label: 'SAEB (All)' },
		{ id: 'saeb6', label: '6º Ano' },
		{ id: 'saeb7', label: '7º Ano' },
		{ id: 'saeb8', label: '8º Ano' },
		{ id: 'saeb9', label: '9º Ano' }
	];

	function formatMonthLabel(yyyyMm) {
		if (yyyyMm === 'All') return 'All Time';
		const [y, m] = yyyyMm.split('-');
		const date = new Date(parseInt(y), parseInt(m) - 1, 1);
		return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
	}
</script>

<div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
	
	<!-- Exam Tabs -->
	<div class="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
		{#each EXAM_TABS as tab}
			<button
				class="px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer
				{filters.exam === tab.id 
					? 'bg-blue-600 text-white shadow-md' 
					: 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'}"
				onclick={() => filters.exam = tab.id}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<!-- Filter Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
		
		<div class="flex flex-col gap-1">
			<label class="text-xs font-bold text-gray-500" for="city">City</label>
			<select bind:value={filters.city} id="city" class="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm focus:ring-2 ring-blue-500 outline-none w-full">
				{#each uniqueCities as opt} <option value={opt}>{opt}</option> {/each}
			</select>
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-bold text-gray-500" for="school">School</label>
			<select bind:value={filters.school} id="school" class="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm focus:ring-2 ring-blue-500 outline-none w-full">
				{#each uniqueSchools as opt} <option value={opt}>{opt}</option> {/each}
			</select>
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-bold text-gray-500" for="class">Class</label>
			<select bind:value={filters.class} id="class" class="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm focus:ring-2 ring-blue-500 outline-none w-full">
				{#each uniqueClasses as opt} <option value={opt}>{opt}</option> {/each}
			</select>
		</div>

		<!-- Month Filters -->
		<div class="flex flex-col gap-1">
			<label class="text-xs font-bold text-gray-500" for="start">Start Month</label>
			<select bind:value={filters.startMonth} class="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm focus:ring-2 ring-blue-500 outline-none w-full">
				<option value="All">All Time</option>
				{#each availableMonths as m} 
					<option value={m}>{formatMonthLabel(m)}</option> 
				{/each}
			</select>
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-bold text-gray-500" for="end">End Month</label>
			<select bind:value={filters.endMonth} class="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm focus:ring-2 ring-blue-500 outline-none w-full">
				<option value="All">All Time</option>
				{#each availableMonths as m} 
					<option value={m}>{formatMonthLabel(m)}</option> 
				{/each}
			</select>
		</div>

	</div>
</div>