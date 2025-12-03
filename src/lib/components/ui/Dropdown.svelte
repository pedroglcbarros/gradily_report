<script>
	let { 
		label = 'Select', 
		icon = null, 
		active = false,
		align = 'left',
		width = 'w-56',
		variant = 'default', // 'default' | 'reset'
		children 
	} = $props();

	let isOpen = $state(false);
	let menuRef;

	function toggle() {
		isOpen = !isOpen;
	}

	function close(e) {
		if (menuRef && !menuRef.contains(e.target)) {
			isOpen = false;
		}
	}

	const VARIANTS = {
		default: {
			// Gray border, gray text. No blue.
			btn: "bg-[#FAFAFA] border-[#D4D4D8] text-[#3F3F46] hover:bg-gray-100",
			// When active (open or value selected), just slightly darker gray/text, no blue ring.
			active: "bg-[#F4F4F5] text-black border-[#A1A1AA]", 
			icon: "text-[#3F3F46]"
		},
		reset: {
			btn: "bg-[#FFF1F2] border-[#FFA1AD] text-[#EC003F] hover:bg-[#ffe1e6]",
			active: "",
			icon: "text-[#EC003F]"
		}
	};

	let currentStyle = $derived(VARIANTS[variant]);
</script>

<svelte:window onclick={close} />

<div class="relative inline-block text-left" bind:this={menuRef}>
	<button
		onclick={toggle}
		class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-[6px] transition-all border shadow-sm outline-none focus:ring-0
		{currentStyle.btn} {active && variant === 'default' ? currentStyle.active : ''}"
	>
		{#if icon}
			<span class={currentStyle.icon}>{@render icon()}</span>
		{/if}
		<span>{label}</span>
		<svg class="w-4 h-4 transition-transform {isOpen ? 'rotate-180' : ''} {currentStyle.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div 
			class="absolute z-50 mt-2 {width} bg-white rounded-[6px] shadow-xl border border-gray-100 ring-1 ring-black/5 origin-top-{align} {align === 'right' ? 'right-0' : 'left-0'}"
		>
			<div class="p-1">
				{@render children()}
			</div>
		</div>
	{/if}
</div>