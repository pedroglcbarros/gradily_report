<script>
	import { DataController } from '$lib/logic/data-controller.svelte.js';
	import ExplorerLayout from '$lib/components/explorer/ExplorerLayout.svelte';
	import DataTable from '$lib/components/explorer/table/DataTable.svelte';

	// Initialize the controller with the dataset
	// Svelte 5 classes are reactive by default
	const controller = new DataController('/master_dataset_v3.csv');
</script>

<!-- 
	The Layout handles the full-screen structure.
	We pass the controller to it so it can render the TopBar controls.
-->
<ExplorerLayout {controller}>
	<!-- 
		The Slot Content:
		The actual data table that fills the main area 
	-->
	<DataTable {controller} />
</ExplorerLayout>