# AWS Lightsail 部署指南

本指南将帮助您将BSH事件注册系统部署到AWS Lightsail。

## 前提条件

- AWS账户
- 已完成的React应用代码
- 基本的Linux命令行知识

## 步骤1: 创建Lightsail实例

### 1.1 登录AWS Lightsail控制台
1. 访问 [AWS Lightsail控制台](https://lightsail.aws.amazon.com/)
2. 使用您的AWS账户登录

### 1.2 创建实例
1. 点击 "Create instance"
2. 选择实例位置（推荐选择离用户最近的区域）
3. 选择平台：**Linux/Unix**
4. 选择蓝图：**Node.js**
5. 选择实例计划：
   - 开发/测试：$3.50/月 (512 MB RAM, 1 vCPU, 20 GB SSD)
   - 生产环境：$5/月 (1 GB RAM, 1 vCPU, 40 GB SSD)
6. 为实例命名：`bsh-evrs-app`
7. 点击 "Create instance"

## 步骤2: 配置实例

### 2.1 连接到实例
1. 等待实例状态变为 "Running"
2. 点击实例名称进入详情页
3. 点击 "Connect using SSH" 或使用SSH客户端

### 2.2 更新系统
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 安装必要工具
```bash
# 安装Git
sudo apt install git -y

# 安装PM2（进程管理器）
sudo npm install -g pm2

# 安装serve（静态文件服务器）
sudo npm install -g serve
```

## 步骤3: 部署应用

### 3.1 克隆代码仓库
```bash
cd /opt
sudo git clone https://github.com/BeyondSoftJapanAI/bsh_evrs.git
sudo chown -R bitnami:bitnami bsh_evrs
cd bsh_evrs
```

### 3.2 安装依赖
```bash
npm install
```

### 3.3 构建生产版本
```bash
npm run build
```

### 3.4 使用PM2启动应用
```bash
# 创建PM2配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bsh-evrs',
    script: 'serve',
    args: '-s build -l 3000',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# 启动应用
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
sudo env PATH=$PATH:/opt/bitnami/node/bin /opt/bitnami/node/lib/node_modules/pm2/bin/pm2 startup systemd -u bitnami --hp /home/bitnami
```

## 步骤4: 配置防火墙

### 4.1 在Lightsail控制台配置
1. 进入实例详情页
2. 点击 "Networking" 选项卡
3. 在 "Firewall" 部分点击 "Add rule"
4. 添加以下规则：
   - Application: Custom
   - Protocol: TCP
   - Port: 3000
   - Source: Anywhere (0.0.0.0/0)

## 步骤5: 访问应用

1. 在实例详情页找到 "Public IP"
2. 在浏览器中访问：`http://YOUR_PUBLIC_IP:3000`

## 步骤6: 配置域名（可选）

### 6.1 创建静态IP
1. 在Lightsail控制台，点击 "Networking" → "Static IPs"
2. 点击 "Create static IP"
3. 选择您的实例
4. 为静态IP命名并创建

### 6.2 配置域名
1. 在您的域名提供商处，创建A记录指向静态IP
2. 等待DNS传播（通常需要几分钟到几小时）

### 6.3 配置SSL证书
```bash
# 安装Certbot
sudo apt install certbot -y

# 安装Nginx
sudo apt install nginx -y

# 配置Nginx
sudo tee /etc/nginx/sites-available/bsh-evrs << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 启用站点
sudo ln -s /etc/nginx/sites-available/bsh-evrs /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 步骤7: 自动化部署（可选）

### 7.1 创建部署脚本
```bash
cat > deploy.sh << 'EOF'
#!/bin/bash
cd /opt/bsh_evrs
git pull origin master
npm install
npm run build
pm2 restart bsh-evrs./
EOF

chmod +x deploy.sh
```

### 7.2 设置Webhook（高级）
可以配置GitHub Webhook来实现自动部署，当代码推送到master分支时自动更新应用。

## 监控和维护

### 查看应用状态
```bash
pm2 status
pm2 logs bsh-evrs
```

### 重启应用
```bash
pm2 restart bsh-evrs
```

### 更新应用
```bash
cd /opt/bsh_evrs
git pull origin master
npm install
npm run build
pm2 restart bsh-evrs
```

## 故障排除

### 应用无法访问
1. 检查PM2状态：`pm2 status`
2. 查看日志：`pm2 logs bsh-evrs`
3. 检查防火墙规则
4. 确认端口3000是否开放

### 内存不足
1. 升级Lightsail实例计划
2. 优化应用性能
3. 配置swap文件

### SSL证书问题
1. 确认域名DNS设置正确
2. 检查Nginx配置
3. 重新申请证书：`sudo certbot renew`

## 成本估算

- **基础实例** ($3.50/月)：适合开发和小规模使用
- **标准实例** ($5/月)：适合生产环境
- **静态IP** ($5/月)：如果需要固定IP地址
- **域名**：根据域名提供商定价

## 安全建议

1. 定期更新系统和依赖包
2. 使用强密码和SSH密钥认证
3. 配置防火墙只开放必要端口
4. 启用SSL/TLS加密
5. 定期备份数据
6. 监控应用日志和性能

完成以上步骤后，您的BSH事件注册系统将在AWS Lightsail上成功运行！