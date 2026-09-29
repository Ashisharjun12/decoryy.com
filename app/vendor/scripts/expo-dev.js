/**
 * Consistent Metro port + Windows-friendly defaults when starting Expo.
 * Vendor app: 8080 (user app uses 8081).
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
