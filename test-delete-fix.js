// 测试删除资产功能的修复
const BASE_URL = 'https://personasset.dickwin2003.workers.dev';

async function testDeleteAssetFix() {
    console.log('🚀 开始测试删除资产功能修复...\n');
    
    try {
        // 1. 首先获取现有资产列表
        console.log('1. 获取现有资产列表...');
        const assetsResponse = await fetch(`${BASE_URL}/api/assets`);
        const assets = await assetsResponse.json();
        console.log('   现有资产数量:', assets.length);
        
        if (assets.length === 0) {
            // 如果没有资产，先创建一个测试资产
            console.log('2. 没有现有资产，创建一个测试资产...');
            const createResponse = await fetch(`${BASE_URL}/api/assets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: '测试资产_' + Date.now(),
                    description: '这是一个用于测试删除功能的资产',
                    current_value: 10000,
                    asset_type_id: 1
                })
            });
            
            const createResult = await createResponse.json();
            console.log('   创建结果:', createResult);
            
            if (!createResult.success) {
                throw new Error('创建测试资产失败: ' + JSON.stringify(createResult));
            }
            
            // 重新获取资产列表
            const updatedAssetsResponse = await fetch(`${BASE_URL}/api/assets`);
            const updatedAssets = await updatedAssetsResponse.json();
            console.log('   更新后的资产数量:', updatedAssets.length);
            
            if (updatedAssets.length > 0) {
                const testAsset = updatedAssets[updatedAssets.length - 1];
                console.log('   将要删除的测试资产ID:', testAsset.id);
                
                // 3. 测试删除功能
                console.log('3. 测试删除资产功能...');
                const deleteResponse = await fetch(`${BASE_URL}/api/assets/${testAsset.id}`, {
                    method: 'DELETE'
                });
                
                const deleteResult = await deleteResponse.json();
                console.log('   删除结果:', deleteResult);
                
                if (deleteResponse.ok && deleteResult.success) {
                    console.log('✅ 删除功能测试成功！');
                    
                    // 4. 验证资产已被删除
                    console.log('4. 验证资产是否已被删除...');
                    const finalAssetsResponse = await fetch(`${BASE_URL}/api/assets`);
                    const finalAssets = await finalAssetsResponse.json();
                    console.log('   删除后的资产数量:', finalAssets.length);
                    
                    if (finalAssets.length === updatedAssets.length - 1) {
                        console.log('✅ 验证成功：资产已被正确删除！');
                    } else {
                        console.log('⚠️  警告：资产数量未按预期减少');
                    }
                } else {
                    console.log('❌ 删除功能仍然存在问题');
                    console.log('   响应状态:', deleteResponse.status);
                    console.log('   错误信息:', deleteResult);
                }
            }
        } else {
            // 如果有现有资产，选择最后一个进行删除测试
            const testAsset = assets[assets.length - 1];
            console.log('2. 将要删除的资产ID:', testAsset.id, '资产名称:', testAsset.name);
            
            // 3. 测试删除功能
            console.log('3. 测试删除资产功能...');
            const deleteResponse = await fetch(`${BASE_URL}/api/assets/${testAsset.id}`, {
                method: 'DELETE'
            });
            
            const deleteResult = await deleteResponse.json();
            console.log('   删除结果:', deleteResult);
            
            if (deleteResponse.ok && deleteResult.success) {
                console.log('✅ 删除功能测试成功！');
                
                // 4. 验证资产已被删除
                console.log('4. 验证资产是否已被删除...');
                const finalAssetsResponse = await fetch(`${BASE_URL}/api/assets`);
                const finalAssets = await finalAssetsResponse.json();
                console.log('   删除后的资产数量:', finalAssets.length);
                
                if (finalAssets.length === assets.length - 1) {
                    console.log('✅ 验证成功：资产已被正确删除！');
                } else {
                    console.log('⚠️  警告：资产数量未按预期减少');
                }
            } else {
                console.log('❌ 删除功能仍然存在问题');
                console.log('   响应状态:', deleteResponse.status);
                console.log('   错误信息:', deleteResult);
            }
        }
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
    }
    
    console.log('\n🏁 测试完成');
}

// 运行测试
testDeleteAssetFix();