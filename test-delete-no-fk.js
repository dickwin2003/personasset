// 测试删除功能修复 - 无外键约束版本
const BASE_URL = 'https://personasset.dickwin2003.workers.dev';

async function testDeleteAssetFixed() {
    console.log('🚀 开始测试删除资产功能（无外键约束版本）...\n');
    
    try {
        // 1. 创建一个测试资产
        console.log('1. 创建测试资产...');
        const createResponse = await fetch(`${BASE_URL}/api/assets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: '测试资产_无外键约束_' + Date.now(),
                description: '用于测试删除功能的资产（无外键约束版本）',
                current_value: 15000,
                asset_type_id: 1
            })
        });
        
        const createResult = await createResponse.json();
        console.log('   创建结果:', createResult);
        
        if (!createResult.success) {
            throw new Error('创建测试资产失败: ' + JSON.stringify(createResult));
        }
        
        // 获取创建的资产ID
        const assetsResponse = await fetch(`${BASE_URL}/api/assets`);
        const assets = await assetsResponse.json();
        console.log('   获取到', assets.length, '个资产');
        
        if (assets.length === 0) {
            throw new Error('无法获取资产列表');
        }
        
        // 选择最后一个资产进行删除测试
        const testAsset = assets[assets.length - 1];
        console.log('   测试资产ID:', testAsset.id, '名称:', testAsset.name);
        
        // 2. 测试删除功能
        console.log('2. 测试删除资产功能（应该不再有外键约束错误）...');
        const deleteResponse = await fetch(`${BASE_URL}/api/assets/${testAsset.id}`, {
            method: 'DELETE'
        });
        
        const deleteResult = await deleteResponse.json();
        console.log('   删除响应状态:', deleteResponse.status);
        console.log('   删除结果:', deleteResult);
        
        if (deleteResponse.ok && deleteResult.success) {
            console.log('✅ 删除功能测试成功！外键约束问题已解决');
            
            // 3. 验证资产已被删除
            console.log('3. 验证资产是否已被删除...');
            const finalAssetsResponse = await fetch(`${BASE_URL}/api/assets`);
            const finalAssets = await finalAssetsResponse.json();
            console.log('   删除后的资产数量:', finalAssets.length);
            
            // 检查删除的资产是否还存在
            const deletedAssetExists = finalAssets.some(asset => asset.id === testAsset.id);
            if (!deletedAssetExists) {
                console.log('✅ 验证成功：资产已被正确删除！');
                console.log('🎉 外键约束问题已彻底解决！');
            } else {
                console.log('⚠️  警告：资产仍然存在于列表中');
            }
        } else {
            console.log('❌ 删除功能仍然存在问题');
            console.log('   错误详情:', deleteResult);
            
            // 检查是否还有外键约束错误
            if (deleteResult.error && deleteResult.error.includes('FOREIGN KEY')) {
                console.log('❌ 仍然有外键约束错误！需要进一步检查数据库架构');
            } else if (deleteResult.error && deleteResult.error.includes('SQLITE_CONSTRAINT')) {
                console.log('❌ 仍然有SQLite约束错误！');
            }
        }
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
    }
    
    console.log('\n📊 测试总结:');
    console.log('- 数据库已重建为无外键约束版本');
    console.log('- 关联关系现在由应用层维护');
    console.log('- 删除操作不再受数据库约束限制');
    
    console.log('\n🏁 测试完成');
}

// 运行测试
testDeleteAssetFixed();