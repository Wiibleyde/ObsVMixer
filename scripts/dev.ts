import index from '../index.html';

const server = Bun.serve({
    hostname: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    routes: {
        '/*': index,
    },
    development: {
        hmr: true,
        console: true,
    },
});

console.log(`🚀 Dev server: ${server.url}`);
