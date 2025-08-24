# 个人投资组合系统

一个基于Cloudflare Workers和D1数据库的个人资产管理系统，支持资产追踪、负债管理、现金流分析等功能。

## ✨ 功能特性

### 🏦 资产管理
- **多类型资产**：支持固定资产（房产）、流动资产（股票、基金、存款）、消费品（汽车、电子设备）
- **自动折旧**：消费品支持年折旧率设置和自动计算
- **价值跟踪**：记录资产价值变化历史，生成趋势图表
- **预期收益**：设置和跟踪投资预期收益率

### 💳 负债管理
- **多种负债类型**：房贷、车贷、信用卡、其他负债
- **还款跟踪**：记录月还款金额和剩余金额
- **利率计算**：支持利率设置和计算

### 💰 现金流管理
- **收入记录**：工资、奖金、租金收入、投资收益等
- **支出记录**：住房、餐饮、交通、娱乐等各类支出
- **月度分析**：收支平衡分析和现金流趋势
- **频率设置**：支持一次性、每日、每周、每月等频率

### 📈 数据分析
- **仪表板概览**：总资产、总负债、净资产统计
- **收益分析**：资产收益率计算和对比
- **月度统计**：收入支出月度趋势分析
- **图表展示**：使用Chart.js进行数据可视化

### 👥 多用户支持
- **用户识别**：基于IP地址和User-Agent自动识别用户
- **数据隔离**：每个用户的数据完全隔离
- **密码保护**：支持用户设置密码（可选）

## 🛠️ 技术栈

### 后端
- **Cloudflare Workers**：无服务器计算平台
- **Cloudflare D1数据库**：基于SQLite的全球分布式数据库
- **itty-router**：轻量级路由库

### 前端
- **Tailwind CSS**：实用优先的CSS框架
- **Chart.js**：数据可视化图表库
- **Font Awesome**：图标库
- **Vanilla JavaScript**：原生JavaScript，无框架依赖

## 📦 部署指南

### 1. 环境准备

```bash
# 安装Wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler login
```

### 2. D1数据库配置

本项目使用Cloudflare D1数据库，无需额外配置。D1是Cloudflare提供的全球分布式 SQLite 数据库。

### 3. 初始化数据库

数据库表结构和测试数据已在部署过程中自动创建。如需重新初始化：

```bash
# 重建数据库结构（无外键约束）
wrangler d1 execute personasset --file=d1-schema-no-fk.sql

# 导入测试数据
wrangler d1 execute personasset --file=test-data.sql
```

### 4. 部署到Cloudflare Workers

```bash
# 使用npm脚本部署
npm run deploy

# 或者手动部署
npx wrangler deploy --compatibility-date=2024-01-01
```

## 📁 项目结构

```
personasset/
├── src/
│   ├── worker.js              # Cloudflare Workers主文件
│   ├── js/
│   │   ├── api.js            # API客户端
│   │   └── data.js           # 数据处理工具
│   └── css/
│       └── style.css         # 自定义样式
├── index.html                 # 前端主页面
├── d1-schema-no-fk.sql       # D1数据库架构（无外键约束）
├── test-data.sql             # 测试数据
├── wrangler.toml             # Cloudflare Workers配置
├── package.json              # 项目依赖和脚本
└── README.md                 # 项目文档
```

## 🔧 配置说明

### wrangler.toml
```toml
name = "personasset"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "personasset"
database_id = "your-d1-database-id"

[vars]
ENVIRONMENT = "production"
```

### D1数据库特性
- **全球分布**：数据在全球CDN边缘节点复制
- **无服务器**：无需管理数据库服务器
- **自动缩放**：根据请求量自动调整性能
- **SQLite兼容**：支持标准SQL语法

## 📊 数据库架构

### 主要表结构

- **users** - 用户信息表
- **asset_types** - 资产类型表
- **assets** - 资产表
- **liabilities** - 负债表
- **cash_flows** - 现金流表
- **asset_value_history** - 资产价值历史表
- **investment_returns** - 投资收益表

### 数据关联
```
users (1) -----> (n) asset_types
users (1) -----> (n) assets
users (1) -----> (n) liabilities
users (1) -----> (n) cash_flows
assets (1) -----> (n) asset_value_history
assets (1) -----> (n) investment_returns
```

### 特殊设计
- **无外键约束**：为了提高性能和简化操作，所有关联关系由应用层维护
- **索引优化**：关键字段建立索引以提高查询性能
- **用户隔离**：所有数据通过user_id字段实现用户间完全隔离

## 🌐 API 端点

### 用户管理
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/info` - 更新用户信息

### 资产管理
- `GET /api/assets` - 获取资产列表
- `POST /api/assets` - 创建资产
- `PUT /api/assets/:id` - 更新资产
- `DELETE /api/assets/:id` - 删除资产

### 资产类型管理
- `GET /api/asset-types` - 获取资产类型
- `POST /api/asset-types` - 创建资产类型

### 负债管理
- `GET /api/liabilities` - 获取负债列表
- `POST /api/liabilities` - 创建负债

### 现金流管理
- `GET /api/cash-flows` - 获取现金流列表
- `POST /api/cash-flows` - 创建现金流

### 数据分析
- `GET /api/dashboard/overview` - 仪表板概览
- `GET /api/analytics/monthly-income-expense` - 月度收支统计
- `GET /api/analytics/asset-returns` - 资产收益分析

## 🔒 安全特性

- **数据隔离**：基于用户ID的数据完全隔离
- **CORS配置**：正确配置跨域资源共享
- **参数化查询**：使用D1参数化查询防止注入攻击
- **输入验证**：前端和后端双重数据验证
- **无服务器安全**：Cloudflare Workers提供企业级安全保障

## 🚀 性能优化

- **全球CDN加速**：使用Cloudflare全球CDN和D1全球分布式数据库
- **边缘计算**：数据和计算在离用户最近的边缘节点执行
- **数据库索引**：关键字段建立索引优化查询
- **缓存策略**：合理使用浏览器缓存
- **无服务器架构**：零冷启动时间，自动缩放

## 📱 移动端支持

- **响应式设计**：使用Tailwind CSS实现完全响应式
- **触摸优化**：针对移动设备优化交互体验
- **PWA支持**：支持添加到主屏幕

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 GPL-3.0 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 🆘 支持

如果您遇到任何问题或有建议，请：

1. 查看 [Issues](https://github.com/your-username/personasset/issues)
2. 创建新的 Issue
3. 联系开发者

---

**⭐ 如果这个项目对您有帮助，请给个Star支持一下！**
