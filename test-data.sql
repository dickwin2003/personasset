-- 个人资产管理系统 - 测试数据
-- 为D1数据库添加真实的测试数据

-- 插入测试用户
INSERT OR REPLACE INTO users (user_id, username, phone, email, created_at, updated_at) VALUES
('5e1e6ddd87e6e560', '投资者张三', '13800138000', 'zhangsan@example.com', datetime('now'), datetime('now')),
('test123', '测试用户', '13900139000', 'test@example.com', datetime('now'), datetime('now'));

-- 插入测试资产数据
INSERT OR REPLACE INTO assets (id, user_id, asset_type_id, name, current_value, purchase_value, purchase_date, description, created_at, updated_at) VALUES
-- 现金类资产
(1, '5e1e6ddd87e6e560', 1, '招商银行储蓄卡', 150000, 150000, '2024-01-01', '主要储蓄账户', datetime('now', '-6 months'), datetime('now')),
(2, '5e1e6ddd87e6e560', 1, '支付宝余额宝', 85000, 85000, '2024-01-01', '日常支付账户', datetime('now', '-6 months'), datetime('now')),
(3, '5e1e6ddd87e6e560', 1, '微信零钱通', 45000, 45000, '2024-02-01', '小额理财', datetime('now', '-5 months'), datetime('now')),

-- 股票投资
(4, '5e1e6ddd87e6e560', 2, '中国平安', 280000, 250000, '2024-02-15', '保险行业龙头股', datetime('now', '-5 months'), datetime('now')),
(5, '5e1e6ddd87e6e560', 2, '贵州茅台', 320000, 300000, '2024-03-01', '白酒行业领军企业', datetime('now', '-4 months'), datetime('now')),
(6, '5e1e6ddd87e6e560', 2, '腾讯控股', 250000, 280000, '2024-03-15', '港股科技龙头', datetime('now', '-4 months'), datetime('now')),

-- 房产投资
(7, '5e1e6ddd87e6e560', 3, '上海浦东公寓', 800000, 600000, '2023-06-01', '70平米，2室1厅，自住', datetime('now', '-12 months'), datetime('now')),

-- 基金投资
(8, '5e1e6ddd87e6e560', 4, '易方达沪深300ETF', 120000, 100000, '2024-01-15', '指数基金定投', datetime('now', '-6 months'), datetime('now')),
(9, '5e1e6ddd87e6e560', 4, '华夏科技成长混合', 92000, 80000, '2024-02-01', '科技主题基金', datetime('now', '-5 months'), datetime('now')),

-- 其他资产
(10, '5e1e6ddd87e6e560', 6, '本田雅阁', 180000, 220000, '2022-05-01', '2022款，2.0L自动挡', datetime('now', '-18 months'), datetime('now'));

-- 插入测试负债数据
INSERT OR REPLACE INTO liabilities (id, user_id, name, amount, remaining_amount, interest_rate, monthly_payment, remaining_months, liability_type, description, start_date, created_at, updated_at) VALUES
(1, '5e1e6ddd87e6e560', '房屋按揭贷款', 500000, 350000, 4.5, 8500, 180, 'mortgage', '上海公寓30年期房贷', '2023-06-01', datetime('now', '-12 months'), datetime('now')),
(2, '5e1e6ddd87e6e560', '招商银行信用卡', 120000, 85000, 18.0, 2000, null, 'credit_card', '日常消费信用卡', '2023-01-01', datetime('now', '-18 months'), datetime('now')),
(3, '5e1e6ddd87e6e560', '车辆贷款', 80000, 25000, 6.5, 1500, 18, 'car_loan', '本田雅阁汽车贷款', '2022-05-01', datetime('now', '-24 months'), datetime('now'));

-- 插入测试现金流数据（近6个月的记录）
INSERT OR REPLACE INTO cash_flows (id, user_id, type, category, amount, description, frequency, date, created_at, updated_at) VALUES
-- 收入记录
(1, '5e1e6ddd87e6e560', 'income', '工资', 16000, '月薪收入', 'monthly', date('now', '-5 months'), datetime('now', '-5 months'), datetime('now')),
(2, '5e1e6ddd87e6e560', 'income', '工资', 16000, '月薪收入', 'monthly', date('now', '-4 months'), datetime('now', '-4 months'), datetime('now')),
(3, '5e1e6ddd87e6e560', 'income', '工资', 16000, '月薪收入', 'monthly', date('now', '-3 months'), datetime('now', '-3 months'), datetime('now')),
(4, '5e1e6ddd87e6e560', 'income', '工资', 16000, '月薪收入', 'monthly', date('now', '-2 months'), datetime('now', '-2 months'), datetime('now')),
(5, '5e1e6ddd87e6e560', 'income', '工资', 16000, '月薪收入', 'monthly', date('now', '-1 month'), datetime('now', '-1 month'), datetime('now')),
(6, '5e1e6ddd87e6e560', 'income', '工资', 16000, '月薪收入', 'monthly', date('now'), datetime('now'), datetime('now')),

