#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const patterns = [/Could not find pty/i, /reconnection grace/i, /Could not find pty \d+/i];

function fileContainsPattern(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split(/\r?\n/);
    const matches = [];
    lines.forEach((l, i) => {
      patterns.forEach((p) => {
        if (p.test(l)) matches.push({ line: i + 1, text: l });
      });
    });
    return matches;
  } catch (e) {
    return null;
  }
}

function walk(dir, cb) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, cb);
      else if (e.isFile()) cb(full);
    }
  } catch (e) {
    // ignore
  }
}

function guessLogDirs() {
  const dirs = [];
  const home = process.env.HOME || process.env.USERPROFILE;
  const appdata = process.env.APPDATA;
  if (appdata) {
    dirs.push(path.join(appdata, 'Code', 'logs'));
    dirs.push(path.join(appdata, 'Code - Insiders', 'logs'));
  }
  if (home) {
    dirs.push(path.join(home, '.config', 'Code', 'logs'));
    dirs.push(path.join(home, 'Library', 'Application Support', 'Code', 'logs'));
    dirs.push(path.join(home, '.vscode-server', 'data', 'log'));
  }
  return dirs.filter((d) => fs.existsSync(d));
}

function main() {
  const dirs = guessLogDirs();
  if (!dirs.length) {
    console.log('No VS Code log directories found automatically. You can pass a directory as an argument.');
    console.log('Examples:');
    console.log('  npm run diagnose:terminal -- C:\\Users\\you\\AppData\\Roaming\\Code\\logs');
  }

  const searchDirs = process.argv.slice(2).length ? process.argv.slice(2) : dirs;
  let found = 0;
  for (const d of searchDirs) {
    console.log('\nSearching logs in:', d);
    walk(d, (file) => {
      const matches = fileContainsPattern(file);
      if (matches && matches.length) {
        found += matches.length;
        console.log(`\n--- ${file}`);
        matches.forEach((m) => {
          console.log(`${m.line}: ${m.text}`);
        });
      }
    });
  }
  if (!found) console.log('\nNo PTY related patterns found in searched logs.');
  else console.log(`\nFound ${found} matching line(s).`);
}

main();
