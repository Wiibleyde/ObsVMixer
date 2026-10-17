import { rm } from 'node:fs/promises';

const outdir = 'dist';
const publicPath = process.env.PUBLIC_PATH ?? '/ObsVMixer/';

await rm(outdir, { recursive: true, force: true });

const result = await Bun.build({
    entrypoints: ['./index.html'],
    outdir,
    publicPath,
    minify: true,
    define: { 'process.env.NODE_ENV': '"production"' },
});

if (!result.success) {
    for (const log of result.logs) console.error(log);
    process.exit(1);
}

for (const output of result.outputs) {
    console.log(`${output.path.replace(process.cwd(), '.')}  ${(output.size / 1024).toFixed(1)} KB`);
}
