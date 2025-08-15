#!/bin/bash

# SSL配置脚本 - BSH Event Registration System
# 使用方法：./setup-ssl.sh your-domain.com

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# 检查参数
if [ $# -eq 0 ]; then
    print_error "请提供域名参数"
    echo "使用方法: $0 your-domain.com"
    exit 1
fi

DOMAIN=$1
WWW_DOMAIN="www.$DOMAIN"

echo "=== SSL配置脚本 - BSH Event Registration System ==="
echo "域名: $DOMAIN"
echo "WWW域名: $WWW_DOMAIN"
echo ""

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    print_error "此脚本需要root权限，请使用sudo运行"
    exit 1
fi

# 检查域名DNS解析
check_dns() {
    print_status "检查DNS解析..."
    
    if ! nslookup $DOMAIN > /dev/null 2>&1; then
        print_warning "域名 $DOMAIN DNS解析失败，请确保域名已正确配置"
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_status "DNS解析正常"
    fi
}

# 安装Nginx
install_nginx() {
    if ! command -v nginx &> /dev/null; then
        print_status "安装Nginx..."
        apt update
        apt install nginx -y
        systemctl enable nginx
        systemctl start nginx
    else
        print_status "Nginx已安装"
    fi
}

# 安装Certbot
install_certbot() {
    if ! command -v certbot &> /dev/null; then
        print_status "安装Certbot..."
        apt update
        apt install certbot python3-certbot-nginx -y
    else
        print_status "Certbot已安装"
    fi
    
    # 验证nginx插件是否可用
    if ! certbot plugins | grep -q nginx; then
        print_status "重新安装Certbot nginx插件..."
        apt install --reinstall python3-certbot-nginx -y
    fi
}

# 配置Nginx
configure_nginx() {
    print_status "配置Nginx..."
    
    # 创建Nginx配置文件
    cat > /etc/nginx/sites-available/bsh-evrs << EOF
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态文件缓存
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # 日志
    access_log /var/log/nginx/bsh-evrs.access.log;
    error_log /var/log/nginx/bsh-evrs.error.log;
}
EOF
    
    # 启用站点
    ln -sf /etc/nginx/sites-available/bsh-evrs /etc/nginx/sites-enabled/
    
    # 删除默认站点
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试Nginx配置
    nginx -t
    
    # 重启Nginx
    systemctl restart nginx
    
    print_status "Nginx配置完成"
}

# 获取SSL证书
get_ssl_certificate() {
    print_status "获取SSL证书..."
    
    # 检查nginx插件是否可用
    if ! certbot plugins | grep -q nginx; then
        print_error "Nginx插件不可用，尝试使用webroot方式获取证书"
        
        # 创建webroot目录
        mkdir -p /var/www/html/.well-known/acme-challenge
        
        # 使用webroot方式获取证书
        certbot certonly --webroot -w /var/www/html -d $DOMAIN -d $WWW_DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        if [ $? -eq 0 ]; then
            print_status "SSL证书获取成功，现在配置Nginx..."
            configure_nginx_ssl
        else
            print_error "SSL证书获取失败"
            exit 1
        fi
    else
        # 使用nginx插件获取证书
        certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        if [ $? -eq 0 ]; then
            print_status "SSL证书获取成功"
        else
            print_error "SSL证书获取失败"
            exit 1
        fi
    fi
}

# 设置自动续期
setup_auto_renewal() {
    print_status "设置SSL证书自动续期..."
    
    # 添加cron任务
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    print_status "自动续期设置完成"
}

# 配置防火墙
configure_firewall() {
    print_status "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        ufw allow 'Nginx Full'
        ufw delete allow 'Nginx HTTP'
        print_status "UFW防火墙配置完成"
    else
        print_warning "UFW未安装，请手动配置防火墙允许HTTP(80)和HTTPS(443)端口"
    fi
}

# 测试SSL配置
test_ssl() {
    print_status "测试SSL配置..."
    
    sleep 5
    
    if curl -s -I https://$DOMAIN | grep -q "HTTP/2 200"; then
        print_status "HTTPS访问正常"
    else
        print_warning "HTTPS访问可能有问题，请手动检查"
    fi
}

# 显示完成信息
show_completion_info() {
    print_status "SSL配置完成！"
    echo ""
    echo "网站信息："
    echo "  - HTTP地址: http://$DOMAIN (自动重定向到HTTPS)"
    echo "  - HTTPS地址: https://$DOMAIN"
    echo "  - WWW地址: https://$WWW_DOMAIN"
    echo ""
    echo "SSL证书信息："
    echo "  - 证书路径: /etc/letsencrypt/live/$DOMAIN/"
    echo "  - 自动续期: 已配置 (每天12:00检查)"
    echo ""
    echo "管理命令："
    echo "  - 检查证书状态: certbot certificates"
    echo "  - 手动续期: certbot renew"
    echo "  - 测试续期: certbot renew --dry-run"
    echo "  - 重启Nginx: systemctl restart nginx"
    echo ""
    print_status "您的网站现在已启用HTTPS加密！"
}

# 手动配置Nginx SSL
configure_nginx_ssl() {
    print_status "手动配置Nginx SSL..."
    
    # 备份原配置
    cp /etc/nginx/sites-available/bsh-evrs /etc/nginx/sites-available/bsh-evrs.backup
    
    # 创建SSL配置
    cat > /etc/nginx/sites-available/bsh-evrs << EOF
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN $WWW_DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    access_log /var/log/nginx/bsh-evrs.access.log;
    error_log /var/log/nginx/bsh-evrs.error.log;
}
EOF
    
    # 测试配置
    nginx -t && systemctl reload nginx
}

# 主函数
main() {
    check_dns
    install_nginx
    install_certbot
    configure_nginx
    get_ssl_certificate
    setup_auto_renewal
    configure_firewall
    test_ssl
    show_completion_info
}

# 错误处理
trap 'print_error "SSL配置过程中发生错误，请检查日志"' ERR

# 运行主函数
main

print_status "SSL配置脚本执行完成！"