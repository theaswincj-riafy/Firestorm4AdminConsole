import { exec } from 'child_process';

// Start Vite dev server from root directory to resolve aliases correctly
const viteProcess = exec('vite --host 0.0.0.0 --port 5000', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
});

viteProcess.stdout?.on('data', (data) => {
  console.log(data.toString());
});

viteProcess.stderr?.on('data', (data) => {
  console.error(data.toString());
});

console.log('Starting Vite dev server from root directory...');