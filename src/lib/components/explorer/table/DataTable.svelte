<script>
	import TableHeader from './TableHeader.svelte';
	import TableFooter from './TableFooter.svelte';

	let { controller } = $props();

	function formatDate(isoString) {
		if (!isoString) return '-';
		const date = new Date(isoString);
		return date.toLocaleDateString('pt-BR');
	}

	function renderValue(val) {
		if (val === null || val === undefined) return '-';
		return val;
	}

	function getBadgeClass(type) {
		const t = type?.toLowerCase() || '';
		if (t.includes('enem')) return 'bg-blue-100 text-blue-800 border-blue-200';
		if (t.includes('saeb')) return 'bg-orange-100 text-orange-800 border-orange-200';
		return 'bg-gray-100 text-gray-600';
	}
</script>

<div class="h-full w-full overflow-hidden flex flex-col">
	{#if controller.loading}
		<div class="flex items-center justify-center h-full">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else if controller.error}
		<div class="flex items-center justify-center h-full text-red-600 font-bold">
			{controller.error}
		</div>
	{:else if controller.sortedRows.length === 0}
		<div class="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
			<svg class="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<p>No results found for your filters.</p>
		</div>
	{:else}
		<!-- Table Container -->
		<div class="flex-1 overflow-auto rounded-[12px] border border-[#D4D4D8] bg-white shadow-sm relative">
			<table class="w-full text-left border-collapse text-sm">
				<TableHeader {controller} />
				
				<tbody>
					{#each controller.groupedView as group}
						{#if controller.groupBy !== 'None'}
							<tr class="bg-blue-50/50 border-y border-blue-100">
								<td colspan="12" class="px-4 py-2">
									<div class="flex items-center gap-2">
										<span class="font-bold text-blue-800 text-sm">{group.title}</span>
										<span class="text-xs font-medium text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-100 shadow-sm">
											{group.rows.length}
										</span>
									</div>
								</td>
							</tr>
						{/if}

						{#each group.rows as row, i (row.id)}
							<tr class="transition-colors group/row {i % 2 === 0 ? 'bg-[#FAFAFA]' : 'bg-[#F4F4F5]'} hover:brightness-95">
								<td class="px-4 py-2 text-[#3F3F46] truncate max-w-[150px]" title={row.city_name}>{row.city_name}</td>
								<td class="px-4 py-2 text-[#3F3F46] truncate max-w-[200px]" title={row.school_name}>{row.school_name}</td>
								<td class="px-4 py-2 font-medium text-[#3F3F46]">{row.class_name}</td>
								<td class="px-4 py-2 font-medium text-gray-900 truncate max-w-[200px]" title={row.student_name}>{row.student_name}</td>
								
								<td class="px-4 py-2">
									<span class="px-2 py-0.5 rounded-[4px] text-[10px] uppercase font-bold tracking-wide border {getBadgeClass(row.exam_type)}">
										{row.exam_type}
									</span>
								</td>
								
								<td class="px-4 py-2 text-gray-500 text-xs font-mono">{formatDate(row.essay_date)}</td>
								
								<!-- Removed border-x here -->
								<td class="px-4 py-2 font-bold text-gray-800">{renderValue(row.final)}</td>
								<td class="px-4 py-2 text-gray-600">{renderValue(row.c1)}</td>
								<td class="px-4 py-2 text-gray-600">{renderValue(row.c2)}</td>
								<td class="px-4 py-2 text-gray-600">{renderValue(row.c3)}</td>
								<td class="px-4 py-2 text-gray-600">{renderValue(row.c4)}</td>
								<td class="px-4 py-2 text-gray-600">{renderValue(row.c5)}</td>
							</tr>
						{/each}
					{/each}
				</tbody>

				<TableFooter {controller} />
			</table>
		</div>
	{/if}
</div>