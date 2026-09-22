module.exports = {
    apps: [
      { name: "decory-api", script: "dist/src/server.js", cwd: "/opt/decory/backend", env: { NODE_ENV: "production" } },
      { name: "decory-worker", script: "dist/src/worker/index.js", cwd: "/opt/decory/backend", env: { NODE_ENV: "production" } },
    ],
  };