module.exports = {
  apps: [
    {
      name: "asset-manager",
      script: "./dist/server/src/server.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
