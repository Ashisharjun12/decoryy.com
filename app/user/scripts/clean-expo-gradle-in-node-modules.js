/**
 * Android builds run Gradle inside node_modules/expo-modules-autolinking
 * (see android/settings.gradle includeBuild). That leaves .gradle locks and
 * breaks npm install (EBUSY on Windows / OneDrive).
 *
 * Run before npm install, or use the package "preinstall" script.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..', 'node_modules');

/** Gradle daemons lock files under expo-modules-autolinking on Windows. */
function stopGradleDaemonsOnWindows() {
  if (process.platform !== 'win32') return;
  try {
    const ps1 = path.join(__dirname, 'stop-gradle-daemons.ps1').replace(/'/g, "''");
    execSync(`powershell -NoProfile -File '${ps1}'`, { stdio: 'ignore', timeout: 20000 });
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500);
  } catch {
    // best-effort
  }
}

stopGradleDaemonsOnWindows();

function rmSafe(target) {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      fs.rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 300 });
      return true;
    } catch {
      if (attempt < 7) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 400);
      }
    }
  }
  return false;
}

if (!fs.existsSync(root)) {
  process.exit(0);
}

let ok = true;

// Remove the whole package so npm can re-extract it without locked .gradle inside.
if (!rmSafe(path.join(root, 'expo-modules-autolinking'))) {
  ok = false;
}

try {
  for (const name of fs.readdirSync(root)) {
    if (name.startsWith('.expo-modules-autolinking-')) {
      if (!rmSafe(path.join(root, name))) ok = false;
    }
  }
} catch {
  // ignore
}

if (!ok) {
  console.warn(
    '[preinstall] Could not remove expo-modules-autolinking (file locked).',
  );
  console.warn('Close Metro/Android Studio, run: cd android && gradlew.bat --stop');
  console.warn('Pause OneDrive sync, then delete: node_modules\\expo-modules-autolinking');
}
