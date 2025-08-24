# Cloudflare Workers 部署指南

## 快速部署步骤

### 1. 获取 Cloudflare API Token

1. 访问 [Cloudflare API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 "Create Token"
3. 选择 "Custom token" 模板
4. 设置权限：
   - **Account**: `Read`
   - **Cloudflare Workers**: `Edit`
   - **D1**: `Edit`
   - **Zone**: `Read` (如果需要绑定域名)
5. 创建 token 并复制

### 2. 设置环境变量并部署

```bash
# 设置API token
export CLOUDFLARE_API_TOKEN=你的token

# 运行部署脚本
./deploy.sh
```

### 3. 或者手动部署

```bash
# 设置token后直接部署
export CLOUDFLARE_API_TOKEN=你的token
npx wrangler deploy --env=""
```

## 验证部署成功

部署成功后，你可以访问：
- **生产环境**: https://personasset.dickwin2003.workers.dev

## 测试资产删除功能

1. 打开部署的网址
2. 进入"资产"页面
3. 添加一个测试资产
4. 点击删除按钮测试删除功能

## 常见问题

### 认证失败
- 确保API token权限设置正确
- 检查token是否过期

### 部署失败
- 检查 `wrangler.toml` 配置
- 确保D1数据库已创建: `personasset`

### 资产删除仍然失败
- 检查浏览器控制台错误信息
- 确认数据库连接正常