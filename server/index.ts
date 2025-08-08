import { exec } from 'child_process';

// Set environment variable to allow all hosts
process.env.DANGEROUSLY_DISABLE_HOST_CHECK = 'true';

// Start Vite dev server from root directory to resolve aliases correctly
const viteProcess = exec('vite --host 0.0.0.0 --port 5000', {
  env: { 
    ...process.env, 
    DANGEROUSLY_DISABLE_HOST_CHECK: 'true'
  }
}, (error, stdout, stderr) => {
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

console.log('Starting Vite dev server with host check disabled...');