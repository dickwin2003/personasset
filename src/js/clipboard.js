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
        showManualImportDialog();
        return;
    }
    
    // 检查是否在安全上下文（HTTPS或localhost）
    if (!window.isSecureContext) {
        showToast('剪贴板访问需要安全连接（HTTPS）', 'error');
        console.warn('Clipboard access requires secure context');
        showManualImportDialog();
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
            console.error('Failed to read from clipboard:', err);
            
            // 检查是否是权限错误
            if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
                showToast('无法访问剪贴板，请手动粘贴数据', 'error');
                showManualImportDialog();
            } else {
                showToast('粘贴失败: ' + err.message, 'error');
            }
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

// 显示手动导入对话框
function showManualImportDialog() {
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
        <h3 style="margin-top: 0;">手动导入数据</h3>
        <p>请将数据粘贴到下方文本框中：</p>
        <textarea id="manualImportData" style="width: 100%; height: 200px; font-family: monospace;" placeholder="在此粘贴您的资产数据（JSON格式）"></textarea>
        <div style="margin-top: 10px; text-align: right;">
            <button onclick="document.getElementById('manualImportData').parentElement.parentElement.remove()" style="padding: 5px 10px; background: #6c757d; color: white; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px;">取消</button>
            <button id="manualImportBtn" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">导入</button>
        </div>
    `;
    
    document.body.appendChild(container);
    
    // 添加导入按钮事件监听器
    document.getElementById('manualImportBtn').addEventListener('click', function() {
        const text = document.getElementById('manualImportData').value;
        if (!text || text.trim() === '') {
            showToast('请输入数据', 'error');
            return;
        }
        
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
                console.log('Data imported manually successfully');
                
                // 关闭对话框
                container.remove();
            } else {
                throw new Error('无效的数据格式');
            }
        } catch (error) {
            showToast('导入失败：' + error.message, 'error');
            console.error('Failed to import data manually:', error);
        }
    });
}