(7, '5e1e6ddd87e6e560', 'income', '股票红利', 5000, '贵州茅台分红', 'once', date('now', '-2 months'), datetime('now', '-2 months'), datetime('now')),
(8, '5e1e6ddd87e6e560', 'income', '基金收益', 3000, '基金定投收益', 'once', date('now', '-1 month'), datetime('now', '-1 month'), datetime('now')),

-- 支出记录
(9, '5e1e6ddd87e6e560', 'expense', '房贷', 8500, '按揭还款', 'monthly', date('now', '-5 months'), datetime('now', '-5 months'), datetime('now')),
(10, '5e1e6ddd87e6e560', 'expense', '房贷', 8500, '按揭还款', 'monthly', date('now', '-4 months'), datetime('now', '-4 months'), datetime('now')),
(11, '5e1e6ddd87e6e560', 'expense', '房贷', 8500, '按揭还款', 'monthly', date('now', '-3 months'), datetime('now', '-3 months'), datetime('now')),
(12, '5e1e6ddd87e6e560', 'expense', '房贷', 8500, '按揭还款', 'monthly', date('now', '-2 months'), datetime('now', '-2 months'), datetime('now')),
(13, '5e1e6ddd87e6e560', 'expense', '房贷', 8500, '按揭还款', 'monthly', date('now', '-1 month'), datetime('now', '-1 month'), datetime('now')),
(14, '5e1e6ddd87e6e560', 'expense', '房贷', 8500, '按揭还款', 'monthly', date('now'), datetime('now'), datetime('now')),

(15, '5e1e6ddd87e6e560', 'expense', '生活费', 3200, '日常生活开销', 'monthly', date('now', '-5 months'), datetime('now', '-5 months'), datetime('now')),
(16, '5e1e6ddd87e6e560', 'expense', '生活费', 3200, '日常生活开销', 'monthly', date('now', '-4 months'), datetime('now', '-4 months'), datetime('now')),
(17, '5e1e6ddd87e6e560', 'expense', '生活费', 3200, '日常生活开销', 'monthly', date('now', '-3 months'), datetime('now', '-3 months'), datetime('now')),
(18, '5e1e6ddd87e6e560', 'expense', '生活费', 3200, '日常生活开销', 'monthly', date('now', '-2 months'), datetime('now', '-2 months'), datetime('now')),
(19, '5e1e6ddd87e6e560', 'expense', '生活费', 3200, '日常生活开销', 'monthly', date('now', '-1 month'), datetime('now', '-1 month'), datetime('now')),
(20, '5e1e6ddd87e6e560', 'expense', '生活费', 3200, '日常生活开销', 'monthly', date('now'), datetime('now'), datetime('now')),

(21, '5e1e6ddd87e6e560', 'expense', '车贷', 1500, '汽车贷款还款', 'monthly', date('now', '-5 months'), datetime('now', '-5 months'), datetime('now')),
(22, '5e1e6ddd87e6e560', 'expense', '车贷', 1500, '汽车贷款还款', 'monthly', date('now', '-4 months'), datetime('now', '-4 months'), datetime('now')),
(23, '5e1e6ddd87e6e560', 'expense', '车贷', 1500, '汽车贷款还款', 'monthly', date('now', '-3 months'), datetime('now', '-3 months'), datetime('now')),
(24, '5e1e6ddd87e6e560', 'expense', '车贷', 1500, '汽车贷款还款', 'monthly', date('now', '-2 months'), datetime('now', '-2 months'), datetime('now')),
(25, '5e1e6ddd87e6e560', 'expense', '车贷', 1500, '汽车贷款还款', 'monthly', date('now', '-1 month'), datetime('now', '-1 month'), datetime('now')),
(26, '5e1e6ddd87e6e560', 'expense', '车贷', 1500, '汽车贷款还款', 'monthly', date('now'), datetime('now'), datetime('now')),

(27, '5e1e6ddd87e6e560', 'expense', '信用卡', 2000, '信用卡还款', 'monthly', date('now', '-5 months'), datetime('now', '-5 months'), datetime('now')),
(28, '5e1e6ddd87e6e560', 'expense', '信用卡', 2000, '信用卡还款', 'monthly', date('now', '-4 months'), datetime('now', '-4 months'), datetime('now')),
(29, '5e1e6ddd87e6e560', 'expense', '信用卡', 2000, '信用卡还款', 'monthly', date('now', '-3 months'), datetime('now', '-3 months'), datetime('now')),
(30, '5e1e6ddd87e6e560', 'expense', '信用卡', 2000, '信用卡还款', 'monthly', date('now', '-2 months'), datetime('now', '-2 months'), datetime('now')),
(31, '5e1e6ddd87e6e560', 'expense', '信用卡', 2000, '信用卡还款', 'monthly', date('now', '-1 month'), datetime('now', '-1 month'), datetime('now')),
(32, '5e1e6ddd87e6e560', 'expense', '信用卡', 2000, '信用卡还款', 'monthly', date('now'), datetime('now'), datetime('now')),

