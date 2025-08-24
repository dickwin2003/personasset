#\!/bin/bash

# Cloudflare Workers 部署脚本
echo "开始部署到Cloudflare Workers..."

# 检查token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "请先设置 CLOUDFLARE_API_TOKEN 环境变量"
    echo "使用方法:"
    echo "1. 访问 https://dash.cloudflare.com/profile/api-tokens"
    echo "2. 创建 API Token，选择 'Custom token'"
    echo "3. 权限设置:"
    echo "   - Account: Read"
    echo "   - Cloudflare Workers: Edit"
    echo "   - D1: Edit"
    echo "4. 运行: export CLOUDFLARE_API_TOKEN=你的token"
    echo "5. 再次运行此脚本"
    exit 1
fi

# 部署应用
echo "正在部署应用..."
npx wrangler deploy --env=""

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "应用地址：https://personasset.dickwin2003.workers.dev"
else
    echo "❌ 部署失败，请检查错误信息"
fi
