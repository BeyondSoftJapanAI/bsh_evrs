#!/bin/bash

# 监控脚本 - BSH Event Registration System
# 检查应用程序状态、系统资源和服务健康状况

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印状态信息
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# 获取当前时间
get_timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

echo "=== BSH Event Registration System 监控报告 ==="
echo "时间: $(get_timestamp)"
echo ""

# 检查系统信息
check_system_info() {
    print_info "=== 系统信息 ==="
    echo "主机名: $(hostname)"
    echo "操作系统: $(lsb_release -d 2>/dev/null | cut -f2 || echo 'Unknown')"
    echo "内核版本: $(uname -r)"
    echo "运行时间: $(uptime -p 2>/dev/null || uptime)"
    echo ""
}

# 检查系统资源
check_system_resources() {
    print_info "=== 系统资源 ==="
    
    # CPU使用率
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 || echo "N/A")
    echo "CPU使用率: ${CPU_USAGE}%"
    
    # 内存使用情况
    MEMORY_INFO=$(free -h | grep '^Mem:')
    MEMORY_USED=$(echo $MEMORY_INFO | awk '{print $3}')
    MEMORY_TOTAL=$(echo $MEMORY_INFO | awk '{print $2}')
    MEMORY_PERCENT=$(free | grep '^Mem:' | awk '{printf "%.1f", $3/$2 * 100.0}')
    echo "内存使用: ${MEMORY_USED}/${MEMORY_TOTAL} (${MEMORY_PERCENT}%)"
    
    # 磁盘使用情况
    echo "磁盘使用:"
    df -h | grep -E '^/dev/' | awk '{printf "  %s: %s/%s (%s)\n", $1, $3, $2, $5}'
    
    # 负载平均值
    LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | sed 's/^[ \t]*//')
    echo "负载平均值: ${LOAD_AVG}"
    echo ""
}

# 检查网络连接
check_network() {
    print_info "=== 网络状态 ==="
    
    # 检查端口监听
    if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
        print_status "应用端口 3000 正在监听"
    else
        print_error "应用端口 3000 未监听"
    fi
    
    if netstat -tlnp 2>/dev/null | grep -q ":80 "; then
        print_status "HTTP端口 80 正在监听"
    else
        print_warning "HTTP端口 80 未监听"
    fi
    
    if netstat -tlnp 2>/dev/null | grep -q ":443 "; then
        print_status "HTTPS端口 443 正在监听"
    else
        print_warning "HTTPS端口 443 未监听"
    fi
    
    # 检查网络连接数
    CONNECTIONS=$(netstat -an 2>/dev/null | grep ESTABLISHED | wc -l)
    echo "活跃连接数: ${CONNECTIONS}"
    echo ""
}

# 检查服务状态
check_services() {
    print_info "=== 服务状态 ==="
    
    # 检查PM2
    if command -v pm2 &> /dev/null; then
        if pm2 list | grep -q "bsh-evrs"; then
            PM2_STATUS=$(pm2 list | grep "bsh-evrs" | awk '{print $10}')
            if [ "$PM2_STATUS" = "online" ]; then
                print_status "PM2应用 bsh-evrs 运行正常"
            else
                print_error "PM2应用 bsh-evrs 状态异常: $PM2_STATUS"
            fi
        else
            print_error "PM2应用 bsh-evrs 未找到"
        fi
    else
        print_warning "PM2未安装"
    fi
    
    # 检查Nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        print_status "Nginx服务运行正常"
    else
        print_error "Nginx服务未运行"
    fi
    
    # 检查防火墙
    if command -v ufw &> /dev/null; then
        UFW_STATUS=$(ufw status | head -1 | awk '{print $2}')
        echo "UFW防火墙状态: $UFW_STATUS"
    fi
    echo ""
}

# 检查应用程序健康状况
check_app_health() {
    print_info "=== 应用程序健康检查 ==="
    
    # 检查本地应用响应
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        print_status "本地应用响应正常 (HTTP 200)"
    else
        print_error "本地应用响应异常"
    fi
    
    # 检查应用进程
    if pgrep -f "serve.*build" > /dev/null; then
        PROCESS_COUNT=$(pgrep -f "serve.*build" | wc -l)
        print_status "应用进程运行正常 (${PROCESS_COUNT}个进程)"
    else
        print_error "应用进程未找到"
    fi
    
    # 检查应用日志（如果存在）
    if [ -f "/var/log/pm2/bsh-evrs-error.log" ]; then
        ERROR_COUNT=$(tail -100 /var/log/pm2/bsh-evrs-error.log 2>/dev/null | wc -l)
        if [ "$ERROR_COUNT" -gt 0 ]; then
            print_warning "发现 ${ERROR_COUNT} 条最近错误日志"
        else
            print_status "无最近错误日志"
        fi
    fi
    echo ""
}

