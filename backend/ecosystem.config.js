// Configuration PM2 (production, sur le VPS).
module.exports = {
  apps: [
    {
      name: 'ampela-api',
      script: 'dist/main.js',
      cwd: '/opt/ampela-api',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '400M',
      time: true,
    },
  ],
};
