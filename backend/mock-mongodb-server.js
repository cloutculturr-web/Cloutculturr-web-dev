// Simple MongoDB Mock Server for Development
// This allows testing the backend without actual MongoDB installation

import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting MongoDB Mock Server...');

// Try to find and start actual MongoDB if available
const mongodPaths = [
  'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
  'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
  'C:\\Program Files\\MongoDB\\Server\\5.0\\bin\\mongod.exe',
  '/usr/local/bin/mongod',
  '/usr/bin/mongod',
];

// Create data directory if it doesn't exist
import fs from 'fs';
const dbPath = path.join(process.cwd(), '..', '..', 'mongodb-data');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
  console.log(`📁 Created data directory: ${dbPath}`);
}

let mongodProcess = null;

for (const mongodPath of mongodPaths) {
  try {
    if (fs.existsSync(mongodPath)) {
      console.log(`✅ Found MongoDB at: ${mongodPath}`);
      
      mongodProcess = spawn(mongodPath, ['--dbpath', dbPath, '--port', '27017'], {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      mongodProcess.stdout.on('data', (data) => {
        console.log(`[MongoDB] ${data}`);
      });

      mongodProcess.stderr.on('data', (data) => {
        console.log(`[MongoDB] ${data}`);
      });

      mongodProcess.on('error', (err) => {
        console.error(`❌ MongoDB error: ${err.message}`);
      });

      console.log('✅ MongoDB started on port 27017');
      break;
    }
  } catch (err) {
    // Continue to next path
  }
}

if (!mongodProcess) {
  console.log('⚠️  MongoDB not found. Please install MongoDB Community Edition.');
  console.log('📥 Download from: https://www.mongodb.com/try/download/community');
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down MongoDB...');
  if (mongodProcess) {
    mongodProcess.kill();
  }
  process.exit(0);
});

// Keep process alive
setInterval(() => {}, 1000);
