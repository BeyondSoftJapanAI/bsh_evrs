#!/bin/bash

# BSH Event Registration System - AWS Lightsail 部署脚本
# 使用方法：在Lightsail实例上运行此脚本

set -e

echo "=== BSH Event Registration System - AWS Lightsail 部署脚本 ==="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}请不要以root用户运行此脚本${NC}"
    exit 1
fi

# 函数：打印状态信息
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Node.js是否已安装
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装Node.js"
        exit 1
    fi
    print_status "Node.js 版本: $(node --version)"
}

# 检查npm是否已安装
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装，请先安装npm"
        exit 1
    fi
    print_status "npm 版本: $(npm --version)"
}

# 更新系统
update_system() {
    print_status "更新系统包..."
    sudo apt update && sudo apt upgrade -y
}

# 安装必要工具
install_tools() {
    print_status "安装必要工具..."
    
    # 安装Git
    if ! command -v git &> /dev/null; then
        sudo apt install git -y
        print_status "Git 安装完成"
    else
        print_status "Git 已安装: $(git --version)"
    fi
    
    # 安装PM2
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
        print_status "PM2 安装完成"
    else
        print_status "PM2 已安装: $(pm2 --version)"
    fi
    
    # 安装serve
    if ! npm list -g serve &> /dev/null; then
        sudo npm install -g serve
        print_status "serve 安装完成"
    else
        print_status "serve 已安装"
    fi
}

# 克隆代码仓库
clone_repository() {
    print_status "克隆代码仓库..."
    
    APP_DIR="/opt/bsh_evrs"
    
    if [ -d "$APP_DIR" ]; then
        print_warning "目录 $APP_DIR 已存在，正在更新代码..."
        cd $APP_DIR
        sudo git pull origin master
    else
        print_status "克隆仓库到 $APP_DIR"
        sudo git clone https://github.com/BeyondSoftJapanAI/bsh_evrs.git $APP_DIR
    fi
    
    # 更改所有者
    sudo chown -R $USER:$USER $APP_DIR
    cd $APP_DIR
}

# 安装依赖和构建
build_application() {
    print_status "安装依赖包..."
    npm install
    
    print_status "构建生产版本..."
    npm run build
}

# 创建PM2配置
create_pm2_config() {
    print_status "创建PM2配置文件..."
    
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
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
    
    # 创建日志目录
    mkdir -p logs
}

# 启动应用
start_application() {
    print_status "启动应用..."
    
    # 停止现有进程（如果存在）
    pm2 delete bsh-evrs 2>/dev/null || true
    
    # 启动新进程
    pm2 start ecosystem.config.js
    
    # 保存PM2配置
    pm2 save
    
    # 设置开机自启
    pm2 startup systemd -u $USER --hp $HOME
}

# 创建部署脚本
create_deploy_script() {
    print_status "创建部署脚本..."
    
    cat > deploy.sh << 'EOF'
#!/bin/bash
# 快速部署脚本
set -e

echo "开始部署更新..."
cd /opt/bsh_evrs

# 拉取最新代码
git pull origin master

# 安装依赖
npm install

# 构建应用
npm run build

# 重启应用
pm2 restart bsh-evrs

echo "部署完成！"
EOF
    
    chmod +x deploy.sh
    print_status "部署脚本创建完成: $(pwd)/deploy.sh"
}

# 显示防火墙配置提示
show_firewall_info() {
    print_warning "请确保在Lightsail控制台配置防火墙规则："
    echo "  1. 登录AWS Lightsail控制台"
    echo "  2. 进入实例详情页"
    echo "  3. 点击 'Networking' 选项卡"
    echo "  4. 在 'Firewall' 部分添加规则："
    echo "     - Application: Custom"
    echo "     - Protocol: TCP"
    echo "     - Port: 3000"
    echo "     - Source: Anywhere (0.0.0.0/0)"
    echo ""
}

# 显示完成信息
show_completion_info() {
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "YOUR_PUBLIC_IP")
    
    print_status "部署完成！"
    echo ""
    echo "应用信息："
    echo "  - 应用名称: BSH Event Registration System"
    echo "  - 部署目录: /opt/bsh_evrs"
    echo "  - 访问地址: http://$PUBLIC_IP:3000"
    echo ""
    echo "常用命令："
    echo "  - 查看状态: pm2 status"
    echo "  - 查看日志: pm2 logs bsh-evrs"
    echo "  - 重启应用: pm2 restart bsh-evrs"
    echo "  - 快速部署: cd /opt/bsh_evrs && ./deploy.sh"
    echo ""
    print_warning "请配置防火墙规则以允许访问端口3000"
}

# 主函数
main() {
    print_status "开始部署 BSH Event Registration System..."
    
    check_nodejs
    check_npm
    update_system
    install_tools
    clone_repository
    build_application
    create_pm2_config
    start_application
    create_deploy_script
    
    show_firewall_info
    show_completion_info
}

# 错误处理
trap 'print_error "部署过程中发生错误，请检查日志"' ERR

# 运行主函数
main

print_status "部署脚本执行完成！"