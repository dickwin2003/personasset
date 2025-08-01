// 导出数据到剪贴板
function exportToClipboard() {
    // 验证数据
    if (!state.data.assets.length && !state.data.config.accounts.length) {
        showToast('没有数据可导出', 'error');
        return;
    }
    
    // 创建数据副本用于导出
    const dataToExport = JSON.parse(JSON.stringify(state.data));
    
    // 将数据复制到剪贴板
    navigator.clipboard.writeText(JSON.stringify(dataToExport, null, 2))
        .then(() => {
            showToast('数据已复制到剪贴板');
        })
        .catch(err => {
            showToast('复制失败: ' + err, 'error');
        });
}

// 从剪贴板导入数据
function importFromClipboard() {
    // 从剪贴板读取文本
    navigator.clipboard.readText()
        .then(text => {
            try {
                // 解析JSON数据
                const data = JSON.parse(text);
                
                // 验证数据格式
                if (validateAssetData(data)) {
                    // 更新状态数据
                    state.data = data;
                    
                    // 保存到localStorage
                    localStorage.setItem('assetTrackerData', JSON.stringify(data));
                    
                    // 重新渲染页面
                    renderRecordPage();
                    renderSettingsPage();
                    
                    // 显示成功消息
                    showToast('数据导入成功');
                } else {
                    throw new Error('无效的数据格式');
                }
            } catch (error) {
                showToast('导入失败：' + error.message, 'error');
            }
        })
        .catch(err => {
            showToast('粘贴失败: ' + err, 'error');
        });
}