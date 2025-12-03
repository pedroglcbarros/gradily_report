<script>
	import Papa from 'papaparse';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import FilterMenu from '$lib/components/FilterMenu.svelte';

	// --- CONFIGURATION ---
	const CSV_FILENAME = '/master_dataset_v3.csv';

	const SAEB_MAP = {
		'i': 200, 'ii': 400, 'iii': 600, 'iv': 800, 'v': 1000,
		'insuficiente': 200, 'básico': 500, 'proficiente': 750, 'avançado': 1000,
		'0': 0, '1': 200, '2': 400, '3': 600, '4': 800, '5': 1000
	};

	// --- 1. STATE ---
	let rawData = $state([]);
	let loading = $state(true);
	
	let filters = $state({
		city: 'All',
		school: 'All',
		class: 'All',
		exam: 'enem',
		startMonth: 'All',
		endMonth: 'All'
	});

	// Chart Instances
	let lineCanvas, barCanvas, radarCanvas;
	let charts = {};

	// --- 2. DATA LOADING ---
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
			}
		});
	});

	// --- 3. FILTERING ---
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

	$effect(() => {
		if (filters.city !== 'All' && !uniqueCities.includes(filters.city)) filters.city = 'All';
		if (filters.school !== 'All' && !uniqueSchools.includes(filters.school)) filters.school = 'All';
		if (filters.class !== 'All' && !uniqueClasses.includes(filters.class)) filters.class = 'All';
	});

	let processedRows = $derived(rawData.filter(r => checkRow(r)));

	// --- 4. SCORING ---
	function getScore(row) {
		const type = String(row.exam_type || '').toLowerCase();
		if (type.includes('enem')) return parseFloat(row.final_score ?? 0);
		if (type.includes('saeb')) {
			const isYear6 = type.includes('saeb6');
			let verifier = row.final_level ?? (isYear6 ? row.competence_5_level : row.competence_4_level);
			if (String(verifier).trim().toUpperCase() !== 'A') return 0;
			let sum = 0, count = 0;
			const max = isYear6 ? 4 : 3;
			for (let i = 1; i <= max; i++) {
				const val = row[`competence_${i}_level`];
				if (val != null) {
					const k = String(val).trim();
					const w = SAEB_MAP[k] ?? SAEB_MAP[k.toLowerCase()];
					if (w !== undefined) { sum += w; count++; }
				}
			}
			return count > 0 ? sum / count : 0;
		}
		return 0;
	}

	// --- 5. CHART DATA ---
	function prepareMultiLineData(data) {
		const entityField = filters.school !== 'All' ? 'class_name' : 'school_name';
		const timeline = {};
		const entityTotals = {};

		data.forEach(r => {
			if (!r.essay_date) return;
			const dateKey = r.essay_date.substring(0, 10);
			const entity = r[entityField] || 'Unknown';
			const s = getScore(r);
			
			if (s > 0) {
				if (!timeline[dateKey]) timeline[dateKey] = {};
				if (!timeline[dateKey][entity]) timeline[dateKey][entity] = [];
				timeline[dateKey][entity].push(s);

				if (!entityTotals[entity]) entityTotals[entity] = { sum: 0, count: 0 };
				entityTotals[entity].sum += s;
				entityTotals[entity].count++;
			}
		});

		const topEntities = Object.keys(entityTotals)
			.sort((a,b) => (entityTotals[b].sum/entityTotals[b].count) - (entityTotals[a].sum/entityTotals[a].count))
			.slice(0, 5);

		const sortedDates = Object.keys(timeline).sort();
		const datasets = topEntities.map((entity, i) => {
			const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'];
			return {
				label: entity,
				data: sortedDates.map(d => {
					const scores = timeline[d][entity];
					if (!scores) return null;
					return scores.reduce((a,b)=>a+b,0) / scores.length;
				}),
				borderColor: colors[i % colors.length],
				backgroundColor: colors[i % colors.length],
				tension: 0.3,
				pointRadius: 3,
				spanGaps: true
			};
		});

		return {
			labels: sortedDates.map(d => new Date(d).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})),
			datasets
		};
	}

	function prepareRadarData(data) {
		const comps = { 'C1': [], 'C2': [], 'C3': [], 'C4': [], 'C5': [] };
		data.forEach(r => {
			if (!r.exam_type?.includes('enem')) return;
			for (let i=1; i<=5; i++) {
				const s = parseFloat(r[`competence_${i}_score`] || 0);
				if (s > 0) comps[`C${i}`].push(s);
			}
		});
		return {
			labels: ['C1 (Grammar)', 'C2 (Theme)', 'C3 (Logic)', 'C4 (Cohesion)', 'C5 (Proposal)'],
			datasets: [{
				label: 'Average Competence Score',
				data: Object.values(comps).map(arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0),
				backgroundColor: 'rgba(37, 99, 235, 0.2)',
				borderColor: '#2563eb',
				pointBackgroundColor: '#2563eb'
			}]
		};
	}

	// --- 6. RENDER ---
	$effect(() => {
		if (loading || processedRows.length === 0) return;

		if (charts.line) charts.line.destroy();
		if (charts.radar) charts.radar.destroy();

		const lineData = prepareMultiLineData(processedRows);
		charts.line = new Chart(lineCanvas, {
			type: 'line',
			data: lineData,
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { 
					legend: { position: 'top' },
					title: { display: true, text: 'Performance Trend by Entity (Daily Avg)' }
				},
				interaction: { mode: 'index', intersect: false },
				scales: { y: { min: 0, max: 1000 } }
			}
		});

		const radarData = prepareRadarData(processedRows);
		charts.radar = new Chart(radarCanvas, {
			type: 'radar',
			data: radarData,
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: { r: { min: 0, max: 200, ticks: { display: false } } }
			}
		});
	});

</script>

<div class="p-6 max-w-[1600px] mx-auto space-y-6">

	<!-- SHARED FILTER MENU -->
	<FilterMenu 
		bind:filters 
		{uniqueCities} 
		{uniqueSchools} 
		{uniqueClasses} 
		{availableMonths}
	/>

	<!-- CHARTS AREA -->
	{#if processedRows.length === 0}
		<div class="flex justify-center py-20 text-gray-400">No data available for current filters.</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			
			<div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-[450px]">
				<canvas bind:this={lineCanvas}></canvas>
			</div>

			<div class="flex flex-col gap-6">
				<div class="bg-blue-600 p-6 rounded-lg shadow-sm text-white">
					<div class="text-blue-100 text-xs font-bold uppercase tracking-wider">Current Selection Avg</div>
					<div class="text-5xl font-bold mt-2">
						{(processedRows.reduce((a,b) => a + getScore(b), 0) / processedRows.filter(r => getScore(r) > 0).length || 0).toFixed(0)}
					</div>
					<div class="text-sm text-blue-200 mt-2">{processedRows.length} essays analyzed</div>
				</div>

				<div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex-1 min-h-[300px]">
					<h3 class="font-bold text-gray-700 mb-2 text-center">Competence Breakdown (ENEM)</h3>
					<div class="h-full pb-6">
						<canvas bind:this={radarCanvas}></canvas>
					</div>
				</div>
			</div>

		</div>
	{/if}
</div>