# 检查SSL证书
check_ssl_certificate() {
    print_info "=== SSL证书状态 ==="
    
    if command -v certbot &> /dev/null; then
        # 获取证书信息
        CERT_INFO=$(certbot certificates 2>/dev/null | grep -A 5 "Certificate Name")
        if [ -n "$CERT_INFO" ]; then
            print_status "SSL证书已安装"
            echo "$CERT_INFO" | grep -E "(Certificate Name|Domains|Expiry Date)"
        else
            print_warning "未找到SSL证书"
        fi
    else
        print_warning "Certbot未安装"
    fi
    echo ""
}

# 检查磁盘空间警告
check_disk_space() {
    print_info "=== 磁盘空间警告 ==="
    
    # 检查磁盘使用率超过80%的分区
    df -h | awk 'NR>1 {gsub(/%/, "", $5); if($5 > 80) print $0}' | while read line; do
        if [ -n "$line" ]; then
            USAGE=$(echo $line | awk '{print $5}')
            MOUNT=$(echo $line | awk '{print $6}')
            print_warning "磁盘空间不足: ${MOUNT} 使用率 ${USAGE}%"
        fi
    done
    
    # 如果没有警告
    if ! df -h | awk 'NR>1 {gsub(/%/, "", $5); if($5 > 80) print $0}' | grep -q .; then
        print_status "磁盘空间充足"
    fi
    echo ""
}

# 生成监控摘要
generate_summary() {
    print_info "=== 监控摘要 ==="
    
    # 计算总体健康分数
    HEALTH_SCORE=0
    TOTAL_CHECKS=0
    
    # 应用程序检查
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        HEALTH_SCORE=$((HEALTH_SCORE + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    # 服务检查
    if systemctl is-active --quiet nginx 2>/dev/null; then
        HEALTH_SCORE=$((HEALTH_SCORE + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    # PM2检查
    if command -v pm2 &> /dev/null && pm2 list | grep -q "bsh-evrs.*online"; then
        HEALTH_SCORE=$((HEALTH_SCORE + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    # 计算百分比
    HEALTH_PERCENT=$((HEALTH_SCORE * 100 / TOTAL_CHECKS))
    
    if [ $HEALTH_PERCENT -ge 80 ]; then
        print_status "系统健康状况: ${HEALTH_PERCENT}% (${HEALTH_SCORE}/${TOTAL_CHECKS})"
    elif [ $HEALTH_PERCENT -ge 60 ]; then
        print_warning "系统健康状况: ${HEALTH_PERCENT}% (${HEALTH_SCORE}/${TOTAL_CHECKS})"
    else
        print_error "系统健康状况: ${HEALTH_PERCENT}% (${HEALTH_SCORE}/${TOTAL_CHECKS})"
    fi
    
    echo "监控完成时间: $(get_timestamp)"
    echo ""
}

# 显示使用帮助
show_help() {
    echo "使用方法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -q, --quiet    静默模式，只显示错误"
    echo "  -s, --summary  只显示摘要信息"
    echo "  --log          将输出保存到日志文件"
    echo ""
    echo "示例:"
    echo "  $0              # 完整监控报告"
    echo "  $0 -s           # 只显示摘要"
    echo "  $0 --log        # 保存到日志文件"
}

# 主函数
main() {
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--summary)
            generate_summary
            exit 0
            ;;
        -q|--quiet)
            # 静默模式，只检查关键服务
            if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
                print_error "应用程序响应异常"
                exit 1
            fi
            exit 0
            ;;
        --log)
            LOG_FILE="/var/log/bsh-evrs-monitor-$(date +%Y%m%d).log"
            $0 | tee -a "$LOG_FILE"
            echo "监控日志已保存到: $LOG_FILE"
            exit 0
            ;;
        "")
            # 默认完整监控
            check_system_info
            check_system_resources
            check_network
            check_services
            check_app_health
            check_ssl_certificate
            check_disk_space
            generate_summary
            ;;
        *)
            echo "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"