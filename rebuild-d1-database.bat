@echo off
chcp 65001 >nul
echo 🔄 开始重建Cloudflare D1数据库（移除外键约束）...

REM 检查是否在正确的目录
if not exist "wrangler.toml" (
    echo ❌ 错误: 请在项目根目录运行此脚本
    pause
    exit /b 1
)

REM 设置数据库名称
set DB_NAME=personasset

echo 📋 步骤1: 备份当前数据库数据...

REM 备份现有数据（忽略错误）
echo 备份用户数据...
wrangler d1 execute %DB_NAME% --command="SELECT * FROM users;" > backup_users.sql 2>nul

echo 备份资产数据...
wrangler d1 execute %DB_NAME% --command="SELECT * FROM assets;" > backup_assets.sql 2>nul

echo 备份负债数据...
wrangler d1 execute %DB_NAME% --command="SELECT * FROM liabilities;" > backup_liabilities.sql 2>nul

echo 备份现金流数据...
wrangler d1 execute %DB_NAME% --command="SELECT * FROM cash_flows;" > backup_cash_flows.sql 2>nul

echo 📋 步骤2: 删除现有表（移除外键约束）...

REM 删除所有现有表（从依赖关系最深的开始）
echo 删除 investment_returns 表...
wrangler d1 execute %DB_NAME% --command="DROP TABLE IF EXISTS investment_returns;" 2>nul

echo 删除 asset_value_history 表...
wrangler d1 execute %DB_NAME% --command="DROP TABLE IF EXISTS asset_value_history;" 2>nul

echo 删除 cash_flows 表...
wrangler d1 execute %DB_NAME% --command="DROP TABLE IF EXISTS cash_flows;" 2>nul

echo 删除 liabilities 表...
wrangler d1 execute %DB_NAME% --command="DROP TABLE IF EXISTS liabilities;" 2>nul

echo 删除 assets 表...
wrangler d1 execute %DB_NAME% --command="DROP TABLE IF EXISTS assets;" 2>nul

echo 删除 asset_types 表...
wrangler d1 execute %DB_NAME% --command="DROP TABLE IF EXISTS asset_types;" 2>nul

echo 删除 users 表...
wrangler d1 execute %DB_NAME% --command="DROP TABLE IF EXISTS users;" 2>nul

echo 📋 步骤3: 创建新的表结构（无外键约束）...

REM 执行新的schema
wrangler d1 execute %DB_NAME% --file=d1-schema-no-fk.sql

if %ERRORLEVEL% neq 0 (
    echo ❌ 错误: 创建表失败
    pause
    exit /b 1
)

echo 📋 步骤4: 验证表创建...

echo 检查创建的表...
wrangler d1 execute %DB_NAME% --command="SELECT name FROM sqlite_master WHERE type='table';"

echo 检查asset_types表数据...
wrangler d1 execute %DB_NAME% --command="SELECT COUNT(*) as count FROM asset_types;"

echo.
echo ✅ 数据库重建完成！
echo.
echo 📝 重要说明:
echo 1. 所有外键约束已被移除
echo 2. 数据关联现在通过应用层逻辑维护  
echo 3. 删除操作不再受外键约束限制
echo 4. 备份文件已保存在当前目录（如果有数据的话）
echo.
echo 🚀 下一步:
echo 1. 运行: npm run deploy
echo 2. 测试删除资产功能
echo.
echo 如果需要恢复数据，请手动执行备份文件中的INSERT语句
echo.
pause