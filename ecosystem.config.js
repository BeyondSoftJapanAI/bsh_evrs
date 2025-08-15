// PM2生态系统配置文件 - BSH Event Registration System
// 使用方法: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'bsh-evrs',
      script: 'serve',
      args: '-s build -l 80',
      cwd: '/opt/bsh-evrs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 80
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 80
      },
      // 日志配置
      log_file: '/var/log/pm2/bsh-evrs.log',
      out_file: '/var/log/pm2/bsh-evrs-out.log',
      error_file: '/var/log/pm2/bsh-evrs-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 进程管理
      min_uptime: '10s',
      max_restarts: 10,
      
      // 监控
      monitoring: false,
      
      // 集群模式配置（可选）
      // instances: 'max', // 使用所有CPU核心
      // exec_mode: 'cluster'
    }
  ],
  
  // 部署配置（可选）
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-lightsail-ip',
      ref: 'origin/master',
      repo: 'https://github.com/BeyondSoftJapanAI/bsh_evrs.git',
      path: '/opt/bsh-evrs',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};