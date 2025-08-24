import { Router } from 'itty-router';

const router = Router();

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
};

// D1 database query function
async function executeQuery(env, query, params = []) {
    try {
        console.log('D1 query:', query, 'params:', params);
        
        const stmt = env.DB.prepare(query);
        let result;
        
        if (query.trim().toUpperCase().startsWith('SELECT')) {
            if (params.length > 0) {
                result = await stmt.bind(...params).all();
            } else {
                result = await stmt.all();
            }
            return result.results || [];
        } else {
            // INSERT, UPDATE, DELETE
            if (params.length > 0) {
                result = await stmt.bind(...params).run();
            } else {
                result = await stmt.run();
            }
            return {
                success: result.success,
                meta: result.meta,
                changes: result.changes,
                last_row_id: result.meta?.last_row_id
            };
        }
    } catch (error) {
        console.error('D1 Database error:', error);
        throw new Error('Database query failed: ' + error.message);
    }
}

// Generate user ID - Fixed for testing
async function getUserId(request) {
    // 固定返回有数据的用户ID用于测试
    return '5e1e6ddd87e6e560';
}

// OPTIONS handler
router.options('*', () => new Response(null, { headers: corsHeaders }));

// Debug API to check user ID
router.get('/api/debug/user-id', async (request) => {
    try {
        const userId = await getUserId(request);
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        const userAgent = request.headers.get('User-Agent') || 'unknown';
        return Response.json({
            user_id: userId,
            client_ip: clientIP,
            user_agent: userAgent,
            user_string: `${clientIP}-${userAgent}`
        }, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

// API endpoints
router.get('/api/user/info', async (request) => {
    try {
        const userId = await getUserId(request);
        const users = await executeQuery(request.env, 'SELECT * FROM users WHERE user_id = ?', [userId]);
        return Response.json(users[0] || { user_id: userId, username: '投资者' }, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.put('/api/user/info', async (request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();
        
        // 检查用户是否存在
        const existingUsers = await executeQuery(request.env, 'SELECT * FROM users WHERE user_id = ?', [userId]);
        
        if (existingUsers.length > 0) {
            // 更新现有用户
            await executeQuery(request.env, 
                'UPDATE users SET username = ?, phone = ?, email = ?, updated_at = datetime("now") WHERE user_id = ?',
                [data.username || existingUsers[0].username, data.phone || existingUsers[0].phone, data.email || existingUsers[0].email, userId]
            );
        } else {
            // 创建新用户
            await executeQuery(request.env,
                'INSERT INTO users (user_id, username, phone, email, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))',
                [userId, data.username || '投资者', data.phone || '', data.email || '']
            );
        }
        
        return Response.json({ success: true, message: '用户信息更新成功' }, { headers: corsHeaders });
    } catch (error) {
        console.error('Update user info error:', error);
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.get('/api/dashboard/overview', async (request) => {
    try {
        const userId = await getUserId(request);
        
        // 获取资产总计
        const assetsResult = await executeQuery(request.env, 
            'SELECT COUNT(*) as count, COALESCE(SUM(current_value), 0) as total_value FROM assets WHERE user_id = ?', 
            [userId]
        );
        const totalAssets = assetsResult[0]?.total_value || 0;
        const assetCount = assetsResult[0]?.count || 0;
        
        // 获取负债总计
        const liabilitiesResult = await executeQuery(request.env, 
            'SELECT COUNT(*) as count, COALESCE(SUM(remaining_amount), 0) as total_balance FROM liabilities WHERE user_id = ?', 
            [userId]
        );
        const totalLiabilities = liabilitiesResult[0]?.total_balance || 0;
        const liabilityCount = liabilitiesResult[0]?.count || 0;
        
        // 获取资产分类统计
        const assetsByCategory = await executeQuery(request.env, 
            'SELECT at.name as category, COALESCE(SUM(a.current_value), 0) as total FROM assets a LEFT JOIN asset_types at ON a.asset_type_id = at.id WHERE a.user_id = ? GROUP BY at.name', 
            [userId]
        );
        
        const assetsGrouped = {};
        assetsByCategory.forEach(item => {
            if (item.category) {
                assetsGrouped[item.category] = item.total;
            }
        });
        
        // 获取近12个月现金流
        const monthlyFlow = await executeQuery(request.env, 
            'SELECT strftime("%Y-%m", date) as month, type, COALESCE(SUM(amount), 0) as total FROM cash_flows WHERE user_id = ? AND date >= date("now", "-12 months") GROUP BY strftime("%Y-%m", date), type ORDER BY month', 
            [userId]
        );
        
        const monthlyData = {};
        monthlyFlow.forEach(item => {
            if (!monthlyData[item.month]) {
                monthlyData[item.month] = { income: 0, expense: 0 };
            }
            if (item.type === 'income') {
                monthlyData[item.month].income = item.total;
            } else {
                monthlyData[item.month].expense = Math.abs(item.total);
            }
        });
        
        const monthlyCashFlow = Object.keys(monthlyData).map(month => ({
            month,
            income: monthlyData[month].income,
            expense: monthlyData[month].expense
        }));
        
        return Response.json({
            total_assets: totalAssets,
            total_liabilities: totalLiabilities,
            net_worth: totalAssets - totalLiabilities,
            asset_count: assetCount,
            liability_count: liabilityCount,
            assets_by_category: assetsGrouped,
            monthly_cash_flow: monthlyCashFlow
        }, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.get('/api/assets', async (request) => {
    try {
        const userId = await getUserId(request);
        const assets = await executeQuery(request.env, 
            'SELECT a.*, at.name as asset_type_name FROM assets a LEFT JOIN asset_types at ON a.asset_type_id = at.id WHERE a.user_id = ?', 
            [userId]
        );
        return Response.json(assets, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.post('/api/assets', async (request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();
        
        if (!data.name || isNaN(data.current_value)) {
            return Response.json({ error: '资产名称和当前价值不能为空' }, { status: 400, headers: corsHeaders });
        }
        
        const result = await executeQuery(request.env, 
            'INSERT INTO assets (name, description, current_value, asset_type_id, user_id, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
            [data.name, data.description || '', data.current_value, data.asset_type_id || 1, userId]
        );
        
        return Response.json({ 
            success: true, 
            id: result.last_row_id,
            message: '资产添加成功'
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('添加资产失败:', error);
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.put('/api/assets/:id', async (request) => {
    try {
        const userId = await getUserId(request);
        const { id } = request.params;
        const data = await request.json();
        
        // 只更新提供的字段
        await executeQuery(request.env, 
            'UPDATE assets SET name = ?, current_value = ?, description = ? WHERE id = ? AND user_id = ?',
            [data.name || '', data.current_value || 0, data.description || '', id, userId]
        );
        
        return Response.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.delete('/api/assets/:id', async (request) => {
    try {
        const userId = await getUserId(request);
        const { id } = request.params;
        
        // 采用更安全的删除策略，先删除所有可能的关联记录
        // 不依赖外键约束，手动清理关联数据
        
        // 1. 删除资产价值历史记录（使用 asset_id 字段）
        try {
            await executeQuery(request.env, 
                'DELETE FROM asset_value_history WHERE asset_id = ?',
                [id]
            );
            console.log('Deleted asset_value_history records for asset:', id);
        } catch (error) {
            console.log('asset_value_history table not found or no records:', error.message);
        }
        
        // 2. 删除投资收益记录（使用 asset_id 字段）
        try {
            await executeQuery(request.env, 
                'DELETE FROM investment_returns WHERE asset_id = ?',
                [id]
            );
            console.log('Deleted investment_returns records for asset:', id);
        } catch (error) {
            console.log('investment_returns table not found or no records:', error.message);
        }
        
        // 3. 删除任何其他可能的关联记录
        try {
            await executeQuery(request.env, 
                'DELETE FROM asset_transactions WHERE asset_id = ?',
                [id]
            );
            console.log('Deleted asset_transactions records for asset:', id);
        } catch (error) {
            console.log('asset_transactions table not found or no records:', error.message);
        }
        
        // 4. 最后删除主资产记录
        const result = await executeQuery(request.env, 
            'DELETE FROM assets WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        console.log('Asset deletion result:', result);
        
        return Response.json({ 
            success: true, 
            message: '资产删除成功',
            deleted_asset_id: id
        }, { headers: corsHeaders });
        
    } catch (error) {
        console.error('Delete asset error:', error);
        
        // 提供更详细的错误信息
        let errorMessage = '删除资产失败';
        if (error.message.includes('FOREIGN KEY constraint')) {
            errorMessage = '外键约束错误：请先删除相关的历史记录';
        } else if (error.message.includes('SQLITE_CONSTRAINT')) {
            errorMessage = '数据库约束错误：无法删除此资产';
        } else {
            errorMessage = error.message;
        }
        
        return Response.json({ 
            error: errorMessage,
            details: error.message,
            asset_id: request.params.id
        }, { 
            status: 500, 
            headers: corsHeaders 
        });
    }
});

router.get('/api/liabilities', async (request) => {
    try {
        const userId = await getUserId(request);
        const liabilities = await executeQuery(request.env, 'SELECT * FROM liabilities WHERE user_id = ?', [userId]);
        return Response.json(liabilities, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.post('/api/liabilities', async (request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();
        
        if (!data.name || isNaN(data.amount)) {
            return Response.json({ error: '负债名称和金额不能为空' }, { status: 400, headers: corsHeaders });
        }
        
        const result = await executeQuery(request.env, 
            'INSERT INTO liabilities (name, description, amount, monthly_payment, user_id, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
            [data.name, data.description || '', data.amount, data.monthly_payment || 0, userId]
        );
        
        return Response.json({ 
            success: true, 
            id: result.last_row_id,
            message: '负债添加成功'
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('添加负债失败:', error);
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.put('/api/liabilities/:id', async (request) => {
    try {
        const userId = await getUserId(request);
        const { id } = request.params;
        const data = await request.json();
        
        // 只更新提供的字段
        await executeQuery(request.env, 
            'UPDATE liabilities SET name = ?, amount = ?, monthly_payment = ?, description = ? WHERE id = ? AND user_id = ?',
            [data.name || '', data.amount || 0, data.monthly_payment || 0, data.description || '', id, userId]
        );
        
        return Response.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.delete('/api/liabilities/:id', async (request) => {
    try {
        const userId = await getUserId(request);
        const { id } = request.params;
        
        await executeQuery(request.env, 
            'DELETE FROM liabilities WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        return Response.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.get('/api/cash-flows', async (request) => {
    try {
        const userId = await getUserId(request);
        const cashFlows = await executeQuery(request.env, 'SELECT * FROM cash_flows WHERE user_id = ?', [userId]);
        return Response.json(cashFlows, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.delete('/api/cash-flows/:id', async (request) => {
    try {
        const userId = await getUserId(request);
        const { id } = request.params;
        await executeQuery(request.env, 'DELETE FROM cash_flows WHERE id = ? AND user_id = ?', [id, userId]);
        return Response.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.post('/api/cash-flows', async (request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();
        
        if (!data.description || isNaN(data.amount) || !data.date) {
            return Response.json({ error: '描述、金额和日期不能为空' }, { status: 400, headers: corsHeaders });
        }
        
        const result = await executeQuery(request.env, 
            'INSERT INTO cash_flows (type, amount, date, description, category, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
            [data.type || 'expense', data.amount, data.date, data.description || '', data.category || '', userId]
        );
        
        return Response.json({ 
            success: true, 
            id: result.last_row_id,
            message: '现金流记录添加成功'
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('添加现金流失败:', error);
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.put('/api/cash-flows/:id', async (request) => {
    try {
        const userId = await getUserId(request);
        const { id } = request.params;
        const data = await request.json();
        
        // 确保所有字段都有默认值
        await executeQuery(request.env, 
            'UPDATE cash_flows SET type = ?, amount = ?, date = ?, description = ?, category = ? WHERE id = ? AND user_id = ?',
            [data.type || 'expense', data.amount || 0, data.date || new Date().toISOString().split('T')[0], data.description || '', data.category || '', id, userId]
        );
        
        return Response.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.delete('/api/cash-flows/:id', async (request) => {
    try {
        const userId = await getUserId(request);
        const { id } = request.params;
        
        await executeQuery(request.env, 
            'DELETE FROM cash_flows WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        return Response.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.get('/api/asset-types', async (request) => {
    try {
        const userId = await getUserId(request);
        const assetTypes = await executeQuery(request.env, 'SELECT * FROM asset_types WHERE user_id = ? OR user_id IS NULL', [userId]);
        return Response.json(assetTypes, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

// Analytics API endpoints
router.get('/api/analytics/yearly-income-expense', async (request) => {
    try {
        const userId = await getUserId(request);
        const url = new URL(request.url);
        const year = url.searchParams.get('year') || new Date().getFullYear();
        
        // 获取年度收支统计
        const yearlyStats = await executeQuery(request.env, 
            'SELECT type, COALESCE(SUM(amount), 0) as total FROM cash_flows WHERE user_id = ? AND strftime("%Y", date) = ? GROUP BY type', 
            [userId, year.toString()]
        );
        
        let totalIncome = 0;
        let totalExpense = 0;
        
        yearlyStats.forEach(item => {
            if (item.type === 'income') {
                totalIncome = item.total;
            } else {
                totalExpense = Math.abs(item.total);
            }
        });
        
        return Response.json({
            year: parseInt(year),
            total_income: totalIncome,
            total_expense: totalExpense,
            net_income: totalIncome - totalExpense
        }, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.get('/api/analytics/monthly-income-expense', async (request) => {
    try {
        const userId = await getUserId(request);
        
        // 获取近12个月收支数据
        const monthlyStats = await executeQuery(request.env, 
            'SELECT strftime("%Y-%m", date) as month, type, COALESCE(SUM(amount), 0) as total FROM cash_flows WHERE user_id = ? AND date >= date("now", "-12 months") GROUP BY strftime("%Y-%m", date), type ORDER BY month', 
            [userId]
        );
        
        const monthlyData = {};
        monthlyStats.forEach(item => {
            if (!monthlyData[item.month]) {
                monthlyData[item.month] = { income: 0, expense: 0 };
            }
            if (item.type === 'income') {
                monthlyData[item.month].income = item.total;
            } else {
                monthlyData[item.month].expense = Math.abs(item.total);
            }
        });
        
        const result = Object.keys(monthlyData).map(month => ({
            month,
            income: monthlyData[month].income,
            expense: monthlyData[month].expense
        }));
        
        return Response.json(result, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.get('/api/analytics/balance-forecast', async (request) => {
    try {
        const userId = await getUserId(request);
        const currentYear = new Date().getFullYear();
        
        // 获取今年收支统计
        const yearlyStats = await executeQuery(request.env, 
            'SELECT type, COALESCE(SUM(amount), 0) as total FROM cash_flows WHERE user_id = ? AND strftime("%Y", date) = ? GROUP BY type', 
            [userId, currentYear.toString()]
        );
        
        let totalIncome = 0;
        let totalExpense = 0;
        
        yearlyStats.forEach(item => {
            if (item.type === 'income') {
                totalIncome = item.total;
            } else {
                totalExpense = Math.abs(item.total);
            }
        });
        
        const balance = totalIncome - totalExpense;
        
        return Response.json({
            current_year: currentYear,
            total_income: totalIncome,
            total_expense: totalExpense,
            balance: balance,
            status: balance > 0 ? 'surplus' : 'deficit'
        }, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

router.get('/api/analytics/asset-returns', async (request) => {
    try {
        const userId = await getUserId(request);
        
        // 获取资产收益统计
        const assets = await executeQuery(request.env, 
            'SELECT a.name, a.current_value, a.purchase_value, at.name as asset_type FROM assets a LEFT JOIN asset_types at ON a.asset_type_id = at.id WHERE a.user_id = ? AND a.purchase_value > 0', 
            [userId]
        );
        
        const assetReturns = assets.map(asset => {
            const returnAmount = asset.current_value - asset.purchase_value;
            const returnRate = (returnAmount / asset.purchase_value) * 100;
            
            return {
                name: asset.name,
                asset_type: asset.asset_type,
                current_value: asset.current_value,
                purchase_value: asset.purchase_value,
                return_amount: returnAmount,
                return_rate: returnRate
            };
        });
        
        // 按收益率排序
        assetReturns.sort((a, b) => b.return_rate - a.return_rate);
        
        return Response.json(assetReturns, { headers: corsHeaders });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

// Root route - serve the complete frontend from b7e03029 version
router.get('/', async () => {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>个人资产组合</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="format-detection" content="telephone=no">
    <style>
        .tab-btn {
            color: #6b7280;
            background-color: transparent;
        }
        .tab-btn.active {
            color: #3b82f6;
            background-color: #dbeafe;
        }
        .tab-btn:hover {
            background-color: #f3f4f6;
        }
        .tab-btn.active:hover {
            background-color: #dbeafe;
        }
        .nav-tab {
            color: #6b7280;
            background-color: transparent;
        }
        .nav-tab.active {
            color: #3b82f6;
            background-color: #dbeafe;
        }
        .nav-tab:hover {
            background-color: #f3f4f6;
        }
        .nav-tab.active:hover {
            background-color: #dbeafe;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen overflow-x-hidden">
    <!-- 移动端导航栏 -->
    <div class="bg-white shadow-sm sticky top-0 z-50">
        <div class="px-4 py-3">
            <div class="flex items-center justify-between">
                <h1 class="text-lg font-bold text-gray-800 flex items-center">
                    <i class="fas fa-chart-line mr-2 text-blue-500"></i>
                    个人资产组合
                </h1>
                <button id="menuBtn" class="p-2 rounded-lg bg-gray-100 text-gray-600">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
            
            <!-- 下拉菜单 -->
            <div id="dropdownMenu" class="hidden absolute top-full right-4 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div class="py-2">
                    <button id="assetTypesBtn" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <i class="fas fa-tags mr-2 text-blue-500"></i>
                        资产类型管理
                    </button>
                    <button id="settingsBtn" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <i class="fas fa-cog mr-2 text-gray-500"></i>
                        设置
                    </button>
                    <button id="aboutBtn" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <i class="fas fa-info-circle mr-2 text-green-500"></i>
                        关于
                    </button>
                </div>
            </div>
        </div>
        
        <!-- 底部导航 -->
        <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div class="grid grid-cols-4 gap-1 p-2">
                <button id="dashboardBtn" class="nav-tab active flex flex-col items-center py-2 px-1 rounded-lg transition-all">
                    <i class="fas fa-home text-lg mb-1"></i>
                    <span class="text-xs">首页</span>
                </button>
                <button id="assetsBtn" class="nav-tab flex flex-col items-center py-2 px-1 rounded-lg transition-all">
                    <i class="fas fa-coins text-lg mb-1"></i>
                    <span class="text-xs">资产</span>
                </button>
                <button id="liabilitiesBtn" class="nav-tab flex flex-col items-center py-2 px-1 rounded-lg transition-all">
                    <i class="fas fa-credit-card text-lg mb-1"></i>
                    <span class="text-xs">负债</span>
                </button>
                <button id="cashFlowBtn" class="nav-tab flex flex-col items-center py-2 px-1 rounded-lg transition-all">
                    <i class="fas fa-chart-line text-lg mb-1"></i>
                    <span class="text-xs">资金流</span>
                </button>
            </div>
        </div>
    </div>

    <!-- 主内容区域 -->
    <div class="pb-20 px-4 py-4">
        <!-- 仪表板页面 -->
        <div id="dashboardPage" class="page">
            
            <!-- 资产总览（一行显示） -->
            <div class="grid grid-cols-3 gap-3 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div class="text-center">
                        <i class="fas fa-coins text-2xl mb-2"></i>
                        <p class="text-xs opacity-90">总资产</p>
                        <p id="totalAssets" class="text-lg font-bold">￥0</p>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                    <div class="text-center">
                        <i class="fas fa-credit-card text-2xl mb-2"></i>
                        <p class="text-xs opacity-90">总负债</p>
                        <p id="totalLiabilities" class="text-lg font-bold">￥0</p>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div class="text-center">
                        <i class="fas fa-chart-line text-2xl mb-2"></i>
                        <p class="text-xs opacity-90">净资产</p>
                        <p id="netWorth" class="text-lg font-bold">￥0</p>
                    </div>
                </div>
            </div>
            
            <!-- 今年收支对比 -->
            <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-balance-scale mr-2 text-purple-500"></i>
                    今年收支对比
                </h3>
                <div class="grid grid-cols-4 gap-2 text-center">
                    <div class="p-2 bg-green-50 rounded-lg">
                        <p class="text-xs text-gray-600 mb-1">预计收入</p>
                        <p id="projectedIncome" class="text-sm font-bold text-green-600">￥0</p>
                    </div>
                    <div class="p-2 bg-green-100 rounded-lg">
                        <p class="text-xs text-gray-600 mb-1">实际收入</p>
                        <p id="actualIncome" class="text-sm font-bold text-green-700">￥0</p>
                    </div>
                    <div class="p-2 bg-red-50 rounded-lg">
                        <p class="text-xs text-gray-600 mb-1">预计支出</p>
                        <p id="projectedExpense" class="text-sm font-bold text-red-600">￥0</p>
                    </div>
                    <div class="p-2 bg-red-100 rounded-lg">
                        <p class="text-xs text-gray-600 mb-1">实际支出</p>
                        <p id="actualExpense" class="text-sm font-bold text-red-700">￥0</p>
                    </div>
                </div>
                <div class="mt-3 text-center p-2 rounded-lg" id="balanceStatus">
                    <p class="text-sm font-medium" id="balanceText">加载中...</p>
                </div>
            </div>
            
            <!-- 一年收支趋势图 -->
            <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-chart-line mr-2 text-blue-500"></i>
                    一年收支趋势
                </h3>
                <div class="h-64">
                    <canvas id="monthlyTrendChart"></canvas>
                </div>
            </div>
            
            <!-- 资产收益 -->
            <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-trophy mr-2 text-yellow-500"></i>
                    资产收益
                </h3>
                <div class="h-64">
                    <canvas id="assetReturnsChart"></canvas>
                </div>
            </div>
            
            <!-- 资产分布图 -->
            <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-pie-chart mr-2 text-orange-500"></i>
                    资产分布
                </h3>
                <div class="h-64">
                    <canvas id="assetDistributionChart"></canvas>
                </div>
            </div>
        </div>

        <!-- 资产页面 -->
        <div id="assetsPage" class="page hidden">
            <div class="mb-4 flex justify-between items-center">
                <h2 class="text-xl font-bold text-gray-800">我的资产</h2>
                <button id="addAssetBtn" class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                    <i class="fas fa-plus mr-2"></i>添加资产
                </button>
            </div>
            <div id="assetsContainer"></div>
        </div>

        <!-- 负债页面 -->
        <div id="liabilitiesPage" class="page hidden">
            <div class="mb-4 flex justify-between items-center">
                <h2 class="text-xl font-bold text-gray-800">我的负债</h2>
                <button id="addLiabilityBtn" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                    <i class="fas fa-plus mr-2"></i>添加负债
                </button>
            </div>
            <div id="liabilitiesContainer"></div>
        </div>

        <!-- 资金流入页面 -->
        <div id="cashFlowPage" class="page hidden">
            <div class="mb-4 flex justify-between items-center">
                <h2 class="text-xl font-bold text-gray-800">资金流管理</h2>
                <button id="addCashFlowBtn" class="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                    <i class="fas fa-plus mr-2"></i>添加记录
                </button>
            </div>
            
            <!-- 切换选项卡 -->
            <div class="mb-4 bg-white rounded-lg p-1 shadow-sm">
                <div class="grid grid-cols-2 gap-1">
                    <button id="plannedFlowTab" class="tab-btn active py-2 px-4 rounded-md text-sm font-medium transition-all">
                        <i class="fas fa-calendar-alt mr-1"></i>预期收支
                    </button>
                    <button id="historicalFlowTab" class="tab-btn py-2 px-4 rounded-md text-sm font-medium transition-all">
                        <i class="fas fa-history mr-1"></i>历史记录
                    </button>
                </div>
            </div>
            
            <!-- 预期收支内容 -->
            <div id="plannedFlowContent">
                <div id="cashFlowContainer"></div>
            </div>
            
            <!-- 历史记录内容 -->
            <div id="historicalFlowContent" class="hidden">
                <!-- 历史现金流图表 -->
                <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-chart-line mr-2 text-blue-500"></i>
                        历史收支趋势
                    </h3>
                    <div class="h-64">
                        <canvas id="historicalFlowChart"></canvas>
                    </div>
                </div>
                
                <!-- 历史记录列表 -->
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-list mr-2 text-green-500"></i>
                        历史交易记录
                    </h3>
                    <div id="historicalFlowList"></div>
                </div>
            </div>
        </div>
        
        <!-- 设置页面 -->
        <div id="settingsPage" class="page hidden">
            <div class="mb-4">
                <h2 class="text-xl font-bold text-gray-800">设置</h2>
            </div>
            
            <!-- 用户信息 -->
            <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-user mr-2 text-blue-500"></i>
                    用户信息
                </h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                        <input type="text" id="usernameInput" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="请输入用户名">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
                        <input type="tel" id="phoneInput" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="请输入手机号码">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                        <input type="email" id="emailInput" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="请输入邮箱">
                    </div>
                    <button id="saveUserInfoBtn" class="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center">
                        <i class="fas fa-save mr-2"></i>
                        保存信息
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 模态框 -->
    <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-end sm:items-center justify-center">
        <div id="modalContent" class="bg-white w-full sm:w-96 sm:rounded-lg rounded-t-xl max-h-[80vh] overflow-y-auto">
            <!-- 模态框内容将动态插入 -->
        </div>
    </div>

    <!-- Toast 通知 -->
    <div id="toast" class="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-x-full z-50">
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <span id="toastMessage">操作成功</span>
        </div>
    </div>
    <script>
        // 全局变量
        let currentPage = 'dashboard';
        let assetTypes = [];
        let assets = [];
        
        // 工具函数
        function formatCurrency(amount) {
            if (amount === null || amount === undefined || isNaN(amount)) {
                return '￥0';
            }
            return '￥' + Number(amount).toLocaleString('zh-CN');
        }
        
        // API客户端
        class ApiClient {
            constructor() {
                this.baseUrl = window.location.origin;
            }
            
            async request(endpoint, options = {}) {
                const url = this.baseUrl + '/api' + endpoint;
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                    ...options,
                };
                try {
                    const response = await fetch(url, config);
                    if (!response.ok) {
                        throw new Error('HTTP error! status: ' + response.status);
                    }
                    return await response.json();
                } catch (error) {
                    console.error('API request failed:', error);
                    throw error;
                }
            }
            
            // 仪表板
            async getDashboardOverview() {
                return this.request('/dashboard/overview');
            }
            
            // 资产类型
            async getAssetTypes() {
                return this.request('/asset-types');
            }
            
            async createAssetType(data) {
                return this.request('/asset-types', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
            }
            
            async deleteAssetType(id) {
                return this.request('/asset-types/' + id, {
                    method: 'DELETE',
                });
            }
            
            // 资产
            async getAssets() {
                return this.request('/assets');
            }
            
            async createAsset(data) {
                return this.request('/assets', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
            }
            
            async deleteAsset(id) {
                return this.request('/assets/' + id, {
                    method: 'DELETE',
                });
            }
            
            async updateAsset(id, data) {
                return this.request('/assets/' + id, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });
            }
            
            // 负债
            async getLiabilities() {
                return this.request('/liabilities');
            }
            
            async createLiability(data) {
                return this.request('/liabilities', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
            }
            
            async deleteLiability(id) {
                return this.request('/liabilities/' + id, {
                    method: 'DELETE',
                });
            }
            
            async updateLiability(id, data) {
                return this.request('/liabilities/' + id, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });
            }
            
            // 现金流
            async getCashFlows() {
                return this.request('/cash-flows');
            }
            
            async createCashFlow(data) {
                return this.request('/cash-flows', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
            }
            
            async deleteCashFlow(id) {
                return this.request('/cash-flows/' + id, {
                    method: 'DELETE',
                });
            }
            
            async updateCashFlow(id, data) {
                return this.request('/cash-flows/' + id, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });
            }
            
            // 用户信息
            async getUserInfo() {
                return this.request('/user/info');
            }
            
            async updateUserInfo(data) {
                return this.request('/user/info', {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });
            }
            
            // 分析数据
            async getYearlyIncomeExpense(year) {
                return this.request('/analytics/yearly-income-expense?year=' + year);
            }
            
            async getMonthlyIncomeExpense(year) {
                return this.request('/analytics/monthly-income-expense?year=' + year);
            }
            
            async getAssetReturns() {
                return this.request('/analytics/asset-returns');
            }
        }
        
        const apiClient = new ApiClient();

        
        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            
            toastMessage.textContent = message;
            
            // 设置颜色
            toast.className = toast.className.replace(/bg-\w+-500/g, '');
            if (type === 'error') {
                toast.classList.add('bg-red-500');
            } else if (type === 'warning') {
                toast.classList.add('bg-yellow-500');
            } else {
                toast.classList.add('bg-green-500');
            }
            
            // 显示toast
            toast.classList.remove('translate-x-full');
            
            // 3秒后隐藏
            setTimeout(() => {
                toast.classList.add('translate-x-full');
            }, 3000);
        }
        
        function showModal(content) {
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modalContent');
            modalContent.innerHTML = content;
            modal.classList.remove('hidden');
        }
        
        function hideModal() {
            const modal = document.getElementById('modal');
            modal.classList.add('hidden');
        }
        
        // 页面切换
        function showPage(pageId) {
            // 隐藏所有页面
            document.querySelectorAll('.page').forEach(page => {
                page.classList.add('hidden');
            });
            
            // 显示目标页面
            document.getElementById(pageId + 'Page').classList.remove('hidden');
            
            // 更新导航状态
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(pageId + 'Btn').classList.add('active');
            
            currentPage = pageId;
            
            // 加载页面数据
            switch(pageId) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'assets':
                    loadAssets();
                    break;
                case 'liabilities':
                    loadLiabilities();
                    break;
                case 'cashFlow':
                    loadCashFlow();
                    break;
                case 'settings':
                    loadSettings();
                    break;
            }
        }
        
        // 仪表板数据加载
        async function loadDashboard() {
            try {
                const overview = await apiClient.getDashboardOverview();
                
                document.getElementById('totalAssets').textContent = formatCurrency(overview.total_assets || 0);
                document.getElementById('totalLiabilities').textContent = formatCurrency(overview.total_liabilities || 0);
                document.getElementById('netWorth').textContent = formatCurrency(overview.net_worth || 0);
                
                // 加载收支数据
                const currentYear = new Date().getFullYear();
                const yearlyData = await apiClient.getYearlyIncomeExpense(currentYear);
                
                document.getElementById('projectedIncome').textContent = formatCurrency(yearlyData.total_income || 0);
                document.getElementById('actualIncome').textContent = formatCurrency(yearlyData.total_income || 0);
                document.getElementById('projectedExpense').textContent = formatCurrency(yearlyData.total_expense || 0);
                document.getElementById('actualExpense').textContent = formatCurrency(yearlyData.total_expense || 0);
                
                const balance = (yearlyData.total_income || 0) - (yearlyData.total_expense || 0);
                const balanceText = document.getElementById('balanceText');
                const balanceStatus = document.getElementById('balanceStatus');
                
                if (balance > 0) {
                    balanceText.textContent = '盈余 ' + formatCurrency(balance);
                    balanceStatus.className = 'mt-3 text-center p-2 rounded-lg bg-green-100';
                    balanceText.className = 'text-sm font-medium text-green-700';
                } else if (balance < 0) {
                    balanceText.textContent = '亏损 ' + formatCurrency(Math.abs(balance));
                    balanceStatus.className = 'mt-3 text-center p-2 rounded-lg bg-red-100';
                    balanceText.className = 'text-sm font-medium text-red-700';
                } else {
                    balanceText.textContent = '收支平衡';
                    balanceStatus.className = 'mt-3 text-center p-2 rounded-lg bg-gray-100';
                    balanceText.className = 'text-sm font-medium text-gray-700';
                }
                
                // 加载图表
                await loadCharts();
                
            } catch (error) {
                console.error('Failed to load dashboard:', error);
                showToast('加载仪表板数据失败', 'error');
            }
        }
        
        // 加载图表
        async function loadCharts() {
            try {
                const currentYear = new Date().getFullYear();
                const [monthlyData, assetReturns] = await Promise.all([
                    apiClient.getMonthlyIncomeExpense(currentYear),
                    apiClient.getAssetReturns()
                ]);
                
                // 月度趋势图
                const monthlyCtx = document.getElementById('monthlyTrendChart').getContext('2d');
                new Chart(monthlyCtx, {
                    type: 'line',
                    data: {
                        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                        datasets: [{
                            label: '收入',
                            data: Array.from({length: 12}, (_, i) => {
                                const monthData = monthlyData.find(m => m.month === i + 1);
                                return monthData ? monthData.income : 0;
                            }),
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            tension: 0.4
                        }, {
                            label: '支出',
                            data: Array.from({length: 12}, (_, i) => {
                                const monthData = monthlyData.find(m => m.month === i + 1);
                                return monthData ? monthData.expense : 0;
                            }),
                            borderColor: 'rgb(239, 68, 68)',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return formatCurrency(value);
                                    }
                                }
                            }
                        }
                    }
                });
                
                // 资产收益图
                const returnsCtx = document.getElementById('assetReturnsChart').getContext('2d');
                new Chart(returnsCtx, {
                    type: 'bar',
                    data: {
                        labels: assetReturns.map(asset => asset.name),
                        datasets: [{
                            label: '收益率 (%)',
                            data: assetReturns.map(asset => asset.return_rate),
                            backgroundColor: assetReturns.map(asset => 
                                asset.return_rate >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                            )
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return value + '%';
                                    }
                                }
                            }
                        }
                    }
                });
                
                // 资产分布图
                const assets = await apiClient.getAssets();
                const distributionCtx = document.getElementById('assetDistributionChart').getContext('2d');
                
                const assetTypeData = {};
                assets.forEach(asset => {
                    const type = asset.asset_type_name || '其他';
                    assetTypeData[type] = (assetTypeData[type] || 0) + asset.current_value;
                });
                
                new Chart(distributionCtx, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(assetTypeData),
                        datasets: [{
                            data: Object.values(assetTypeData),
                            backgroundColor: [
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(239, 68, 68, 0.8)',
                                'rgba(139, 92, 246, 0.8)'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
                
            } catch (error) {
                console.error('Failed to load charts:', error);
            }
        }
        
        // 资产页面
        async function loadAssets() {
            try {
                const assets = await apiClient.getAssets();
                const container = document.getElementById('assetsContainer');
                
                if (assets.length === 0) {
                    container.innerHTML = '<div class="text-center py-8 text-gray-500">' +
                        '<i class="fas fa-coins text-4xl mb-4 opacity-50"></i>' +
                        '<p>暂无资产记录</p>' +
                        '<p class="text-sm">点击右上角按钮添加您的第一个资产</p>' +
                        '</div>';
                    return;
                }
                
                let assetsHtml = '';
                for (const asset of assets) {
                    assetsHtml += '<div class="bg-white rounded-lg p-4 shadow-sm mb-3">' +
                        '<div class="flex justify-between items-start">' +
                        '<div class="flex-1">' +
                        '<h3 class="font-semibold text-gray-800">' + asset.name + '</h3>' +
                        '<p class="text-sm text-gray-600 mb-2">' + (asset.description || '') + '</p>' +
                        '<div class="flex items-center justify-between">' +
                        '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">' + (asset.asset_type_name || '') + '</span>' +
                        '<span class="text-lg font-bold text-green-600">' + formatCurrency(asset.current_value) + '</span>' +
                        '</div>' +
                        '</div>' +
                        '<div class="ml-4 flex gap-2">' +
                        '<button onclick="editAsset(' + asset.id + ')" class="p-2 text-blue-500 hover:bg-blue-50 rounded">' +
                        '<i class="fas fa-edit text-sm"></i>' +
                        '</button>' +
                        '<button onclick="deleteAsset(' + asset.id + ')" class="p-2 text-red-500 hover:bg-red-50 rounded">' +
                        '<i class="fas fa-trash text-sm"></i>' +
                        '</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                }
                container.innerHTML = assetsHtml;
                
            } catch (error) {
                console.error('Failed to load assets:', error);
                showToast('加载资产数据失败', 'error');
            }
        }
        
        // 负债页面
        async function loadLiabilities() {
            try {
                const liabilities = await apiClient.getLiabilities();
                const container = document.getElementById('liabilitiesContainer');
                
                if (liabilities.length === 0) {
                    container.innerHTML = '<div class="text-center py-8 text-gray-500">' +
                        '<i class="fas fa-credit-card text-4xl mb-4 opacity-50"></i>' +
                        '<p>暂无负债记录</p>' +
                        '<p class="text-sm">点击右上角按钮添加负债信息</p>' +
                        '</div>';
                    return;
                }
                
                let liabilitiesHtml = '';
                for (const liability of liabilities) {
                    liabilitiesHtml += '<div class="bg-white rounded-lg p-4 shadow-sm mb-3">' +
                        '<div class="flex justify-between items-start">' +
                        '<div class="flex-1">' +
                        '<h3 class="font-semibold text-gray-800">' + liability.name + '</h3>' +
                        '<p class="text-sm text-gray-600 mb-2">' + (liability.description || '') + '</p>' +
                        '<div class="flex items-center justify-between">' +
                        '<span class="text-sm text-gray-600">月供: ' + formatCurrency(liability.monthly_payment || 0) + '</span>' +
                        '<span class="text-lg font-bold text-red-600">' + formatCurrency(liability.amount) + '</span>' +
                        '</div>' +
                        '</div>' +
                        '<div class="ml-4 flex gap-2">' +
                        '<button onclick="editLiability(' + liability.id + ')" class="p-2 text-blue-500 hover:bg-blue-50 rounded">' +
                        '<i class="fas fa-edit text-sm"></i>' +
                        '</button>' +
                        '<button onclick="deleteLiability(' + liability.id + ')" class="p-2 text-red-500 hover:bg-red-50 rounded">' +
                        '<i class="fas fa-trash text-sm"></i>' +
                        '</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                }
                container.innerHTML = liabilitiesHtml;
                
            } catch (error) {
                console.error('Failed to load liabilities:', error);
                showToast('加载负债数据失败', 'error');
            }
        }
        
        // 现金流页面
        async function loadCashFlow() {
            try {
                const cashFlows = await apiClient.getCashFlows();
                const container = document.getElementById('cashFlowContainer');
                
                if (cashFlows.length === 0) {
                    container.innerHTML = '<div class="text-center py-8 text-gray-500">' +
                        '<i class="fas fa-chart-line text-4xl mb-4 opacity-50"></i>' +
                        '<p>暂无现金流记录</p>' +
                        '<p class="text-sm">点击右上角按钮添加收支记录</p>' +
                        '</div>';
                    return;
                }
                
                // 获取当前年月
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth() + 1; // 8月
                const currentYear = currentDate.getFullYear();
                
                // 分离历史数据和预期数据
                const historicalFlows = [];
                const plannedFlows = [];
                
                cashFlows.forEach(flow => {
                    const flowDate = new Date(flow.date);
                    const flowMonth = flowDate.getMonth() + 1;
                    const flowYear = flowDate.getFullYear();
                    
                    if (flowYear < currentYear || (flowYear === currentYear && flowMonth < currentMonth)) {
                        historicalFlows.push(flow);
                    } else {
                        plannedFlows.push(flow);
                    }
                });
                
                let plannedHtml = '';
                for (const flow of plannedFlows) {
                    const typeClass = flow.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                    const typeText = flow.type === 'income' ? '收入' : '支出';
                    const amountClass = flow.type === 'income' ? 'text-green-600' : 'text-red-600';
                    const amountPrefix = flow.type === 'income' ? '+' : '-';
                    
                    plannedHtml += '<div class="bg-white rounded-lg p-4 shadow-sm mb-3">' +
                        '<div class="flex justify-between items-start">' +
                        '<div class="flex-1">' +
                        '<div class="flex items-center mb-2">' +
                        '<span class="text-xs px-2 py-1 rounded ' + typeClass + '">' + typeText + '</span>' +
                        '<span class="text-xs text-gray-500 ml-2">' + flow.date + '</span>' +
                        '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">预期</span>' +
                        '</div>' +
                        '<h3 class="font-semibold text-gray-800">' + flow.description + '</h3>' +
                        '<p class="text-sm text-gray-600">' + (flow.category || '') + '</p>' +
                        '</div>' +
                        '<div class="text-right">' +
                        '<span class="text-lg font-bold ' + amountClass + '">' + amountPrefix + formatCurrency(Math.abs(flow.amount)) + '</span>' +
                        '<div class="mt-2 flex gap-2">' +
                        '<button onclick="editCashFlow(' + flow.id + ')" class="p-1 text-blue-500 hover:bg-blue-50 rounded">' +
                        '<i class="fas fa-edit text-xs"></i>' +
                        '</button>' +
                        '<button onclick="deleteCashFlow(' + flow.id + ')" class="p-1 text-red-500 hover:bg-red-50 rounded">' +
                        '<i class="fas fa-trash text-xs"></i>' +
                        '</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                }
                container.innerHTML = plannedHtml;
                
                // 更新历史数据显示
                const historicalContainer = document.getElementById('historicalFlowList');
                if (historicalContainer) {
                    let historicalHtml = '';
                    for (const flow of historicalFlows) {
                        const typeClass = flow.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                        const typeText = flow.type === 'income' ? '收入' : '支出';
                        const amountClass = flow.type === 'income' ? 'text-green-600' : 'text-red-600';
                        const amountPrefix = flow.type === 'income' ? '+' : '-';
                        
                        historicalHtml += '<div class="bg-white rounded-lg p-4 shadow-sm mb-3">' +
                            '<div class="flex justify-between items-start">' +
                            '<div class="flex-1">' +
                            '<div class="flex items-center mb-2">' +
                            '<span class="text-xs px-2 py-1 rounded ' + typeClass + '">' + typeText + '</span>' +
                            '<span class="text-xs text-gray-500 ml-2">' + flow.date + '</span>' +
                            '<span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded ml-2">历史</span>' +
                            '</div>' +
                            '<h3 class="font-semibold text-gray-800">' + flow.description + '</h3>' +
                            '<p class="text-sm text-gray-600">' + (flow.category || '') + '</p>' +
                            '</div>' +
                            '<span class="text-lg font-bold ' + amountClass + '">' + amountPrefix + formatCurrency(Math.abs(flow.amount)) + '</span>' +
                            '</div>' +
                            '</div>';
                    }
                    historicalContainer.innerHTML = historicalHtml;
                }
                
            } catch (error) {
                console.error('Failed to load cash flows:', error);
                showToast('加载现金流数据失败', 'error');
            }
        }
        
        // 设置页面
        async function loadSettings() {
            try {
                const userInfo = await apiClient.getUserInfo();
                
                document.getElementById('usernameInput').value = userInfo.username || '';
                document.getElementById('phoneInput').value = userInfo.phone || '';
                document.getElementById('emailInput').value = userInfo.email || '';
                
            } catch (error) {
                console.error('Failed to load settings:', error);
                showToast('加载设置失败', 'error');
            }
        }
        
        // 删除函数
        async function deleteAsset(id) {
            if (!confirm('确定要删除这个资产吗？')) return;
            
            try {
                await apiClient.deleteAsset(id);
                showToast('删除成功');
                loadAssets();
                if (currentPage === 'dashboard') loadDashboard();
            } catch (error) {
                showToast('删除失败', 'error');
            }
        }
        
        async function deleteLiability(id) {
            if (!confirm('确定要删除这个负债吗？')) return;
            
            try {
                await apiClient.deleteLiability(id);
                showToast('删除成功');
                loadLiabilities();
                if (currentPage === 'dashboard') loadDashboard();
            } catch (error) {
                showToast('删除失败', 'error');
            }
        }
        
        async function deleteCashFlow(id) {
            if (!confirm('确定要删除这个现金流记录吗？')) return;
            
            try {
                await apiClient.deleteCashFlow(id);
                showToast('删除成功');
                loadCashFlow();
                if (currentPage === 'dashboard') loadDashboard();
            } catch (error) {
                showToast('删除失败', 'error');
            }
        }
        
        // 编辑函数
        async function editAsset(id) {
            try {
                const assets = await apiClient.getAssets();
                const asset = assets.find(a => a.id === id);
                if (!asset) {
                    showToast('资产不存在', 'error');
                    return;
                }
                
                const modalContent = '<div class="p-6">' +
                    '<h2 class="text-xl font-bold mb-4">编辑资产</h2>' +
                    '<form id="editAssetForm">' +
                    '<div class="mb-4">' +
                    '<label class="block text-sm font-medium text-gray-700 mb-2">资产名称</label>' +
                    '<input type="text" id="editAssetName" value="' + asset.name + '" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                    '</div>' +
                    '<div class="mb-4">' +
                    '<label class="block text-sm font-medium text-gray-700 mb-2">描述</label>' +
                    '<textarea id="editAssetDescription" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3">' + (asset.description || '') + '</textarea>' +
                    '</div>' +
                    '<div class="mb-4">' +
                    '<label class="block text-sm font-medium text-gray-700 mb-2">当前价值</label>' +
                    '<input type="number" id="editAssetValue" value="' + asset.current_value + '" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                    '</div>' +
                    '<div class="flex gap-3">' +
                    '<button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">保存</button>' +
                    '<button type="button" onclick="hideModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">取消</button>' +
                    '</div>' +
                    '</form>' +
                    '</div>';
                
                showModal(modalContent);
                
                document.getElementById('editAssetForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('editAssetName').value.trim();
                    const description = document.getElementById('editAssetDescription').value.trim();
                    const currentValue = parseFloat(document.getElementById('editAssetValue').value);
                    
                    if (!name || isNaN(currentValue)) {
                        showToast('请填写完整信息', 'error');
                        return;
                    }
                    
                    try {
                        await apiClient.updateAsset(id, {
                            name,
                            description,
                            current_value: currentValue
                        });
                        hideModal();
                        showToast('修改成功');
                        loadAssets();
                        if (currentPage === 'dashboard') loadDashboard();
                    } catch (error) {
                        showToast('修改失败', 'error');
                    }
                });
                
            } catch (error) {
                showToast('加载资产信息失败', 'error');
            }
        }
        
        async function editLiability(id) {
            try {
                const liabilities = await apiClient.getLiabilities();
                const liability = liabilities.find(l => l.id === id);
                if (!liability) {
                    showToast('负债不存在', 'error');
                    return;
                }
                
                const modalContent = '<div class="p-6">' +
                    '<h2 class="text-xl font-bold mb-4">编辑负债</h2>' +
                    '<form id="editLiabilityForm">' +
                    '<div class="mb-4">' +
                    '<label class="block text-sm font-medium text-gray-700 mb-2">负债名称</label>' +
                    '<input type="text" id="editLiabilityName" value="' + liability.name + '" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                    '</div>' +
                    '<div class="mb-4">' +
                    '<label class="block text-sm font-medium text-gray-700 mb-2">描述</label>' +
                    '<textarea id="editLiabilityDescription" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3">' + (liability.description || '') + '</textarea>' +
                    '</div>' +
                    '<div class="mb-4">' +
                    '<label class="block text-sm font-medium text-gray-700 mb-2">负债金额</label>' +
                    '<input type="number" id="editLiabilityAmount" value="' + liability.amount + '" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                    '</div>' +
                    '<div class="mb-4">' +
                    '<label class="block text-sm font-medium text-gray-700 mb-2">月供金额</label>' +
                    '<input type="number" id="editLiabilityMonthlyPayment" value="' + (liability.monthly_payment || 0) + '" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">' +
                    '</div>' +
                    '<div class="flex gap-3">' +
                    '<button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">保存</button>' +
                    '<button type="button" onclick="hideModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">取消</button>' +
                    '</div>' +
                    '</form>' +
                    '</div>';
                
                showModal(modalContent);
                
                document.getElementById('editLiabilityForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('editLiabilityName').value.trim();
                    const description = document.getElementById('editLiabilityDescription').value.trim();
                    const amount = parseFloat(document.getElementById('editLiabilityAmount').value);
                    const monthlyPayment = parseFloat(document.getElementById('editLiabilityMonthlyPayment').value) || 0;
                    
                    if (!name || isNaN(amount)) {
                        showToast('请填写完整信息', 'error');
                        return;
                    }
                    
                    try {
                        await apiClient.updateLiability(id, {
                            name,
                            description,
                            amount,
                            monthly_payment: monthlyPayment
                        });
                        hideModal();
                        showToast('修改成功');
                        loadLiabilities();
                        if (currentPage === 'dashboard') loadDashboard();
                    } catch (error) {
                        showToast('修改失败', 'error');
                    }
                });
                
            } catch (error) {
                showToast('加载负债信息失败', 'error');
            }
        }
        
        async function editCashFlow(id) {
            try {
                const cashFlows = await apiClient.getCashFlows();
                const cashFlow = cashFlows.find(cf => cf.id === id);
                if (!cashFlow) {
                    showToast('现金流记录不存在', 'error');
                    return;
                }
                
                const modalContent = '<div class="p-6">' +
                    '<h2 class="text-xl font-bold mb-4">编辑现金流</h2>' +
                    '<form id="editCashFlowForm">' +
                    '<div class="mb-4">' +
                    '<label class="block text-sm font-medium text-gray-700 mb-2">描述</label>' +
                    '<input type="text" id="editCashFlowDescription" value="' + cashFlow.description + '" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                    '</div>' +
                    '<div class="mb-4">' +
                    '<label class="block text-sm font-medium text-gray-700 mb-2">类型</label>' +
                    '<select id="editCashFlowType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                    '<option value="income"' + (cashFlow.type === 'income' ? ' selected' : '') + '>收入</option>' +
                    '<option value="expense"' + (cashFlow.type === 'expense' ? ' selected' : '') + '>支出</option>' +
                    '</select>' +
                    '</div>' +
                    '<div class="mb-4">' +
                    '<label class="block text-sm font-medium text-gray-700 mb-2">金额</label>' +
                    '<input type="number" id="editCashFlowAmount" value="' + Math.abs(cashFlow.amount) + '" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                    '</div>' +
                    '<div class="mb-4">' +
                    '<label class="block text-sm font-medium text-gray-700 mb-2">日期</label>' +
                    '<input type="date" id="editCashFlowDate" value="' + cashFlow.date + '" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                    '</div>' +
                    '<div class="mb-4">' +
                    '<label class="block text-sm font-medium text-gray-700 mb-2">分类</label>' +
                    '<input type="text" id="editCashFlowCategory" value="' + (cashFlow.category || '') + '" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">' +
                    '</div>' +
                    '<div class="flex gap-3">' +
                    '<button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">保存</button>' +
                    '<button type="button" onclick="hideModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">取消</button>' +
                    '</div>' +
                    '</form>' +
                    '</div>';
                
                showModal(modalContent);
                
                document.getElementById('editCashFlowForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const description = document.getElementById('editCashFlowDescription').value.trim();
                    const type = document.getElementById('editCashFlowType').value;
                    const amount = parseFloat(document.getElementById('editCashFlowAmount').value);
                    const date = document.getElementById('editCashFlowDate').value;
                    const category = document.getElementById('editCashFlowCategory').value.trim();
                    
                    if (!description || isNaN(amount) || !date) {
                        showToast('请填写完整信息', 'error');
                        return;
                    }
                    
                    try {
                        await apiClient.updateCashFlow(id, {
                            description,
                            type,
                            amount: type === 'income' ? amount : -amount,
                            date,
                            category
                        });
                        hideModal();
                        showToast('修改成功');
                        loadCashFlow();
                        if (currentPage === 'dashboard') loadDashboard();
                    } catch (error) {
                        showToast('修改失败', 'error');
                    }
                });
                
            } catch (error) {
                showToast('加载现金流信息失败', 'error');
            }
        }
        
        // 模态框函数
        function showModal(content) {
            document.getElementById('modalContent').innerHTML = content;
            document.getElementById('modal').classList.remove('hidden');
        }
        
        function hideModal() {
            document.getElementById('modal').classList.add('hidden');
        }
        
        // 添加模态框函数
        function showAddAssetModal() {
            const modalContent = '<div class="p-6">' +
                '<h2 class="text-xl font-bold mb-4">添加资产</h2>' +
                '<form id="addAssetForm">' +
                '<div class="mb-4">' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">资产名称</label>' +
                '<input type="text" id="addAssetName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                '</div>' +
                '<div class="mb-4">' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">描述</label>' +
                '<textarea id="addAssetDescription" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>' +
                '</div>' +
                '<div class="mb-4">' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">当前价值</label>' +
                '<input type="number" id="addAssetValue" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                '</div>' +
                '<div class="flex gap-3">' +
                '<button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">添加</button>' +
                '<button type="button" onclick="hideModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">取消</button>' +
                '</div>' +
                '</form>' +
                '</div>';
            
            showModal(modalContent);
            
            document.getElementById('addAssetForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('addAssetName').value.trim();
                const description = document.getElementById('addAssetDescription').value.trim();
                const currentValue = parseFloat(document.getElementById('addAssetValue').value);
                
                if (!name || isNaN(currentValue)) {
                    showToast('请填写完整信息', 'error');
                    return;
                }
                
                try {
                    await apiClient.createAsset({
                        name,
                        description,
                        current_value: currentValue,
                        asset_type_id: 1 // 默认类型
                    });
                    hideModal();
                    showToast('添加成功');
                    loadAssets();
                    if (currentPage === 'dashboard') loadDashboard();
                } catch (error) {
                    showToast('添加失败', 'error');
                }
            });
        }
        
        function showAddLiabilityModal() {
            const modalContent = '<div class="p-6">' +
                '<h2 class="text-xl font-bold mb-4">添加负债</h2>' +
                '<form id="addLiabilityForm">' +
                '<div class="mb-4">' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">负债名称</label>' +
                '<input type="text" id="addLiabilityName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                '</div>' +
                '<div class="mb-4">' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">描述</label>' +
                '<textarea id="addLiabilityDescription" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>' +
                '</div>' +
                '<div class="mb-4">' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">负债金额</label>' +
                '<input type="number" id="addLiabilityAmount" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                '</div>' +
                '<div class="mb-4">' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">月供金额</label>' +
                '<input type="number" id="addLiabilityMonthlyPayment" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">' +
                '</div>' +
                '<div class="flex gap-3">' +
                '<button type="submit" class="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">添加</button>' +
                '<button type="button" onclick="hideModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">取消</button>' +
                '</div>' +
                '</form>' +
                '</div>';
            
            showModal(modalContent);
            
            document.getElementById('addLiabilityForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('addLiabilityName').value.trim();
                const description = document.getElementById('addLiabilityDescription').value.trim();
                const amount = parseFloat(document.getElementById('addLiabilityAmount').value);
                const monthlyPayment = parseFloat(document.getElementById('addLiabilityMonthlyPayment').value) || 0;
                
                if (!name || isNaN(amount)) {
                    showToast('请填写完整信息', 'error');
                    return;
                }
                
                try {
                    await apiClient.createLiability({
                        name,
                        description,
                        amount,
                        monthly_payment: monthlyPayment
                    });
                    hideModal();
                    showToast('添加成功');
                    loadLiabilities();
                    if (currentPage === 'dashboard') loadDashboard();
                } catch (error) {
                    showToast('添加失败', 'error');
                }
            });
        }
        
        function showAddCashFlowModal() {
            const modalContent = '<div class="p-6">' +
                '<h2 class="text-xl font-bold mb-4">添加现金流</h2>' +
                '<form id="addCashFlowForm">' +
                '<div class="mb-4">' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">描述</label>' +
                '<input type="text" id="addCashFlowDescription" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                '</div>' +
                '<div class="mb-4">' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">类型</label>' +
                '<select id="addCashFlowType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                '<option value="income">收入</option>' +
                '<option value="expense">支出</option>' +
                '</select>' +
                '</div>' +
                '<div class="mb-4">' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">金额</label>' +
                '<input type="number" id="addCashFlowAmount" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                '</div>' +
                '<div class="mb-4">' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">日期</label>' +
                '<input type="date" id="addCashFlowDate" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>' +
                '</div>' +
                '<div class="mb-4">' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">分类</label>' +
                '<input type="text" id="addCashFlowCategory" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">' +
                '</div>' +
                '<div class="flex gap-3">' +
                '<button type="submit" class="flex-1 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600">添加</button>' +
                '<button type="button" onclick="hideModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">取消</button>' +
                '</div>' +
                '</form>' +
                '</div>';
            
            showModal(modalContent);
            
            // 设置默认日期为今天
            document.getElementById('addCashFlowDate').value = new Date().toISOString().split('T')[0];
            
            document.getElementById('addCashFlowForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const description = document.getElementById('addCashFlowDescription').value.trim();
                const type = document.getElementById('addCashFlowType').value;
                const amount = parseFloat(document.getElementById('addCashFlowAmount').value);
                const date = document.getElementById('addCashFlowDate').value;
                const category = document.getElementById('addCashFlowCategory').value.trim();
                
                if (!description || isNaN(amount) || !date) {
                    showToast('请填写完整信息', 'error');
                    return;
                }
                
                try {
                    await apiClient.createCashFlow({
                        description,
                        type,
                        amount: type === 'income' ? amount : -amount,
                        date,
                        category
                    });
                    hideModal();
                    showToast('添加成功');
                    loadCashFlow();
                    if (currentPage === 'dashboard') loadDashboard();
                } catch (error) {
                    showToast('添加失败', 'error');
                }
            });
        }
        
        // Toast 通知函数
        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            
            toastMessage.textContent = message;
            
            // 设置颜色
            toast.className = 'fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50';
            if (type === 'error') {
                toast.classList.add('bg-red-500', 'text-white');
            } else if (type === 'info') {
                toast.classList.add('bg-blue-500', 'text-white');
            } else {
                toast.classList.add('bg-green-500', 'text-white');
            }
            
            // 显示
            toast.classList.remove('translate-x-full');
            
            // 3秒后隐藏
            setTimeout(() => {
                toast.classList.add('translate-x-full');
            }, 3000);
        }
        
        // 事件监听器
        document.addEventListener('DOMContentLoaded', function() {
            // 导航按钮
            document.getElementById('dashboardBtn').addEventListener('click', () => showPage('dashboard'));
            document.getElementById('assetsBtn').addEventListener('click', () => showPage('assets'));
            document.getElementById('liabilitiesBtn').addEventListener('click', () => showPage('liabilities'));
            document.getElementById('cashFlowBtn').addEventListener('click', () => showPage('cashFlow'));
            
            // 菜单按钮
            document.getElementById('menuBtn').addEventListener('click', () => {
                const menu = document.getElementById('dropdownMenu');
                menu.classList.toggle('hidden');
            });
            
            document.getElementById('settingsBtn').addEventListener('click', () => {
                showPage('settings');
                document.getElementById('dropdownMenu').classList.add('hidden');
            });
            
            // 保存用户信息
            document.getElementById('saveUserInfoBtn').addEventListener('click', async () => {
                const username = document.getElementById('usernameInput').value.trim();
                const phone = document.getElementById('phoneInput').value.trim();
                const email = document.getElementById('emailInput').value.trim();
                
                if (!username) {
                    showToast('用户名不能为空', 'error');
                    return;
                }
                
                try {
                    await apiClient.updateUserInfo({ username, phone, email });
                    showToast('保存成功');
                } catch (error) {
                    showToast('保存失败', 'error');
                }
            });
            
            // 添加按钮事件
            document.getElementById('addAssetBtn').addEventListener('click', () => {
                showAddAssetModal();
            });
            
            document.getElementById('addLiabilityBtn').addEventListener('click', () => {
                showAddLiabilityModal();
            });
            
            document.getElementById('addCashFlowBtn').addEventListener('click', () => {
                showAddCashFlowModal();
            });
            
            // 模态框关闭
            document.getElementById('modal').addEventListener('click', (e) => {
                if (e.target.id === 'modal') {
                    hideModal();
                }
            });
            
            // 默认显示仪表板
            showPage('dashboard');
        });
    </script>
</body>
</html>`;
    
    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            ...corsHeaders
        }
    });
});

// Handle all requests
export default {
    async fetch(request, env, ctx) {
        // Add env to request for access in route handlers
        request.env = env;
        
        return router.handle(request).catch(err => {
            console.error('Router error:', err);
            return new Response('Internal Server Error', { 
                status: 500,
                headers: corsHeaders 
            });
        });
    },
};
