<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
    <!-- TOP NAVIGATION -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div class="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
            <div class="flex items-center gap-8">
                <div class="font-bold text-xl text-blue-700 tracking-tight">
                    EduAnalytics <span class="text-gray-400 font-normal">v3</span>
                </div>
                
                <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <a href="/" class="px-4 py-1.5 text-sm font-medium rounded-md transition-all hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900">
                        Data Explorer
                    </a>
                    <a href="/charts" class="px-4 py-1.5 text-sm font-medium rounded-md transition-all hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900">
                        Visual Dashboard
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- PAGE CONTENT -->
    <main class="flex-1">
        {@render children()}
    </main>
</div>
