const path = require("path");

module.exports = {
  apps: [
    {
      name: "decory-api",
      script: "dist/src/server.js",
      cwd: __dirname,
      env: { NODE_ENV: "production" },
    },
    {
      name: "decory-worker",
      script: "dist/src/worker/index.js",
      cwd: __dirname,
      env: { NODE_ENV: "production" },
    },
  ],
};