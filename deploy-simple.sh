#!/bin/bash

# 简单部署脚本 - 需要预先设置CLOUDFLARE_API_TOKEN
set -e

echo "🚀 开始部署个人资产管理系统到Cloudflare Workers..."

# 检查是否设置了API Token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ 请先设置 CLOUDFLARE_API_TOKEN 环境变量"
    echo "使用方法:"
    echo "1. 访问 https://dash.cloudflare.com/profile/api-tokens"
    echo "2. 创建 API Token:"
    echo "   - Account: Read"
    echo "   - Cloudflare Workers: Edit"
    echo "   - D1: Edit"
    echo "3. 运行: export CLOUDFLARE_API_TOKEN=你的token"
    echo "4. 然后运行: ./deploy-simple.sh"
    exit 1
fi

# 部署
echo "📦 正在部署..."
npx wrangler deploy --env=""

echo "✅ 部署完成！"
echo "🔗 应用地址: https://personasset.dickwin2003.workers.dev"
echo ""
echo "测试删除功能:"
echo "1. 打开上面的链接"
echo "2. 进入'资产'页面"
echo "3. 添加一个测试资产"
echo "4. 点击删除按钮测试"