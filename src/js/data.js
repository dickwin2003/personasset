// 数据处理模块

// 加载数据
function loadData() {
    // 尝试从localStorage加载数据
    const savedData = localStorage.getItem('assetTrackerData');
    if (savedData) {
        try {
            window.state.data = JSON.parse(savedData);
        } catch (e) {
            console.error('解析保存的数据失败', e);
        }
    }
}

// 保存数据到localStorage
function saveData() {
    // 验证数据
    if (!window.state.data.assets.length && !window.state.data.config.accounts.length) {
        showToast('没有数据可保存', 'error');
        return;
    }
    
    // 保存到localStorage
    localStorage.setItem('assetTrackerData', JSON.stringify(window.state.data));
    
    showToast('数据已保存');
}

// 导出数据到文件
function exportData() {
    // 验证数据
    if (!window.state.data.assets.length && !window.state.data.config.accounts.length) {
        showToast('没有数据可导出', 'error');
        return;
    }
    
    // 生成带时间戳的文件名
    const timestamp = new Date().toISOString().replace(/[:\-]/g, '').slice(0, 12);
    const filename = `资产记录_${timestamp}.json`;
    
    // 创建数据副本用于导出
    const dataToExport = JSON.parse(JSON.stringify(window.state.data));
    
    // 创建并下载文件
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('数据已导出');
}

// 导入数据
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        
        // 检查文件类型
        if (!file.name.endsWith('.json')) {
            showToast('请选择JSON格式的文件', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = JSON.parse(e.target.result);
                if (window.validateAssetData(data)) {
                    window.state.data = data;
                    localStorage.setItem('assetTrackerData', JSON.stringify(data));
                    window.renderRecordPage();
                    window.renderSettingsPage();
                    showToast('数据导入成功');
                } else {
                    throw new Error('无效的数据格式');
                }
            } catch (error) {
                showToast('导入失败：' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// 将函数添加到全局作用域
window.loadData = loadData;
window.saveData = saveData;
window.exportData = exportData;
window.importData = importData;