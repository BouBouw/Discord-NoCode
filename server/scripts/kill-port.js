import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read PORT directly from .env without dotenv to avoid issues
let PORT = 3008;
try {
  const env = readFileSync(resolve(__dirname, '../.env'), 'utf8');
  const match = env.match(/^PORT=(\d+)/m);
  if (match) PORT = parseInt(match[1], 10);
} catch {}

console.log(`Checking port ${PORT}...`);

try {
  const output = execSync(`netstat -ano | findstr ":${PORT} " | findstr "LISTENING"`, {
    encoding: 'utf8',
    stdio: 'pipe',
  });

  const pids = new Set();
  for (const line of output.trim().split('\n')) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== '0') pids.add(pid);
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
      console.log(`Killed PID ${pid} (was holding port ${PORT})`);
    } catch {
      // Already gone
    }
  }
} catch {
  // Port is free — nothing to kill
  console.log(`Port ${PORT} is free.`);
}
