[500] GET /
ReferenceError: XMLHttpRequest is not defined
    at NetworkStreamer._readChunk (node_modules/.pnpm/papaparse@5.5.3/node_modules/papaparse/papaparse.js:659:4)
    at NetworkStreamer._nextChunk (node_modules/.pnpm/papaparse@5.5.3/node_modules/papaparse/papaparse.js:641:10)
    at NetworkStreamer.stream (node_modules/.pnpm/papaparse@5.5.3/node_modules/papaparse/papaparse.js:648:9)
    at Object.CsvToJson [as parse] (node_modules/.pnpm/papaparse@5.5.3/node_modules/papaparse/papaparse.js:251:19)
    at DataController.loadData (src/lib/logic/data-controller.svelte.js:36:14)
    at new DataController (src/lib/logic/data-controller.svelte.js:30:26)
    at /home/user/Code/Projects/Ventures/gradily/report/src/routes/+page.svelte:8:18
    at Renderer.child (node_modules/.pnpm/svelte@5.45.3/node_modules/svelte/src/internal/server/renderer.js:185:18)
    at Renderer.component (node_modules/.pnpm/svelte@5.45.3/node_modules/svelte/src/internal/server/renderer.js:210:22)
    at _page (src/routes/+page.svelte:16:13)