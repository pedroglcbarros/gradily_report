<script>
	import Dropdown from '$lib/components/ui/Dropdown.svelte';
	import ResetMenu from './ResetMenu.svelte';
	import SortMenu from './SortMenu.svelte';
	
	let { controller } = $props();

	const EXAM_OPTIONS = [
		{ id: 'All', label: 'All Exams' },
		{ id: 'enem', label: 'ENEM' },
		{ id: 'saeb', label: 'SAEB (All)' },
		{ id: 'saeb_6', label: 'SAEB (6º Ano)' },
		{ id: 'saeb_7', label: 'SAEB (7º Ano)' },
		{ id: 'saeb_8', label: 'SAEB (8º Ano)' },
		{ id: 'saeb_9', label: 'SAEB (9º Ano)' }
	];
</script>

<!-- Toolbar Container -->
<div class="flex flex-wrap items-center gap-2 w-full">
	
	<!-- 1. Search Input -->
	<div class="relative group">
		<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
			<svg class="h-4 w-4 text-[#9F9FA9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</div>
		<input
			type="text"
			placeholder="Search..."
			bind:value={controller.searchQuery}
			class="pl-9 pr-3 py-1.5 text-sm rounded-[6px] bg-[#FAFAFA] border border-[#D4D4D8] text-[#3F3F46] placeholder-[#9F9FA9] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none w-56 transition-all shadow-sm"
		/>
	</div>

	<!-- Vertical Divider -->
	<div class="h-6 w-px bg-[#D4D4D8] mx-1"></div>

	<!-- 2. Filters -->
	
	<Dropdown label={controller.filters.city === 'All' ? 'City' : controller.filters.city} active={controller.filters.city !== 'All'}>
		<div class="max-h-60 overflow-y-auto">
			<button class="block w-full text-left px-4 py-2 text-sm text-gray-500 font-bold bg-gray-50" onclick={() => controller.filters.city = 'All'}>All Cities</button>
			{#each controller.uniqueCities as opt}
				{#if opt !== 'All'}
				<button 
					class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 {controller.filters.city === opt ? 'font-bold text-blue-600 bg-blue-50' : 'text-[#3F3F46]'}"
					onclick={() => controller.filters.city = opt}
				>
					{opt}
				</button>
				{/if}
			{/each}
		</div>
	</Dropdown>

	<Dropdown label={controller.filters.school === 'All' ? 'School' : 'Selected School'} active={controller.filters.school !== 'All'} width="w-80">
		<div class="max-h-60 overflow-y-auto">
			<button class="block w-full text-left px-4 py-2 text-sm text-gray-500 font-bold bg-gray-50" onclick={() => controller.filters.school = 'All'}>All Schools</button>
			{#each controller.uniqueSchools as opt}
				{#if opt !== 'All'}
				<button 
					class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 truncate {controller.filters.school === opt ? 'font-bold text-blue-600 bg-blue-50' : 'text-[#3F3F46]'}"
					onclick={() => controller.filters.school = opt}
					title={opt}
				>
					{opt}
				</button>
				{/if}
			{/each}
		</div>
	</Dropdown>

	<Dropdown label={controller.filters.class === 'All' ? 'Class' : controller.filters.class} active={controller.filters.class !== 'All'}>
		<div class="max-h-60 overflow-y-auto">
			<button class="block w-full text-left px-4 py-2 text-sm text-gray-500 font-bold bg-gray-50" onclick={() => controller.filters.class = 'All'}>All Classes</button>
			{#each controller.uniqueClasses as opt}
				{#if opt !== 'All'}
				<button 
					class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 {controller.filters.class === opt ? 'font-bold text-blue-600 bg-blue-50' : 'text-[#3F3F46]'}"
					onclick={() => controller.filters.class = opt}
				>
					{opt}
				</button>
				{/if}
			{/each}
		</div>
	</Dropdown>

	<!-- Updated Exam Dropdown -->
	<Dropdown label={controller.filters.exam === 'All' ? 'Exam' : 'Selected Exam'} active={controller.filters.exam !== 'All'} width="w-48">
		<div class="max-h-60 overflow-y-auto">
			{#each EXAM_OPTIONS as type}
				<button 
					class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 {controller.filters.exam === type.id ? 'font-bold text-blue-600 bg-blue-50' : 'text-[#3F3F46]'}"
					onclick={() => controller.filters.exam = type.id}
				>
					{type.label}
				</button>
			{/each}
		</div>
	</Dropdown>

	<!-- Period Dropdown -->
	<Dropdown label="Period" active={controller.filters.startMonth !== 'All' || controller.filters.endMonth !== 'All'} width="w-72">
		<div class="p-3 space-y-3 w-full">
			<!-- Start Month -->
			<div>
				<label class="text-xs font-bold text-[#9F9FA9] block mb-1.5 uppercase tracking-wide">Start Month</label>
				<div class="relative">
					<select 
						bind:value={controller.filters.startMonth} 
						class="appearance-none bg-none w-full text-sm border border-[#D4D4D8] rounded-[6px] bg-[#FAFAFA] text-[#3F3F46] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8 outline-none cursor-pointer"
					>
						<option value="All">Beginning</option>
						{#each controller.availableMonths as m}<option value={m}>{m}</option>{/each}
					</select>
					<!-- Custom Chevron -->
					<div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#3F3F46]">
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</div>
				</div>
			</div>

			<!-- End Month -->
			<div>
				<label class="text-xs font-bold text-[#9F9FA9] block mb-1.5 uppercase tracking-wide">End Month</label>
				<div class="relative">
					<select 
						bind:value={controller.filters.endMonth} 
						class="appearance-none bg-none w-full text-sm border border-[#D4D4D8] rounded-[6px] bg-[#FAFAFA] text-[#3F3F46] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8 outline-none cursor-pointer"
					>
						<option value="All">Present</option>
						{#each controller.availableMonths as m}<option value={m}>{m}</option>{/each}
					</select>
					<!-- Custom Chevron -->
					<div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#3F3F46]">
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</div>
				</div>
			</div>
		</div>
	</Dropdown>

	<!-- 3. Right Aligned Controls -->
	<div class="ml-auto flex items-center gap-2">
		
		<SortMenu {controller} />

		<Dropdown label="Group" active={controller.groupBy !== 'None'}>
			<div class="py-1">
				{#each ['None', 'city_name', 'school_name', 'class_name'] as opt}
					<button 
						class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 {controller.groupBy === opt ? 'font-bold text-blue-600 bg-blue-50' : 'text-[#3F3F46]'}"
						onclick={() => controller.groupBy = opt}
					>
						{opt === 'None' ? 'No Grouping' : `Group by ${opt.replace('_name', '')}`}
					</button>
				{/each}
			</div>
		</Dropdown>

		<ResetMenu {controller} />

		<div class="h-6 w-px bg-[#D4D4D8] mx-1"></div>

		<button 
			onclick={() => controller.exportCSV()}
			disabled={controller.sortedRows.length === 0}
			class="flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-[#74D4FF] bg-[#F0F9FF] text-[#0084D1] text-sm font-bold transition-all hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
			Export
		</button>
	</div>
</div>