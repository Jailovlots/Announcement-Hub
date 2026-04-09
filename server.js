// This file allows Render to start the server using 'node server.js'
// It spawns the 'tsx' process to handle TypeScript execution
const { spawn } = require('child_process');
const path = require('path');

console.log("Starting backend server via server.js...");

const child = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

child.on('exit', (code) => {
  process.exit(code);
});
