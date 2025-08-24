// 数据处理模块 - MySQL版本

// 数据格式化工具函数
const DataUtils = {
    // 格式化金额显示
    formatCurrency(amount) {
        if (amount >= 10000) {
            return `￥${(amount / 10000).toFixed(1)}万`;
        }
        return `￥${amount.toLocaleString()}`;
    },

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    },

    // 格式化百分比
    formatPercentage(value) {
        return `${value.toFixed(2)}%`;
    },

    // 计算收益率
    calculateReturnRate(currentValue, purchaseValue) {
        if (!purchaseValue || purchaseValue === 0) return 0;
        return ((currentValue - purchaseValue) / purchaseValue * 100);
    },

    // 获取资产类别颜色
    getCategoryColor(category) {
        const colors = {
            'fixed': '#3b82f6',    // 蓝色 - 固定资产
            'liquid': '#10b981',   // 绿色 - 流动资产
            'consumer': '#f59e0b'  // 橙色 - 消费品
        };
        return colors[category] || '#6b7280';
    },

    // 获取资产类别中文名
    getCategoryName(category) {
        const names = {
            'fixed': '固定资产',
            'liquid': '流动资产', 
            'consumer': '消费品'
        };
        return names[category] || category;
    },

    // 验证表单数据
    validateAssetData(data) {
        if (!data.name || data.name.trim() === '') {
            throw new Error('资产名称不能为空');
        }
        if (!data.current_value || data.current_value <= 0) {
            throw new Error('当前价值必须大于0');
        }
        if (!data.asset_type_id) {
            throw new Error('请选择资产类型');
        }
        return true;
    },

    // 验证负债数据
    validateLiabilityData(data) {
        if (!data.name || data.name.trim() === '') {
            throw new Error('负债名称不能为空');
        }
        if (!data.amount || data.amount <= 0) {
            throw new Error('负债金额必须大于0');
        }
        return true;
    },

    // 验证现金流数据
    validateCashFlowData(data) {
        if (!data.category || data.category.trim() === '') {
            throw new Error('现金流类别不能为空');
        }
        if (!data.amount || data.amount <= 0) {
            throw new Error('金额必须大于0');
        }
        if (!data.type || !['income', 'expense'].includes(data.type)) {
            throw new Error('请选择正确的现金流类型');
        }
        if (!data.date) {
            throw new Error('请选择日期');
        }
        return true;
    },

    // 导出数据到文件
    async exportData() {
        try {
            // 获取所有数据
            const [assets, liabilities, cashFlows, assetTypes] = await Promise.all([
                window.apiClient.getAssets(),
                window.apiClient.getLiabilities(),
                window.apiClient.getCashFlows(),
                window.apiClient.getAssetTypes()
            ]);

            const exportData = {
                assets,
                liabilities,
                cashFlows,
                assetTypes,
                exportDate: new Date().toISOString(),
                version: '2.0'
            };

            // 生成文件名
            const timestamp = new Date().toISOString().replace(/[:\-]/g, '').slice(0, 12);
            const filename = `个人投资组合_${timestamp}.json`;

            // 下载文件
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return { success: true, message: '数据导出成功' };
        } catch (error) {
            console.error('导出数据失败:', error);
            return { success: false, message: '导出失败: ' + error.message };
        }
    }
};

// 将工具函数添加到全局作用域
window.DataUtils = DataUtils;