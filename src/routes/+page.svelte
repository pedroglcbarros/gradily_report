<script>
	import Papa from 'papaparse';
	import { onMount } from 'svelte';
	import FilterMenu from '$lib/components/FilterMenu.svelte';

	// --- CONFIGURATION ---
	const CSV_FILENAME = '/master_dataset_v3.csv';

	// --- 1. State (Runes) ---
	let rawData = $state([]);
	let loading = $state(true);
	let errorMsg = $state('');

	// View State
	let filters = $state({
		city: 'All',
		school: 'All',
		class: 'All',
		exam: 'All',
		startMonth: 'All',
		endMonth: 'All'
	});

	let groupByField = $state('None'); 
	let sortState = $state({ key: 'essay_date', dir: 'desc' });

	// --- 2. Auto-Load ---
	onMount(() => {
		Papa.parse(CSV_FILENAME, {
			download: true,
			header: true,
			skipEmptyLines: true,
			dynamicTyping: true, 
			complete: (results) => {
				rawData = results.data.map(row => {
					const cleanRow = {};
					Object.keys(row).forEach(key => cleanRow[key.trim()] = row[key]);
					return cleanRow;
				});
				loading = false;
			},
			error: (err) => {
				errorMsg = "Failed to load CSV.";
				loading = false;
			}
		});
	});

	// --- 3. Derived Filter Options (Cross-Filtering) ---
	let availableMonths = $derived.by(() => {
		const months = new Set();
		rawData.forEach(r => { if (r.essay_date) months.add(r.essay_date.substring(0, 7)); });
		return Array.from(months).sort();
	});

	function getOptions(field, ignoreKey) {
		const valid = rawData.filter(r => checkRow(r, ignoreKey));
		return ['All', ...new Set(valid.map(d => d[field]).filter(Boolean))].sort();
	}

	function checkRow(row, ignoreKey) {
		if (ignoreKey !== 'city' && filters.city !== 'All' && row.city_name !== filters.city) return false;
		if (ignoreKey !== 'school' && filters.school !== 'All' && row.school_name !== filters.school) return false;
		if (ignoreKey !== 'class' && filters.class !== 'All' && row.class_name !== filters.class) return false;
		if (ignoreKey !== 'exam' && filters.exam !== 'All') {
			if (filters.exam === 'saeb') { if (!row.exam_type?.toLowerCase().includes('saeb')) return false; }
			else { if (row.exam_type !== filters.exam) return false; }
		}
		const rowMonth = row.essay_date ? row.essay_date.substring(0, 7) : '';
		if (filters.startMonth !== 'All' && rowMonth < filters.startMonth) return false;
		if (filters.endMonth !== 'All' && rowMonth > filters.endMonth) return false;
		return true;
	}

	let uniqueCities = $derived(getOptions('city_name', 'city'));
	let uniqueSchools = $derived(getOptions('school_name', 'school'));
	let uniqueClasses = $derived(getOptions('class_name', 'class'));

	// Auto-Reset
	$effect(() => {
		if (filters.city !== 'All' && !uniqueCities.includes(filters.city)) filters.city = 'All';
		if (filters.school !== 'All' && !uniqueSchools.includes(filters.school)) filters.school = 'All';
		if (filters.class !== 'All' && !uniqueClasses.includes(filters.class)) filters.class = 'All';
	});

	// --- 4. Filtering & Sorting Logic ---
	let processedRows = $derived.by(() => {
		let data = rawData.filter(r => checkRow(r));
		data.sort((a, b) => {
			let valA = a[sortState.key] ?? '';
			let valB = b[sortState.key] ?? '';
			if (typeof valA === 'number' && typeof valB === 'number') {
				return sortState.dir === 'asc' ? valA - valB : valB - valA;
			} else {
				return sortState.dir === 'asc' 
					? String(valA).localeCompare(String(valB)) 
					: String(valB).localeCompare(String(valA));
			}
		});
		return data;
	});

	// --- 5. Grouping Logic ---
	let groupedRows = $derived.by(() => {
		if (groupByField === 'None') {
			return [{ title: 'All Records', rows: processedRows }];
		}
		const groups = {};
		processedRows.forEach(row => {
			const key = row[groupByField] || 'Unknown';
			if (!groups[key]) groups[key] = [];
			groups[key].push(row);
		});
		return Object.keys(groups).sort().map(key => ({ title: key, rows: groups[key] }));
	});

	// --- 6. Helpers & Actions ---
	function handleSort(key) {
		if (sortState.key === key) {
			sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
		} else {
			sortState.key = key;
			sortState.dir = 'asc';
		}
	}

	function formatDate(isoString) {
		if (!isoString) return '-';
		return new Date(isoString).toLocaleDateString('pt-BR');
	}

	function getSmartVal(row, colName) {
		const score = row[`${colName}_score`];
		const level = row[`${colName}_level`] || row[`${colName.replace('competence_', 'Final_')}`]; 
		if (score !== undefined && score !== null && score !== 0) return score;
		if (level !== undefined && level !== null) return level;
		if (colName === 'final') return row.final_score || row.final_level || '-';
		return '-';
	}

	// NEW: Export Function
	function exportToCSV() {
		if (processedRows.length === 0) return;
		
		// Use PapaParse to generate CSV string from the filtered data
		const csv = Papa.unparse(processedRows);
		
		// Create a blob and trigger download
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", `evaluations_export_${new Date().toISOString().slice(0,10)}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

</script>

<div class="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
	<div class="max-w-[1600px] mx-auto space-y-6">
		
		<!-- HEADER -->
		<div class="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-6">
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Evaluations Explorer</h1>
				<p class="text-gray-500 text-sm mt-1">Raw data view.</p>
			</div>
			
			<div class="flex items-end gap-4">
				<div class="text-right">
					<div class="text-xs font-bold uppercase text-gray-400 mb-1">Total Rows</div>
					<div class="text-2xl font-mono font-bold text-blue-600">{processedRows.length}</div>
				</div>
				
				<!-- EXPORT BUTTON -->
				<button 
					onclick={exportToCSV}
					class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={processedRows.length === 0}
				>
					<span>⬇ Export CSV</span>
				</button>
			</div>
		</div>

		{#if loading}
			<div class="flex justify-center py-20"><p class="text-blue-600 font-bold animate-pulse">Loading Dataset...</p></div>
		{:else if errorMsg}
			<div class="bg-red-50 p-4 text-red-700 font-bold border-l-4 border-red-500">{errorMsg}</div>
		{:else}

			<!-- SHARED FILTER MENU -->
			<FilterMenu 
				bind:filters 
				{uniqueCities} 
				{uniqueSchools} 
				{uniqueClasses} 
				{availableMonths}
			/>

			<!-- CONTROLS & TABLE -->
			<div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col">
				
				<!-- Group By Widget -->
				<div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
					<div class="flex items-center gap-3">
						<span class="text-xs font-bold uppercase text-gray-500">Group Rows By:</span>
						<div class="flex gap-2">
							{#each [
								{ val: 'None', label: 'None' },
								{ val: 'city_name', label: 'City' },
								{ val: 'school_name', label: 'School' },
								{ val: 'class_name', label: 'Class' }
							] as grp}
								<button 
									class="px-3 py-1 text-xs rounded-full font-medium transition-all
									{groupByField === grp.val 
										? 'bg-blue-600 text-white shadow-sm' 
										: 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}"
									onclick={() => groupByField = grp.val}
								>
									{grp.label}
								</button>
							{/each}
						</div>
					</div>
					
					<button 
						class="text-xs text-red-500 hover:underline font-medium"
						onclick={() => filters = { city: 'All', school: 'All', class: 'All', exam: 'All', startMonth: 'All', endMonth: 'All' }}
					>
						Reset All Filters
					</button>
				</div>

				<!-- SCROLLABLE TABLE CONTAINER (Sticky Header Magic) -->
				<!-- max-h-[75vh]: Sets the scrollable area height -->
				<!-- overflow-auto: Enables scrolling in both directions -->
				<div class="overflow-auto max-h-[75vh]">
					<table class="w-full text-left border-collapse text-sm">
						<!-- sticky top-0: Sticks the header to the top of the container -->
						<!-- z-10: Ensures header stays above content -->
						<thead class="bg-gray-100 text-gray-600 uppercase text-xs font-semibold tracking-wider border-b-2 border-gray-200 sticky top-0 z-10 shadow-sm">
							<tr>
								{#each [
									{ k: 'city_name', l: 'City' },
									{ k: 'school_name', l: 'School' },
									{ k: 'class_name', l: 'Class' },
									{ k: 'student_name', l: 'Student' },
									{ k: 'exam_type', l: 'Exam' },
									{ k: 'essay_date', l: 'Date' },
									{ k: 'final_score', l: 'Final' },
									{ k: 'competence_1_score', l: 'C1' },
									{ k: 'competence_2_score', l: 'C2' },
									{ k: 'competence_3_score', l: 'C3' },
									{ k: 'competence_4_score', l: 'C4' },
									{ k: 'competence_5_score', l: 'C5' }
								] as col}
									<th 
										class="px-4 py-3 cursor-pointer hover:bg-gray-200 transition-colors select-none whitespace-nowrap group bg-gray-100"
										onclick={() => handleSort(col.k)}
									>
										<div class="flex items-center gap-1">
											{col.l}
											{#if sortState.key === col.k}
												<span class="text-blue-600">{sortState.dir === 'asc' ? '↑' : '↓'}</span>
											{:else}
												<span class="text-gray-300 opacity-0 group-hover:opacity-100">↕</span>
											{/if}
										</div>
									</th>
								{/each}
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-100">
							{#each groupedRows as group}
								{#if groupByField !== 'None'}
									<tr class="bg-blue-50 border-y border-blue-100">
										<td colspan="12" class="px-4 py-2 font-bold text-blue-800 text-sm">
											{group.title} <span class="ml-2 font-normal text-blue-600 text-xs bg-white px-2 py-0.5 rounded-full border border-blue-200">{group.rows.length} rows</span>
										</td>
									</tr>
								{/if}
								{#each group.rows as row}
									<tr class="hover:bg-gray-50 transition-colors group">
										<td class="px-4 py-2 whitespace-nowrap text-gray-500">{row.city_name}</td>
										<td class="px-4 py-2 whitespace-nowrap text-gray-500 max-w-[200px] truncate" title={row.school_name}>{row.school_name}</td>
										<td class="px-4 py-2 whitespace-nowrap font-medium text-gray-700">{row.class_name}</td>
										<td class="px-4 py-2 whitespace-nowrap font-medium text-gray-900 max-w-[200px] truncate" title={row.student_name}>{row.student_name}</td>
										<td class="px-4 py-2 whitespace-nowrap"><span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide {row.exam_type?.includes('enem') ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}">{row.exam_type}</span></td>
										<td class="px-4 py-2 whitespace-nowrap text-gray-500 text-xs font-mono">{formatDate(row.essay_date)}</td>
										<td class="px-4 py-2 font-bold text-gray-800 bg-gray-50 border-x border-gray-100 text-center">{getSmartVal(row, 'final')}</td>
										<td class="px-4 py-2 text-center text-gray-600">{getSmartVal(row, 'competence_1')}</td>
										<td class="px-4 py-2 text-center text-gray-600">{getSmartVal(row, 'competence_2')}</td>
										<td class="px-4 py-2 text-center text-gray-600">{getSmartVal(row, 'competence_3')}</td>
										<td class="px-4 py-2 text-center text-gray-600">{getSmartVal(row, 'competence_4')}</td>
										<td class="px-4 py-2 text-center text-gray-600">{getSmartVal(row, 'competence_5')}</td>
									</tr>
								{/each}
							{/each}
						</tbody>
					</table>
					{#if processedRows.length === 0}
						<div class="p-12 text-center text-gray-400">No evaluations found matching these filters.</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>