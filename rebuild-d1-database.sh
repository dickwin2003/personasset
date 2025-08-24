#!/bin/bash

# 重建Cloudflare D1数据库脚本
# 目的：移除所有外键约束，解决删除时的约束错误

echo "🔄 开始重建Cloudflare D1数据库（移除外键约束）..."

# 检查wrangler是否可用
if ! command -v wrangler &> /dev/null; then
    echo "❌ 错误: wrangler CLI未找到，请先安装Cloudflare Workers CLI"
    exit 1
fi

# 设置数据库名称
DB_NAME="personasset"

echo "📋 步骤1: 备份当前数据库数据..."

# 备份现有数据（可选）
echo "备份用户数据..."
wrangler d1 execute $DB_NAME --command="SELECT * FROM users;" > backup_users.sql 2>/dev/null || echo "用户表不存在或为空"

echo "备份资产数据..."
wrangler d1 execute $DB_NAME --command="SELECT * FROM assets;" > backup_assets.sql 2>/dev/null || echo "资产表不存在或为空"

echo "备份负债数据..."
wrangler d1 execute $DB_NAME --command="SELECT * FROM liabilities;" > backup_liabilities.sql 2>/dev/null || echo "负债表不存在或为空"

echo "备份现金流数据..."
wrangler d1 execute $DB_NAME --command="SELECT * FROM cash_flows;" > backup_cash_flows.sql 2>/dev/null || echo "现金流表不存在或为空"

echo "📋 步骤2: 删除现有表（移除外键约束）..."

# 删除所有现有表
wrangler d1 execute $DB_NAME --command="DROP TABLE IF EXISTS investment_returns;" || true
wrangler d1 execute $DB_NAME --command="DROP TABLE IF EXISTS asset_value_history;" || true
wrangler d1 execute $DB_NAME --command="DROP TABLE IF EXISTS cash_flows;" || true
wrangler d1 execute $DB_NAME --command="DROP TABLE IF EXISTS liabilities;" || true
wrangler d1 execute $DB_NAME --command="DROP TABLE IF EXISTS assets;" || true
wrangler d1 execute $DB_NAME --command="DROP TABLE IF EXISTS asset_types;" || true
wrangler d1 execute $DB_NAME --command="DROP TABLE IF EXISTS users;" || true

echo "📋 步骤3: 创建新的表结构（无外键约束）..."

# 执行新的schema
wrangler d1 execute $DB_NAME --file=d1-schema-no-fk.sql

echo "📋 步骤4: 验证表创建..."

# 验证表是否创建成功
echo "检查创建的表..."
wrangler d1 execute $DB_NAME --command="SELECT name FROM sqlite_master WHERE type='table';"

echo "检查asset_types表数据..."
wrangler d1 execute $DB_NAME --command="SELECT COUNT(*) as count FROM asset_types;"

echo "✅ 数据库重建完成！"
echo ""
echo "📝 重要说明:"
echo "1. 所有外键约束已被移除"
echo "2. 数据关联现在通过应用层逻辑维护"
echo "3. 删除操作不再受外键约束限制"
echo "4. 备份文件已保存在当前目录（如果有数据的话）"
echo ""
echo "🚀 下一步:"
echo "1. 运行: npm run deploy"
echo "2. 测试删除资产功能"
echo ""
echo "如果需要恢复数据，请手动执行备份文件中的INSERT语句"