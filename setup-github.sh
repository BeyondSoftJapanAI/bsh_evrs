#!/bin/bash

# GitHub 仓库设置脚本
# 请按照以下步骤执行：

echo "=== BSH Event Registration System - GitHub 设置 ==="
echo ""
echo "步骤 1: 登录 GitHub CLI"
echo "请运行: gh auth login"
echo "选择 GitHub.com，然后按照提示完成登录"
echo ""
echo "步骤 2: 创建 GitHub 仓库"
echo "请运行: gh repo create bsh-evrs --public --description 'BSH Event Registration System'"
echo ""
echo "步骤 3: 添加远程仓库"
echo "请运行: git remote add origin https://github.com/YOUR_USERNAME/bsh-evrs.git"
echo "(请将 YOUR_USERNAME 替换为您的 GitHub 用户名)"
echo ""
echo "步骤 4: 推送代码到 GitHub"
echo "请运行: git push -u origin master"
echo ""
echo "完成后，您的项目将在 GitHub 上可见！"