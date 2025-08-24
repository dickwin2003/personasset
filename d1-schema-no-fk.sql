-- 个人资产投资组合系统 - Cloudflare D1数据库架构
-- 重建版本：移除所有外键约束以避免删除时的约束错误
-- 数据库类型：SQLite (Cloudflare D1)

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL DEFAULT '投资者',
    phone TEXT,
    email TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 资产类型表（无外键约束）
CREATE TABLE IF NOT EXISTS asset_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,  -- 不再是外键
    name TEXT NOT NULL,
    category TEXT NOT NULL,  -- 'fixed', 'liquid', 'consumer'
    description TEXT,
    has_depreciation INTEGER DEFAULT 0,  -- SQLite使用INTEGER代替BOOLEAN
    depreciation_rate REAL DEFAULT 0.00,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 资产表（无外键约束）
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,  -- 不再是外键
    asset_type_id INTEGER,  -- 不再是外键
    name TEXT NOT NULL,
    current_value REAL NOT NULL DEFAULT 0,
    purchase_value REAL,
    purchase_date TEXT,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 负债表（无外键约束）
CREATE TABLE IF NOT EXISTS liabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,  -- 不再是外键
    name TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    interest_rate REAL,
    monthly_payment REAL,
    remaining_months INTEGER,
    remaining_amount REAL,  -- 添加剩余金额字段
    start_date TEXT,
    end_date TEXT,
    liability_type TEXT DEFAULT 'other',  -- 'mortgage', 'car_loan', 'credit_card', 'other'
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 资金流表（无外键约束）
CREATE TABLE IF NOT EXISTS cash_flows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,  -- 不再是外键
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    description TEXT,
    frequency TEXT DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    start_date TEXT,
    end_date TEXT,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 资产价值历史表（无外键约束）
CREATE TABLE IF NOT EXISTS asset_value_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,  -- 不再是外键
    asset_id INTEGER,  -- 不再是外键，只是关联字段
    value REAL NOT NULL DEFAULT 0,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 投资收益表（无外键约束）
CREATE TABLE IF NOT EXISTS investment_returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,  -- 不再是外键
    asset_id INTEGER,  -- 不再是外键，只是关联字段
    return_amount REAL NOT NULL DEFAULT 0,
    return_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 创建索引以提高查询性能（保留索引但移除外键约束）
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_types_user_id ON asset_types(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_types_category ON asset_types(category);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type_id ON assets(asset_type_id);
CREATE INDEX IF NOT EXISTS idx_assets_purchase_date ON assets(purchase_date);
CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_liability_type ON liabilities(liability_type);
CREATE INDEX IF NOT EXISTS idx_cash_flows_user_id ON cash_flows(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_flows_type ON cash_flows(type);
CREATE INDEX IF NOT EXISTS idx_cash_flows_date ON cash_flows(date);
CREATE INDEX IF NOT EXISTS idx_cash_flows_category ON cash_flows(category);
CREATE INDEX IF NOT EXISTS idx_asset_value_history_user_id ON asset_value_history(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_value_history_asset_id ON asset_value_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_value_history_date ON asset_value_history(date);
CREATE INDEX IF NOT EXISTS idx_investment_returns_user_id ON investment_returns(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_returns_asset_id ON investment_returns(asset_id);
CREATE INDEX IF NOT EXISTS idx_investment_returns_return_date ON investment_returns(return_date);

-- 插入默认资产类型数据
INSERT OR IGNORE INTO asset_types (id, name, category, description, has_depreciation, depreciation_rate) VALUES
(1, '现金', 'liquid', '现金及现金等价物', 0, 0.00),
(2, '股票', 'liquid', '上市公司股票投资', 0, 0.00),
(3, '房产', 'fixed', '住宅、商业地产等不动产', 0, 0.00),
(4, '基金', 'liquid', '各类投资基金', 0, 0.00),
(5, '债券', 'liquid', '国债、企业债等', 0, 0.00),
(6, '汽车', 'consumer', '私家车等交通工具', 1, 15.00),
(7, '电子设备', 'consumer', '电脑、手机等电子产品', 1, 25.00),
(8, '家具家电', 'consumer', '家具、家用电器', 1, 10.00),
(9, '贵金属', 'fixed', '黄金、白银等贵金属', 0, 0.00),
(10, '其他', 'fixed', '其他类型资产', 0, 0.00);