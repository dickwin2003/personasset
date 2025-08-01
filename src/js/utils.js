// 格式化显示金额（通用）
function formatAmountForDisplay(amount, unit) {
    const value = amount / window.unitValues[unit];

    if (!window.state.data.config.showDecimal) {
        return Math.round(value);
    }
    
    // 根据单位调整小数位数，保留更多精度
    if (unit === "元") {
        return value.toFixed(2);
    } else if (unit === "千") {
        return value.toFixed(3);
    } else if (unit === "万") {
        return value.toFixed(4);
    } else if (unit === "十万") {
        return value.toFixed(5);
    } else if (unit === "百万") {
        return value.toFixed(6);
    } else if (unit === "千万") {
        return value.toFixed(7);
    } else if (unit === "亿") {
        return value.toFixed(8);
    }
    
    return value.toFixed(2); // 默认保留两位小数
}

// 格式化总计金额显示（支持千分位符）
function formatTotalAmountForDisplay(amount, unit) {
    const value = amount / window.unitValues[unit];
    
    // 如果启用了千分位符且单位是"元"，则格式化为带千分位符的形式
    if (window.state.data.config.useThousandsSeparator && unit === "元") {
        if (!window.state.data.config.showDecimal) {
            // 不显示小数点时，使用整数并添加千分位符
            return Math.round(value).toLocaleString();
        }
        // 显示小数点时，保留两位小数并添加千分位符
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    
    // 默认格式化方式
    if (!window.state.data.config.showDecimal) {
        return Math.round(value);
    }
    return value.toFixed(2);
}

// 解析金额
function parseAmount(value, unit) {
    const num = parseFloat(value) || 0;
    return num * window.unitValues[unit];
}

// 防抖函数，用于优化频繁的操作
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 数据验证函数
function validateAssetData(data) {
    // 检查必需的属性
    if (!data.assets || !Array.isArray(data.assets)) {
        return false;
    }
    
    if (!data.config || typeof data.config !== 'object') {
        return false;
    }
    
    // 检查资产数据结构
    for (const asset of data.assets) {
        if (!asset.date || !asset.account || typeof asset.amount !== 'number') {
            return false;
        }
    }
    
    // 检查配置数据结构
    const config = data.config;
    if (!config.units || !config.accounts || !Array.isArray(config.accounts)) {
        return false;
    }
    
    // 检查单位设置
    const requiredUnits = ['record', 'overview', 'summary'];
    for (const unitType of requiredUnits) {
        if (!config.units[unitType]) {
            return false;
        }
    }
    
    // 检查筛选账户字段（可选）
    if (config.filteredAccounts && !Array.isArray(config.filteredAccounts)) {
        return false;
    }
    
    // 检查隐藏账户字段（可选）
    if (config.hiddenAccounts && !Array.isArray(config.hiddenAccounts)) {
        return false;
    }
    
    return true;
}

// 将函数添加到全局作用域
window.formatAmountForDisplay = formatAmountForDisplay;
window.formatTotalAmountForDisplay = formatTotalAmountForDisplay;
window.parseAmount = parseAmount;
window.debounce = debounce;
window.validateAssetData = validateAssetData;