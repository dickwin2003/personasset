// 导出数据到剪贴板
function exportToClipboard() {
    // 验证数据
    if (!state.data.assets.length && !state.data.config.accounts.length) {
        showToast('没有数据可导出', 'error');
        return;
    }
    
    // 检查浏览器是否支持Clipboard API
    if (!navigator.clipboard) {
        showToast('您的浏览器不支持剪贴板API，请尝试更新浏览器', 'error');
        console.error('Clipboard API not supported');
        return;
    }
    
    // 创建数据副本用于导出
    const dataToExport = JSON.parse(JSON.stringify(state.data));
    const jsonData = JSON.stringify(dataToExport, null, 2);
    
    // 将数据复制到剪贴板
    navigator.clipboard.writeText(jsonData)
        .then(() => {
            showToast('数据已复制到剪贴板');
            console.log('Data copied to clipboard successfully');
        })
        .catch(err => {
            showToast('复制失败: ' + err.message, 'error');
            console.error('Failed to copy data to clipboard:', err);
            
            // 提供替代方案
            fallbackCopyTextToClipboard(jsonData);
        });
}

// 从剪贴板导入数据
function importFromClipboard() {
    // 检查浏览器是否支持Clipboard API
    if (!navigator.clipboard) {
        showToast('您的浏览器不支持剪贴板API，请尝试更新浏览器', 'error');
        console.error('Clipboard API not supported');
        return;
    }
    
    // 从剪贴板读取文本
    navigator.clipboard.readText()
        .then(text => {
            try {
                // 检查是否有内容
                if (!text || text.trim() === '') {
                    showToast('剪贴板中没有数据', 'error');
                    return;
                }
                
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
                    console.log('Data imported from clipboard successfully');
                } else {
                    throw new Error('无效的数据格式');
                }
            } catch (error) {
                showToast('导入失败：' + error.message, 'error');
                console.error('Failed to import data from clipboard:', error);
            }
        })
        .catch(err => {
            showToast('粘贴失败: ' + err.message, 'error');
            console.error('Failed to read from clipboard:', err);
        });
}

// 备用复制方法（适用于不支持Clipboard API的环境）
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // 避免滚动到底部
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('数据已复制到剪贴板（备用方法）');
            console.log('Data copied to clipboard using fallback method');
        } else {
            throw new Error('复制命令失败');
        }
    } catch (err) {
        showToast('复制失败，请手动选择并复制数据', 'error');
        console.error('Fallback copy failed:', err);
        
        // 显示数据以便手动复制
        showDataForManualCopy(text);
    }
    
    document.body.removeChild(textArea);
}

// 显示数据以便手动复制
function showDataForManualCopy(data) {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    container.style.border = '1px solid #ccc';
    container.style.borderRadius = '5px';
    container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    container.style.zIndex = '10000';
    container.style.maxWidth = '80%';
    container.style.maxHeight = '80%';
    container.style.overflow = 'auto';
    
    container.innerHTML = `
        <h3 style="margin-top: 0;">请手动复制以下数据：</h3>
        <textarea style="width: 100%; height: 200px; font-family: monospace;">${data}</textarea>
        <div style="margin-top: 10px; text-align: right;">
            <button onclick="this.parentElement.parentElement.remove()" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">关闭</button>
        </div>
    `;
    
    document.body.appendChild(container);
}