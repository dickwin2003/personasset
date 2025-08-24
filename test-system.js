// 系统功能测试脚本
// 用于验证API端点和数据库连接

const BASE_URL = 'https://personasset.dickwin2003.workers.dev'; // 替换为你的实际域名

async function testAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        
        const data = await response.json();
        return { success: response.ok, status: response.status, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('🧪 开始系统功能测试...\n');
    
    // 测试用户信息API
    console.log('1. 测试用户信息API');
    const userInfo = await testAPI('/api/user/info');
    if (userInfo.success) {
        console.log('✅ 用户信息API正常');
        console.log(`   用户ID: ${userInfo.data.user_id || userInfo.data.id}`);
        console.log(`   用户名: ${userInfo.data.username}`);
    } else {
        console.log('❌ 用户信息API失败:', userInfo.error || userInfo.data);
    }
    
    // 测试仪表板概览API
    console.log('\n2. 测试仪表板概览API');
    const dashboard = await testAPI('/api/dashboard/overview');
    if (dashboard.success) {
        console.log('✅ 仪表板API正常');
        console.log(`   总资产: ￥${dashboard.data.total_assets || 0}`);
        console.log(`   总负债: ￥${dashboard.data.total_liabilities || 0}`);
        console.log(`   净资产: ￥${dashboard.data.net_worth || 0}`);
    } else {
        console.log('❌ 仪表板API失败:', dashboard.error || dashboard.data);
    }
    
    // 测试资产类型API
    console.log('\n3. 测试资产类型API');
    const assetTypes = await testAPI('/api/asset-types');
    if (assetTypes.success) {
        console.log('✅ 资产类型API正常');
        console.log(`   资产类型数量: ${assetTypes.data.length}`);
        if (assetTypes.data.length > 0) {
            console.log(`   示例类型: ${assetTypes.data[0].name} (${assetTypes.data[0].category})`);
        }
    } else {
        console.log('❌ 资产类型API失败:', assetTypes.error || assetTypes.data);
    }
    
    // 测试资产API
    console.log('\n4. 测试资产API');
    const assets = await testAPI('/api/assets');
    if (assets.success) {
        console.log('✅ 资产API正常');
        console.log(`   资产数量: ${assets.data.length}`);
        if (assets.data.length > 0) {
            console.log(`   示例资产: ${assets.data[0].name} - ￥${assets.data[0].current_value}`);
        }
    } else {
        console.log('❌ 资产API失败:', assets.error || assets.data);
    }
    
    // 测试负债API
    console.log('\n5. 测试负债API');
    const liabilities = await testAPI('/api/liabilities');
    if (liabilities.success) {
        console.log('✅ 负债API正常');
        console.log(`   负债数量: ${liabilities.data.length}`);
        if (liabilities.data.length > 0) {
            console.log(`   示例负债: ${liabilities.data[0].name} - ￥${liabilities.data[0].amount}`);
        }
    } else {
        console.log('❌ 负债API失败:', liabilities.error || liabilities.data);
    }
    
    // 测试现金流API
    console.log('\n6. 测试现金流API');
    const cashFlows = await testAPI('/api/cash-flows');
    if (cashFlows.success) {
        console.log('✅ 现金流API正常');
        console.log(`   现金流记录数量: ${cashFlows.data.length}`);
        if (cashFlows.data.length > 0) {
            console.log(`   示例记录: ${cashFlows.data[0].category} - ￥${cashFlows.data[0].amount} (${cashFlows.data[0].type})`);
        }
    } else {
        console.log('❌ 现金流API失败:', cashFlows.error || cashFlows.data);
    }
    
    // 测试分析API
    console.log('\n7. 测试分析API');
    const analytics = await testAPI('/api/analytics/monthly-income-expense');
    if (analytics.success) {
        console.log('✅ 分析API正常');
        console.log(`   月度数据记录数: ${analytics.data.length}`);
    } else {
        console.log('❌ 分析API失败:', analytics.error || analytics.data);
    }
    
    // 测试资产收益API
    console.log('\n8. 测试资产收益API');
    const returns = await testAPI('/api/analytics/asset-returns');
    if (returns.success) {
        console.log('✅ 资产收益API正常');
        console.log(`   收益记录数: ${returns.data.length}`);
    } else {
        console.log('❌ 资产收益API失败:', returns.error || returns.data);
    }
    
    console.log('\n🎉 测试完成！');
}

// 如果在Node.js环境中运行
if (typeof require !== 'undefined' && require.main === module) {
    // 需要安装node-fetch: npm install node-fetch
    const fetch = require('node-fetch');
    global.fetch = fetch;
    runTests().catch(console.error);
}

// 如果在浏览器中运行
if (typeof window !== 'undefined') {
    window.runSystemTests = runTests;
}