-- 其他支出
(33, '5e1e6ddd87e6e560', 'expense', '保险', 1200, '人寿保险费', 'quarterly', date('now', '-3 months'), datetime('now', '-3 months'), datetime('now')),
(34, '5e1e6ddd87e6e560', 'expense', '保险', 1200, '人寿保险费', 'quarterly', date('now'), datetime('now'), datetime('now')),
(35, '5e1e6ddd87e6e560', 'expense', '投资', 5000, '基金定投', 'monthly', date('now', '-5 months'), datetime('now', '-5 months'), datetime('now')),
(36, '5e1e6ddd87e6e560', 'expense', '投资', 5000, '基金定投', 'monthly', date('now', '-4 months'), datetime('now', '-4 months'), datetime('now')),
(37, '5e1e6ddd87e6e560', 'expense', '投资', 5000, '基金定投', 'monthly', date('now', '-3 months'), datetime('now', '-3 months'), datetime('now')),
(38, '5e1e6ddd87e6e560', 'expense', '投资', 5000, '基金定投', 'monthly', date('now', '-2 months'), datetime('now', '-2 months'), datetime('now')),
(39, '5e1e6ddd87e6e560', 'expense', '投资', 5000, '基金定投', 'monthly', date('now', '-1 month'), datetime('now', '-1 month'), datetime('now')),
(40, '5e1e6ddd87e6e560', 'expense', '投资', 5000, '基金定投', 'monthly', date('now'), datetime('now'), datetime('now'));

-- 插入一些资产价值历史记录
INSERT OR REPLACE INTO asset_value_history (id, user_id, asset_id, value, date, created_at) VALUES
-- 股票价值变化
(1, '5e1e6ddd87e6e560', 4, 250000, date('now', '-5 months'), datetime('now', '-5 months')),
(2, '5e1e6ddd87e6e560', 4, 265000, date('now', '-4 months'), datetime('now', '-4 months')),
(3, '5e1e6ddd87e6e560', 4, 270000, date('now', '-3 months'), datetime('now', '-3 months')),
(4, '5e1e6ddd87e6e560', 4, 275000, date('now', '-2 months'), datetime('now', '-2 months')),
(5, '5e1e6ddd87e6e560', 4, 280000, date('now', '-1 month'), datetime('now', '-1 month')),

(6, '5e1e6ddd87e6e560', 5, 300000, date('now', '-4 months'), datetime('now', '-4 months')),
(7, '5e1e6ddd87e6e560', 5, 310000, date('now', '-3 months'), datetime('now', '-3 months')),
(8, '5e1e6ddd87e6e560', 5, 315000, date('now', '-2 months'), datetime('now', '-2 months')),
(9, '5e1e6ddd87e6e560', 5, 320000, date('now', '-1 month'), datetime('now', '-1 month')),

-- 基金价值变化  
(10, '5e1e6ddd87e6e560', 8, 100000, date('now', '-6 months'), datetime('now', '-6 months')),
(11, '5e1e6ddd87e6e560', 8, 105000, date('now', '-5 months'), datetime('now', '-5 months')),
(12, '5e1e6ddd87e6e560', 8, 110000, date('now', '-4 months'), datetime('now', '-4 months')),
(13, '5e1e6ddd87e6e560', 8, 115000, date('now', '-3 months'), datetime('now', '-3 months')),
(14, '5e1e6ddd87e6e560', 8, 118000, date('now', '-2 months'), datetime('now', '-2 months')),
(15, '5e1e6ddd87e6e560', 8, 120000, date('now', '-1 month'), datetime('now', '-1 month'));

-- 插入投资收益记录
INSERT OR REPLACE INTO investment_returns (id, user_id, asset_id, return_amount, return_date, notes, created_at) VALUES
(1, '5e1e6ddd87e6e560', 4, 3000, date('now', '-3 months'), '中国平安现金分红', datetime('now', '-3 months')),
(2, '5e1e6ddd87e6e560', 5, 5000, date('now', '-2 months'), '贵州茅台年度分红', datetime('now', '-2 months')),
(3, '5e1e6ddd87e6e560', 8, 2000, date('now', '-1 month'), '易方达基金分红', datetime('now', '-1 month')),
(4, '5e1e6ddd87e6e560', 9, 1500, date('now', '-1 month'), '华夏基金收益分配', datetime('now', '-1 month'));