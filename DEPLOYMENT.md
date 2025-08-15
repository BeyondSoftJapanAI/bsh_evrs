# BSH Event Registration System - 部署指南

## GitHub 仓库设置

### 1. 登录 GitHub CLI
```bash
gh auth login
```
选择 GitHub.com，然后按照提示完成登录。

### 2. 创建 GitHub 仓库
```bash
gh repo create bsh-evrs --public --description "BSH Event Registration System"
```

### 3. 添加远程仓库
```bash
git remote add origin https://github.com/YOUR_USERNAME/bsh-evrs.git
```
**注意：请将 `YOUR_USERNAME` 替换为您的 GitHub 用户名**

### 4. 更新 package.json
将 `package.json` 中的 homepage 字段更新为：
```json
"homepage": "https://YOUR_USERNAME.github.io/bsh-evrs"
```

### 5. 推送代码到 GitHub
```bash
git add .
git commit -m "Add GitHub Actions workflow and deployment config"
git push -u origin master
```

## GitHub Pages 部署设置

### 1. 启用 GitHub Pages
1. 访问您的 GitHub 仓库页面
2. 点击 "Settings" 选项卡
3. 在左侧菜单中找到 "Pages"
4. 在 "Source" 部分选择 "GitHub Actions"

### 2. 自动部署
- 每次推送到 `master` 或 `main` 分支时，GitHub Actions 会自动构建和部署应用
- 部署完成后，应用将在 `https://YOUR_USERNAME.github.io/bsh-evrs` 可访问

## 本地开发

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```
应用将在 http://localhost:3000 运行

### 构建生产版本
```bash
npm run build
```

## 版本管理工作流

### 日常开发
1. 创建功能分支：`git checkout -b feature/new-feature`
2. 开发和测试
3. 提交更改：`git commit -m "Add new feature"`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request
6. 合并到主分支后自动部署

### 发布新版本
1. 更新 `package.json` 中的版本号
2. 创建标签：`git tag v1.0.1`
3. 推送标签：`git push origin v1.0.1`

## 故障排除

### 部署失败
1. 检查 GitHub Actions 日志
2. 确保所有依赖都在 `package.json` 中正确声明
3. 验证构建脚本能在本地成功运行

### 页面无法访问
1. 确认 GitHub Pages 已启用
2. 检查 `homepage` 字段是否正确
3. 等待几分钟让部署生效

## 自定义域名（可选）

如果您有自定义域名：
1. 在仓库根目录创建 `CNAME` 文件
2. 在文件中添加您的域名
3. 在 `.github/workflows/deploy.yml` 中取消注释 `cname` 行并添加您的域名
4. 在域名提供商处配置 DNS 记录