/**
 * Consistent Metro port + Windows-friendly defaults when starting Expo.
 * Vendor app: 8080 (user app uses 8081).
 *
 * Default EXPO_NO_CACHE=1 avoids @expo/cli disk fetch cache races when user +
 * vendor start together ("Body has already been read" in dependency validation).
 * Override with EXPO_NO_CACHE=0 if you want API caching.
 */
const { spawn } = require("child_process");
const path = require("path");

const METRO_PORT = "8080";

const expoSubcommand = process.argv[2];
const passthrough = process.argv.slice(3);

const needsPort =
  expoSubcommand === "start" ||
  expoSubcommand === "run:android" ||
  expoSubcommand === "run:ios";

const expoArgs = [expoSubcommand, ...passthrough];
if (needsPort && !passthrough.includes("--port")) {
  expoArgs.push("--port", METRO_PORT);
}

const env = {
  ...process.env,
  RCT_METRO_PORT: METRO_PORT,
  ...(process.env.EXPO_NO_CACHE == null ? { EXPO_NO_CACHE: "1" } : {}),
};

const child = spawn("npx", ["expo", ...expoArgs], {
  cwd: path.join(__dirname, ".."),
  env,
  shell: true,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
