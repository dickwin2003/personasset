// 全局状态管理
const state = {
    currentView: 'record',
    data: {
        assets: [],
        config: {
            units: {
                record: "元",
                overview: "万",
                summary: "元"
            },
            accounts: ["支付宝", "工商银行", "微信钱包"],
            showNotes: false,
            showDecimal: false,
            useThousandsSeparator: false, // 是否使用千分位符（仅对总计金额）
            filteredAccounts: [], // 添加账户筛选功能
            hiddenAccounts: [] // 添加隐藏账户功能
        }
    },
    chartInstances: {}
};

// 注册Chart.js插件，但只在需要的图表中启用
Chart.register(ChartDataLabels);

// 页面元素缓存
const elements = {
    recordPage: null,
    overviewPage: null,
    settingsPage: null,
    recordBtn: null,
    overviewBtn: null,
    settingsBtn: null
};

// 单位定义
const units = ["元", "千", "万", "十万", "百万", "千万", "亿"];
const unitValues = {
    "元": 1,
    "千": 1000,
    "万": 10000,
    "十万": 100000,
    "百万": 1000000,
    "千万": 10000000,
    "亿": 100000000
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    loadData();
    renderRecordPage();
});

// 初始化应用
function initApp() {
    // 缓存常用元素
    elements.recordPage = document.getElementById('recordPage');
    elements.overviewPage = document.getElementById('overviewPage');
    elements.settingsPage = document.getElementById('settingsPage');
    elements.recordBtn = document.getElementById('recordBtn');
    elements.overviewBtn = document.getElementById('overviewBtn');
    elements.settingsBtn = document.getElementById('settingsBtn');
    
    // 设置当前日期
    const now = new Date();
    const dateString = now.toISOString().split('T')[0];
    document.getElementById('currentDate').textContent = dateString;
}

// 设置事件监听器
function setupEventListeners() {
    // 导航按钮
    elements.recordBtn.addEventListener('click', () => switchView('record'));
    elements.overviewBtn.addEventListener('click', () => switchView('overview'));
    elements.settingsBtn.addEventListener('click', () => switchView('settings'));
    
    // 记录页按钮
    document.getElementById('saveBtn').addEventListener('click', saveData);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', importData);
    
    // 添加调试信息
    const exportClipboardBtn = document.getElementById('exportClipboardBtn');
    const importClipboardBtn = document.getElementById('importClipboardBtn');
    
    if (exportClipboardBtn) {
        console.log('Export clipboard button found');
        exportClipboardBtn.addEventListener('click', function() {
            console.log('Export clipboard button clicked');
            exportToClipboard();
        });
    } else {
        console.error('Export clipboard button not found');
    }
    
    if (importClipboardBtn) {
        console.log('Import clipboard button found');
        importClipboardBtn.addEventListener('click', function() {
            console.log('Import clipboard button clicked');
            importFromClipboard();
        });
    } else {
        console.error('Import clipboard button not found');
    }
    
    document.getElementById('populateLastDataBtn').addEventListener('click', populateLastData);
    
    // 设置页按钮
    document.getElementById('addAccountBtn').addEventListener('click', addAccount);
    document.getElementById('saveHistoryBtn').addEventListener('click', saveHistoryChanges);
    
    // 显示设置
    document.getElementById('showNotesCheckbox').addEventListener('change', toggleNotesDisplay);
    document.getElementById('showDecimalCheckbox').addEventListener('change', toggleDecimalDisplay);
    document.getElementById('thousandsSeparatorCheckbox').addEventListener('change', toggleThousandsSeparator);
    
    // 总览页事件监听器（使用防抖函数优化性能）
    document.getElementById('trendPeriodSelect').addEventListener('change', debouncedRenderOverviewPage);
    document.getElementById('logScaleCheckbox').addEventListener('change', debouncedRenderOverviewPage);
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 处理键盘快捷键
function handleKeyboardShortcuts(e) {
    // Ctrl+S 或 Cmd+S 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveData();
    }
}

// 切换视图
function switchView(view) {
    state.currentView = view;
    
    // 更新按钮状态
    elements.recordBtn.classList.remove('active');
    elements.overviewBtn.classList.remove('active');
    elements.settingsBtn.classList.remove('active');
    
    // 隐藏所有页面
    elements.recordPage.classList.add('hidden');
    elements.overviewPage.classList.add('hidden');
    elements.settingsPage.classList.add('hidden');
    
    // 显示对应页面并激活按钮
    if (view === 'record') {
        elements.recordPage.classList.remove('hidden');
        elements.recordBtn.classList.add('active');
        renderRecordPage();
    } else if (view === 'overview') {
        elements.overviewPage.classList.remove('hidden');
        elements.overviewBtn.classList.add('active');
        renderOverviewPage();
    } else {
        elements.settingsPage.classList.remove('hidden');
        elements.settingsBtn.classList.add('active');
        renderSettingsPage();
    }
}

// 渲染记录页面
function renderRecordPage() {
    const accountsList = document.getElementById('accountsList');
    accountsList.innerHTML = '';
    
    const currentDate = document.getElementById('currentDate').textContent;
    
    state.data.config.accounts.forEach((account, index) => {
        // 查找当天该账户的数据
        const asset = state.data.assets.find(a => 
            a.date === currentDate && a.account === account
        );
        
        const amount = asset ? asset.amount : 0;
        const note = asset ? asset.note : '';
        
        const accountDiv = document.createElement('div');
        accountDiv.className = 'flex items-center justify-between p-3 border rounded';
        accountDiv.innerHTML = `
            <span class="font-medium">${account}</span>
            <div class="flex flex-col">
                <div class="flex items-center mb-1">
                    ${state.data.config.showNotes ? `<input 
                        type="text"
                        data-account="${account}"
                        value="${note}"
                        class="w-32 px-2 py-1 border rounded text-sm note-input mr-2"
                        placeholder="备注"
                    >` : ''}
                    <input 
                        type="${state.data.config.showDecimal ? 'number' : 'text'}"
                        data-account="${account}"
                        value="${formatAmountForDisplay(amount, state.data.config.units.record)}"
                        class="w-32 px-2 py-1 border rounded text-right amount-input"
                        placeholder="0"
                    >
                    <span class="ml-2 text-gray-500">${state.data.config.units.record}</span>
                </div>
            </div>
        `;
        accountsList.appendChild(accountDiv);
    });
    
    // 添加事件监听器
    document.querySelectorAll('.amount-input').forEach(input => {
        input.addEventListener('input', handleAmountChange);
        input.addEventListener('keydown', handleKeyDown);
    });
    
    // 添加备注输入框事件监听器（仅在显示备注时）
    if (state.data.config.showNotes) {
        document.querySelectorAll('.note-input').forEach(input => {
            input.addEventListener('input', handleNoteChange);
        });
    }
    
    // 更新总计
    updateTotal();
    
    // 备注显示控制
    const notesSection = document.getElementById('notesSection');
    if (notesSection) {
        if (state.data.config.showNotes) {
            notesSection.classList.remove('hidden');
        } else {
            notesSection.classList.add('hidden');
        }
    }
}

// 处理金额变更
function handleAmountChange(e) {
    updateTotal();
}

// 处理备注变更
function handleNoteChange(e) {
    // 只在显示备注时处理变更
    if (!state.data.config.showNotes) return;
    
    const account = e.target.dataset.account;
    const note = e.target.value;
    const currentDate = document.getElementById('currentDate').textContent;
    
    // 查找或创建资产记录
    let asset = state.data.assets.find(a => 
        a.date === currentDate && a.account === account
    );
    
    if (!asset) {
        // 获取金额值
        const amountInput = document.querySelector(`.amount-input[data-account="${account}"]`);
        const displayValue = amountInput ? amountInput.value.trim() : "0";
        const amount = displayValue ? parseAmount(displayValue, state.data.config.units.record) : 0;
        
        asset = { date: currentDate, account, amount, note: "" };
        state.data.assets.push(asset);
    }
    
    asset.note = note;
}

// 处理键盘事件
function handleKeyDown(e) {
    if (e.key === 'Enter') {
        const inputs = Array.from(document.querySelectorAll('.amount-input'));
        const currentIndex = inputs.indexOf(e.target);
        const nextIndex = (currentIndex + 1) % inputs.length;
        inputs[nextIndex].focus();
    }
}

// 更新总计
function updateTotal() {
    let total = 0;
    const currentDate = document.getElementById('currentDate').textContent;
    
    // 处理金额输入框
    document.querySelectorAll('.amount-input').forEach(input => {
        const account = input.dataset.account;
        const displayValue = input.value.trim();
        
        // 检查账户是否被隐藏
        const isHidden = state.data.config.hiddenAccounts && 
                        state.data.config.hiddenAccounts.includes(account);
        
        if (displayValue && !isHidden) {
            const value = parseAmount(displayValue, state.data.config.units.record);
            total += value;
            
            // 更新或创建资产记录
            let asset = state.data.assets.find(a => 
                a.date === currentDate && a.account === account
            );
            
            if (!asset) {
                // 获取备注值（仅在显示备注时）
                let note = "";
                if (state.data.config.showNotes) {
                    const noteInput = document.querySelector(`.note-input[data-account="${account}"]`);
                    note = noteInput ? noteInput.value : "";
                }
                
                asset = { date: currentDate, account, amount: 0, note };
                state.data.assets.push(asset);
            }
            
            asset.amount = value;
        }
    });
    
    // 处理备注输入框（仅在显示备注时）
    if (state.data.config.showNotes) {
        document.querySelectorAll('.note-input').forEach(input => {
            const account = input.dataset.account;
            const note = input.value;
            
            // 检查账户是否被隐藏
            const isHidden = state.data.config.hiddenAccounts && 
                            state.data.config.hiddenAccounts.includes(account);
            
            if (isHidden) return; // 如果账户被隐藏，跳过处理
            
            // 查找或创建资产记录
            let asset = state.data.assets.find(a => 
                a.date === currentDate && a.account === account
            );
            
            if (!asset) {
                // 获取金额值
                const amountInput = document.querySelector(`.amount-input[data-account="${account}"]`);
                const displayValue = amountInput ? amountInput.value.trim() : "0";
                const amount = displayValue ? parseAmount(displayValue, state.data.config.units.record) : 0;
                
                asset = { date: currentDate, account, amount, note: "" };
                state.data.assets.push(asset);
            }
            
            asset.note = note;
        });
    }
    
    // 显示总计和单位（使用专门的总计金额格式化函数）
    document.getElementById('totalAmount').textContent = 
        formatTotalAmountForDisplay(total, state.data.config.units.summary);
    document.getElementById('totalUnit').textContent = state.data.config.units.summary;
}

// 格式化显示金额（通用）
function formatAmountForDisplay(amount, unit) {
    const value = amount / unitValues[unit];

    if (!state.data.config.showDecimal) {
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
    const value = amount / unitValues[unit];
    
    // 如果启用了千分位符且单位是"元"，则格式化为带千分位符的形式
    if (state.data.config.useThousandsSeparator && unit === "元") {
        if (!state.data.config.showDecimal) {
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
    if (!state.data.config.showDecimal) {
        return Math.round(value);
    }
    return value.toFixed(2);
}

// 解析金额
function parseAmount(value, unit) {
    const num = parseFloat(value) || 0;
    return num * unitValues[unit];
}

// 渲染总览页面
function renderOverviewPage() {
    // 更新总资产显示
    updateOverviewTotal();
    
    // 渲染账户筛选按钮
    renderAccountFilters();
    
    // 使用Chart.js渲染各种图表
    renderTrendChart();
    renderPieChart();
    renderBarChart();
    renderStackedAreaChart();
}

// 防抖函数，用于优化频繁的图表重绘操作
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

// 防抖的总览页面渲染函数
const debouncedRenderOverviewPage = debounce(renderOverviewPage, 300);

// 更新总览页总资产显示
function updateOverviewTotal() {
    // 获取最新日期
    const dates = [...new Set(state.data.assets.map(a => a.date))].sort();
    const latestDate = dates[dates.length - 1];
    
    // 计算最新日期的总资产（排除隐藏账户和被筛选掉的账户）
    let total = 0;
    const filteredAccounts = state.data.config.filteredAccounts || [];
    const hiddenAccounts = state.data.config.hiddenAccounts || [];
    
    // 使用 for 循环而不是 forEach 提高性能
    for (let i = 0; i < state.data.assets.length; i++) {
        const asset = state.data.assets[i];
        // 只计算最新日期且未被筛选掉和未被隐藏的资产
        if (asset.date === latestDate && 
            !filteredAccounts.includes(asset.account) && 
            !hiddenAccounts.includes(asset.account)) {
            total += asset.amount;
        }
    }
    
    // 显示总计和单位（使用专门的总计金额格式化函数）
    document.getElementById('overviewTotalAmount').textContent = 
        formatTotalAmountForDisplay(total, state.data.config.units.summary);
    document.getElementById('overviewTotalUnit').textContent = state.data.config.units.summary;
}

// 渲染账户筛选按钮
function renderAccountFilters() {
    const container = document.getElementById('accountFilters');
    container.innerHTML = '';
    
    // 获取所有唯一账户名称，使用 Set 提高性能
    const accountsSet = new Set();
    for (let i = 0; i < state.data.assets.length; i++) {
        accountsSet.add(state.data.assets[i].account);
    }
    const accounts = Array.from(accountsSet);
    
    // 过滤掉隐藏的账户
    const visibleAccounts = accounts.filter(account => {
        return !state.data.config.hiddenAccounts || 
               !state.data.config.hiddenAccounts.includes(account);
    });
    
    // 使用文档片段减少DOM操作次数
    const fragment = document.createDocumentFragment();
    
    // 为每个可见账户创建筛选按钮
    for (let i = 0; i < visibleAccounts.length; i++) {
        const account = visibleAccounts[i];
        const button = document.createElement('button');
        button.className = `px-3 py-1 text-sm rounded ${isAccountFiltered(account) ? 'bg-gray-200 text-gray-700' : 'bg-blue-500 text-white'}`;
        button.textContent = account;
        button.dataset.account = account;
        button.addEventListener('click', () => toggleAccountFilter(account));
        fragment.appendChild(button);
    }
    
    container.appendChild(fragment);
}

// 检查账户是否被筛选掉或隐藏
function isAccountFiltered(account) {
    // 检查是否被用户筛选掉
    const isUserFiltered = state.data.config.filteredAccounts && 
                          state.data.config.filteredAccounts.includes(account);
                          
    // 检查是否被隐藏
    const isHidden = state.data.config.hiddenAccounts && 
                    state.data.config.hiddenAccounts.includes(account);
    
    return isUserFiltered || isHidden;
}

// 切换账户筛选状态
function toggleAccountFilter(account) {
    if (!state.data.config.filteredAccounts) {
        state.data.config.filteredAccounts = [];
    }
    
    const index = state.data.config.filteredAccounts.indexOf(account);
    if (index > -1) {
        // 取消筛选
        state.data.config.filteredAccounts.splice(index, 1);
    } else {
        // 添加筛选
        state.data.config.filteredAccounts.push(account);
    }
    
    // 使用防抖函数重新渲染总览页面
    debouncedRenderOverviewPage();
}

// 渲染趋势图
function renderTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const period = document.getElementById('trendPeriodSelect').value;
    const useLogScale = document.getElementById('logScaleCheckbox').checked;
    
    // 准备趋势数据
    let filteredAssets = state.data.assets;
    
    // 应用时间筛选
    if (period !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case '5y':
                startDate = new Date(now.setFullYear(now.getFullYear() - 5));
                break;
            case '3y':
                startDate = new Date(now.setFullYear(now.getFullYear() - 3));
                break;
            case '1y':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            case '6m':
                startDate = new Date(now.setMonth(now.getMonth() - 6));
                break;
            case '3m':
                startDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case '1m':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case '1w':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
        }
        
        filteredAssets = filteredAssets.filter(asset => new Date(asset.date) >= startDate);
    }
    
    // 过滤掉隐藏的账户
    if (state.data.config.hiddenAccounts && state.data.config.hiddenAccounts.length > 0) {
        filteredAssets = filteredAssets.filter(asset => 
            !state.data.config.hiddenAccounts.includes(asset.account)
        );
    }
    
    // 按日期和账户分组并计算每日各账户资产
    const groupedByDateAndAccount = {};
    filteredAssets.forEach(asset => {
        if (!groupedByDateAndAccount[asset.date]) {
            groupedByDateAndAccount[asset.date] = {};
        }
        if (!groupedByDateAndAccount[asset.date][asset.account]) {
            groupedByDateAndAccount[asset.date][asset.account] = 0;
        }
        groupedByDateAndAccount[asset.date][asset.account] += asset.amount;
    });
    
    // 获取所有日期并排序
    const dates = Object.keys(groupedByDateAndAccount).sort();
    
    // 获取所有账户（过滤掉隐藏账户）
    const accounts = [...new Set(filteredAssets.map(a => a.account))];
    
    // 优化：对大量数据进行采样
    const maxDataPoints = 50; // 限制最多显示50个数据点
    let sampledDates = dates;
    let sampledGroupedData = groupedByDateAndAccount;
    
    if (dates.length > maxDataPoints) {
        // 数据采样，保持首尾和关键变化点
        const step = Math.ceil(dates.length / maxDataPoints);
        sampledDates = [];
        sampledGroupedData = {};
        
        for (let i = 0; i < dates.length; i += step) {
            const date = dates[i];
            sampledDates.push(date);
            sampledGroupedData[date] = groupedByDateAndAccount[date];
        }
        
        // 确保包含最后一个数据点
        if (!sampledDates.includes(dates[dates.length - 1])) {
            sampledDates.push(dates[dates.length - 1]);
            sampledGroupedData[dates[dates.length - 1]] = groupedByDateAndAccount[dates[dates.length - 1]];
        }
    }
    
    // 为每个账户准备数据
    const datasets = accounts.map((account, index) => {
        const color = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
        ][index % 10];
        
        return {
            label: account,
            data: sampledDates.map(date => {
                const amount = sampledGroupedData[date][account] || 0;
                // 应用总览筛选
                if (state.data.config.filteredAccounts && 
                    state.data.config.filteredAccounts.includes(account)) {
                    return null; // 隐藏被筛选掉的账户
                }
                return amount / unitValues[state.data.config.units.overview];
            }),
            borderColor: color,
            backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: dates.length > 30 ? 0 : 3, // 数据点过多时隐藏点标记
            pointHoverRadius: 5
        };
    });
    
    // 计算合计资产数据（不被筛选掉且未隐藏的账户总和）
    const totalData = sampledDates.map(date => {
        let total = 0;
        accounts.forEach(account => {
            // 只计算未被筛选掉且未隐藏的账户
            if (!(state.data.config.filteredAccounts && 
                  state.data.config.filteredAccounts.includes(account))) {
                const amount = sampledGroupedData[date][account] || 0;
                total += amount;
            }
        });
        return total / unitValues[state.data.config.units.overview];
    });
    
    // 添加合计资产线到数据集中
    datasets.push({
        label: '合计',
        data: totalData,
        borderColor: '#000000', // 黑色线表示合计
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 3,
        borderDash: [5, 5], // 虚线表示合计
        fill: false,
        tension: 0.3,
        pointRadius: dates.length > 30 ? 0 : 3,
        pointHoverRadius: 5,
        // 将合计线置于最底层，避免遮挡其他线条
        order: 1
    });
    
    // 如果已有图表实例，先销毁
    if (state.chartInstances.trend) {
        state.chartInstances.trend.destroy();
    }
    
    // 创建新图表
    state.chartInstances.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sampledDates,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 300 // 减少动画时间以提高性能
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 10,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = total > 0 
                                ? ((value / total) * 100).toFixed(1)
                                : '0';
                            return `${label}: ${value.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} ${state.data.config.units.overview} (${percentage}%)`;
                        }
                    }
                },
                // 禁用数据标签插件
                datalabels: {
                    display: false
                }
            },
            scales: {
                y: {
                    type: useLogScale ? 'logarithmic' : 'linear',
                    beginAtZero: true,
                    // 限制Y轴范围，避免因资产差异过大导致图表过高
                    suggestedMax: Math.max(...totalData) * 1.1 || 100,
                    ticks: {
                        callback: function(value) {
                            // 格式化Y轴标签，适配当前单位设置
                            const currentUnit = state.data.config.units.overview;
                            const baseValue = unitValues[currentUnit];
                            
                            const yiValue = unitValues["亿"] / baseValue;
                            const qianWanValue = unitValues["千万"] / baseValue;
                            const baiWanValue = unitValues["百万"] / baseValue;
                            const shiWanValue = unitValues["十万"] / baseValue;
                            const wanValue = unitValues["万"] / baseValue;
                            const qianValue = unitValues["千"] / baseValue;
                            
                            if (Math.abs(value) >= yiValue) {
                                return (value / yiValue).toFixed(1) + '亿';
                            } else if (Math.abs(value) >= qianWanValue) {
                                return (value / qianWanValue).toFixed(1) + '千万';
                            } else if (Math.abs(value) >= baiWanValue) {
                                return (value / baiWanValue).toFixed(1) + '百万';
                            } else if (Math.abs(value) >= shiWanValue) {
                                return (value / shiWanValue).toFixed(1) + '十万';
                            } else if (Math.abs(value) >= wanValue) {
                                return (value / wanValue).toFixed(1) + '万';
                            } else if (Math.abs(value) >= qianValue) {
                                return (value / qianValue).toFixed(1) + '千';
                            }
                            return value;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            hover: {
                mode: 'nearest',
                intersect: false
            }
        }
    });
}

// 辅助函数：计算图表建议最大值
function getMaxChartValue(datasets) {
    let maxValue = 0;
    
    datasets.forEach(dataset => {
        dataset.data.forEach(value => {
            if (value !== null && value > maxValue) {
                maxValue = value;
            }
        });
    });
    
    // 给最大值增加一些边距
    return maxValue * 1.1;
}

// 渲染饼图
function renderPieChart() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    // 获取最新日期
    const dates = [...new Set(state.data.assets.map(a => a.date))].sort();
    const latestDate = dates[dates.length - 1];
    
    // 计算各账户在最新日期的资产总和（排除隐藏账户）
    const accountTotals = {};
    state.data.assets.forEach(asset => {
        // 只考虑最新日期的资产记录
        if (asset.date === latestDate) {
            // 检查账户是否被筛选掉或隐藏
            const isFilteredOut = (state.data.config.filteredAccounts && 
                                 state.data.config.filteredAccounts.includes(asset.account)) ||
                                 (state.data.config.hiddenAccounts && 
                                 state.data.config.hiddenAccounts.includes(asset.account));
            if (!isFilteredOut) {
                if (!accountTotals[asset.account]) {
                    accountTotals[asset.account] = 0;
                }
                accountTotals[asset.account] += asset.amount;
            }
        }
    });
    
    // 分离正资产和负资产
    const positiveAssets = {};
    const negativeAssets = {};
    
    Object.keys(accountTotals).forEach(account => {
        const value = accountTotals[account];
        if (value >= 0) {
            positiveAssets[account] = value;
        } else {
            negativeAssets[account] = Math.abs(value); // 取绝对值用于显示
        }
    });
    
    // 计算正资产和负资产的总和
    const totalPositive = Object.values(positiveAssets).reduce((sum, value) => sum + value, 0);
    const totalNegative = Object.values(negativeAssets).reduce((sum, value) => sum + value, 0);
    const totalAssets = totalPositive + totalNegative; // 总资产（净值）
    
    // 定义颜色
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
                   '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];
    
    // 获取所有唯一账户名称，用于固定颜色分配（排除隐藏账户）
    const allAccounts = [...new Set(state.data.assets
        .filter(asset => !(state.data.config.hiddenAccounts && 
                          state.data.config.hiddenAccounts.includes(asset.account)))
        .map(a => a.account))];
    
    // 准备正资产数据
    const positiveAccounts = Object.keys(positiveAssets);
    const positiveData = positiveAccounts.map(account => positiveAssets[account] / unitValues[state.data.config.units.overview]);
    const positiveColors = positiveAccounts.map(account => {
        const index = allAccounts.indexOf(account);
        return colors[index % colors.length];
    });
    
    // 准备负资产数据
    const negativeAccounts = Object.keys(negativeAssets);
    const negativeData = negativeAccounts.map(account => negativeAssets[account] / unitValues[state.data.config.units.overview]);
    const negativeColors = negativeAccounts.map(account => {
        const index = allAccounts.indexOf(account);
        return colors[index % colors.length];
    });
    
    // 如果已有图表实例，先销毁
    if (state.chartInstances.pie) {
        state.chartInstances.pie.destroy();
    }
    
    // 处理没有负债的情况
    const hasDebt = negativeData.length > 0;
    
    // 根据是否有负债设置不同的环形图参数
    const innerRingParams = hasDebt 
        ? { cutout: '65%', radius: '75%' }  // 有负债时的内环参数
        : { cutout: '50%', radius: '90%' }; // 无负债时的内环参数（更宽）
        
    const outerRingParams = hasDebt 
        ? { cutout: '45%', radius: '95%' }  // 有负债时的外环参数
        : { cutout: '30%', radius: '95%' }; // 无负债时的外环参数（更宽）
    
    // 创建新图表，使用两个数据集来实现多系列饼图
    state.chartInstances.pie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            // 合并标签（只包含实际账户）
            labels: [...positiveAccounts, ...negativeAccounts],
            datasets: [
                {
                    // 正资产系列（内环）
                    label: '资产',
                    data: [
                        ...positiveData,
                        ...Array(negativeData.length).fill(0)
                    ],
                    backgroundColor: [
                        ...positiveColors,
                        ...Array(negativeData.length).fill('transparent')
                    ],
                    borderColor: '#fff',
                    borderWidth: 1,
                    cutout: innerRingParams.cutout,
                    radius: innerRingParams.radius
                },
                {
                    // 负资产系列（外环）
                    label: '负债',
                    data: hasDebt 
                        ? [
                            ...Array(positiveData.length).fill(0),
                            ...negativeData,
                            totalAssets > 0 ? (totalAssets - totalNegative) / unitValues[state.data.config.units.overview] : 0 // 透明参考块
                        ]
                        : [
                            ...Array(positiveData.length).fill(0),
                            ...negativeData.map(() => 0)
                        ],
                    backgroundColor: hasDebt 
                        ? [
                            ...Array(positiveData.length).fill('transparent'),
                            ...negativeColors,
                            'transparent' // 透明参考块
                        ]
                        : [
                            ...Array(positiveData.length).fill('transparent'),
                            ...negativeColors.map(() => 'transparent')
                        ],
                    borderColor: '#fff',
                    borderWidth: 1,
                    cutout: outerRingParams.cutout,
                    radius: outerRingParams.radius
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 300 // 减少动画时间以提高性能
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 10,
                        usePointStyle: true,
                        // 自定义图例标签，不包含透明参考块
                        generateLabels: function(chart) {
                            const legends = [];
                            
                            // 添加正资产图例
                            positiveAccounts.forEach((account, index) => {
                                legends.push({
                                    text: account,
                                    fillStyle: positiveColors[index],
                                    hidden: false,
                                    lineCap: undefined,
                                    lineDash: undefined,
                                    lineDashOffset: undefined,
                                    lineJoin: undefined,
                                    lineWidth: undefined,
                                    strokeStyle: undefined,
                                    pointStyle: 'circle',
                                    datasetIndex: 0,
                                    index: index
                                });
                            });
                            
                            // 添加负资产图例（不包括透明参考块）
                            negativeAccounts.forEach((account, index) => {
                                legends.push({
                                    text: account,
                                    fillStyle: negativeColors[index],
                                    hidden: false,
                                    lineCap: undefined,
                                    lineDash: undefined,
                                    lineDashOffset: undefined,
                                    lineJoin: undefined,
                                    lineWidth: undefined,
                                    strokeStyle: undefined,
                                    pointStyle: 'circle',
                                    datasetIndex: 1,
                                    index: index + positiveData.length // 调整索引以匹配数据位置
                                });
                            });
                            
                            return legends;
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // 处理透明参考块的工具提示
                            if (context.datasetIndex === 1 && context.dataIndex === positiveData.length + negativeData.length) {
                                // 这是外环的透明参考块，不显示工具提示
                                return null;
                            }
                            
                            const index = context.dataIndex;
                            const allLabels = [...positiveAccounts, ...negativeAccounts];
                            const accountName = allLabels[index];
                            const isNegative = negativeAccounts.includes(accountName);
                            const rawValue = isNegative ? -accountTotals[accountName] : accountTotals[accountName];
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = total > 0 
                                ? ((value / total) * 100).toFixed(1)
                                : '0';
                            // 显示原始值的正负符号
                            const displayValue = rawValue >= 0 
                                ? value.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })
                                : '-' + value.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            return `${accountName}: ${displayValue} ${state.data.config.units.overview} (${percentage}%)`;
                        }
                    }
                },
                // 为饼图配置数据标签插件
                datalabels: {
                    // 只对第一个数据集（外环/正资产）显示标签
                    display: function(context) {
                        // 只在第一个数据集（外环）显示标签
                        if (context.datasetIndex !== 0) {
                            return false;
                        }
                        
                        // 只在较大的扇区显示标签（占比大于5%）
                        const value = context.dataset.data[context.dataIndex];
                        const total = context.dataset.data.reduce((acc, val) => acc + (val || 0), 0);
                        const percentage = total > 0 ? (value / total) * 100 : 0;
                        return percentage > 5;
                    },
                    formatter: function(value, context) {
                        // 获取账户名称和原始值
                        const index = context.dataIndex;
                        const allLabels = [...positiveAccounts, ...negativeAccounts];
                        const accountName = allLabels[index];
                        const isNegative = negativeAccounts.includes(accountName);
                        
                        // 获取原始值（未经过单位转换的）
                        const rawValue = isNegative ? -accountTotals[accountName] : accountTotals[accountName];
                        
                        // 计算百分比
                        const total = context.dataset.data.reduce((acc, val) => acc + (val || 0), 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                        
                        // 格式化金额（根据设置决定是否显示小数点）
                        let formattedValue;
                        if (state.data.config.showDecimal) {
                            // 根据单位进行格式化（带小数点）
                            const unit = state.data.config.units.overview;
                            if (unit === "亿") {
                                formattedValue = (rawValue / unitValues["亿"]).toFixed(2) + '亿';
                            } else if (unit === "千万") {
                                formattedValue = (rawValue / unitValues["千万"]).toFixed(2) + '千万';
                            } else if (unit === "百万") {
                                formattedValue = (rawValue / unitValues["百万"]).toFixed(2) + '百万';
                            } else if (unit === "十万") {
                                formattedValue = (rawValue / unitValues["十万"]).toFixed(2) + '十万';
                            } else if (unit === "万") {
                                formattedValue = (rawValue / unitValues["万"]).toFixed(2) + '万';
                            } else if (unit === "千") {
                                formattedValue = (rawValue / unitValues["千"]).toFixed(2) + '千';
                            } else {
                                // 对于"元"单位，使用千分位符格式
                                formattedValue = rawValue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        } else {
                            // 不显示小数点，使用整数格式
                            const unit = state.data.config.units.overview;
                            if (unit === "亿") {
                                formattedValue = Math.round(rawValue / unitValues["亿"]) + '亿';
                            } else if (unit === "千万") {
                                formattedValue = Math.round(rawValue / unitValues["千万"]) + '千万';
                            } else if (unit === "百万") {
                                formattedValue = Math.round(rawValue / unitValues["百万"]) + '百万';
                            } else if (unit === "十万") {
                                formattedValue = Math.round(rawValue / unitValues["十万"]) + '十万';
                            } else if (unit === "万") {
                                formattedValue = Math.round(rawValue / unitValues["万"]) + '万';
                            } else if (unit === "千") {
                                formattedValue = Math.round(rawValue / unitValues["千"]) + '千';
                            } else {
                                // 对于"元"单位，使用千分位符格式
                                formattedValue = Math.round(rawValue).toLocaleString();
                            }
                        }
                        
                        // 返回格式化的标签文本（金额+百分比）
                        return `${formattedValue}\n${percentage}%`;
                    },
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    textAlign: 'center',
                    // 直接将标签放在色块上
                    anchor: 'center',
                    align: 'center',
                    offset: 0,
                    borderRadius: 4,
                    backgroundColor: function(context) {
                        // 使用扇区的颜色作为标签背景色，但稍微加深以提高可读性
                        const color = context.dataset.backgroundColor[context.dataIndex];
                        // 简单的颜色加深处理
                        return color.replace('0.2)', '0.8)');
                    },
                    padding: {
                        top: 4,
                        bottom: 4,
                        left: 6,
                        right: 6
                    }
                }
            }
        }
    });
}

// 渲染柱状图
function renderBarChart() {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    // 获取最新日期
    const dates = [...new Set(state.data.assets.map(a => a.date))].sort();
    const latestDate = dates[dates.length - 1];
    
    // 计算各账户在最新日期的资产总和（排除隐藏账户）
    const accountTotals = {};
    state.data.assets.forEach(asset => {
        // 只考虑最新日期的资产记录
        if (asset.date === latestDate) {
            // 检查账户是否被筛选掉或隐藏
            const isFilteredOut = (state.data.config.filteredAccounts && 
                                 state.data.config.filteredAccounts.includes(asset.account)) ||
                                 (state.data.config.hiddenAccounts && 
                                 state.data.config.hiddenAccounts.includes(asset.account));
            if (!isFilteredOut) {
                if (!accountTotals[asset.account]) {
                    accountTotals[asset.account] = 0;
                }
                accountTotals[asset.account] += asset.amount;
            }
        }
    });
    
    // 按资产价值排序，显示前10个账户
    const sortedAccounts = Object.entries(accountTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // 限制最多显示10个账户
    
    const accounts = sortedAccounts.map(item => item[0]);
    const totals = sortedAccounts.map(item => item[1] / unitValues[state.data.config.units.overview]);
    
    // 定义颜色
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
                   '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];
    
    // 获取所有唯一账户名称，用于固定颜色分配（排除隐藏账户）
    const allAccounts = [...new Set(state.data.assets
        .filter(asset => !(state.data.config.hiddenAccounts && 
                          state.data.config.hiddenAccounts.includes(asset.account)))
        .map(a => a.account))];
    
    // 使用固定的颜色分配方式
    const backgroundColors = accounts.map(account => {
        const index = allAccounts.indexOf(account);
        return colors[index % colors.length];
    });
    
    const borderColors = accounts.map(account => {
        const index = allAccounts.indexOf(account);
        return colors[index % colors.length];
    });
    
    // 如果已有图表实例，先销毁
    if (state.chartInstances.bar) {
        state.chartInstances.bar.destroy();
    }
    
    // 创建新图表
    state.chartInstances.bar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: accounts,
            datasets: [{
                label: '资产价值 (' + state.data.config.units.overview + ')',
                data: totals,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 300 // 减少动画时间以提高性能
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const accountName = accounts[index];
                            const rawValue = accountTotals[accountName];
                            const value = context.parsed.y || 0;
                            // 显示原始值的正负符号
                            const displayValue = rawValue >= 0 
                                ? value.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })
                                : '-' + value.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            return `${accountName}: ${displayValue} ${state.data.config.units.overview}`;
                        }
                    }
                },
                // 只在柱状图上添加数据标签
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: function(value) {
                        // 确保使用与设置中一致的单位
                        const unit = state.data.config.units.overview;
                        const unitValue = unitValues[unit];
                        const actualValue = value * unitValue;
                        
                        // 根据是否显示小数点来格式化数值
                        if (state.data.config.showDecimal) {
                            // 根据单位进行格式化（带小数点）
                            if (unit === "亿") {
                                return (actualValue / unitValues["亿"]).toFixed(2) + '亿';
                            } else if (unit === "千万") {
                                return (actualValue / unitValues["千万"]).toFixed(2) + '千万';
                            } else if (unit === "百万") {
                                return (actualValue / unitValues["百万"]).toFixed(2) + '百万';
                            } else if (unit === "十万") {
                                return (actualValue / unitValues["十万"]).toFixed(2) + '十万';
                            } else if (unit === "万") {
                                return (actualValue / unitValues["万"]).toFixed(2) + '万';
                            } else if (unit === "千") {
                                return (actualValue / unitValues["千"]).toFixed(2) + '千';
                            } else {
                                // 对于"元"单位，使用千分位符格式
                                return actualValue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        } else {
                            // 不显示小数点，使用整数格式
                            if (unit === "亿") {
                                return Math.round(actualValue / unitValues["亿"]) + '亿';
                            } else if (unit === "千万") {
                                return Math.round(actualValue / unitValues["千万"]) + '千万';
                            } else if (unit === "百万") {
                                return Math.round(actualValue / unitValues["百万"]) + '百万';
                            } else if (unit === "十万") {
                                return Math.round(actualValue / unitValues["十万"]) + '十万';
                            } else if (unit === "万") {
                                return Math.round(actualValue / unitValues["万"]) + '万';
                            } else if (unit === "千") {
                                return Math.round(actualValue / unitValues["千"]) + '千';
                            } else {
                                // 对于"元"单位，使用千分位符格式
                                return Math.round(actualValue).toLocaleString();
                            }
                        }
                    },
                    color: '#374151', // 文字颜色
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    // 限制Y轴范围，避免因资产差异过大导致图表过高
                    suggestedMax: Math.max(...totals) * 1.1 || 100,
                    ticks: {
                        callback: function(value) {
                            // 格式化Y轴标签，适配当前单位设置
                            const currentUnit = state.data.config.units.overview;
                            const baseValue = unitValues[currentUnit];
                            
                            const yiValue = unitValues["亿"] / baseValue;
                            const qianWanValue = unitValues["千万"] / baseValue;
                            const baiWanValue = unitValues["百万"] / baseValue;
                            const shiWanValue = unitValues["十万"] / baseValue;
                            const wanValue = unitValues["万"] / baseValue;
                            const qianValue = unitValues["千"] / baseValue;
                            
                            if (Math.abs(value) >= yiValue) {
                                return (value / yiValue).toFixed(1) + '亿';
                            } else if (Math.abs(value) >= qianWanValue) {
                                return (value / qianWanValue).toFixed(1) + '千万';
                            } else if (Math.abs(value) >= baiWanValue) {
                                return (value / baiWanValue).toFixed(1) + '百万';
                            } else if (Math.abs(value) >= shiWanValue) {
                                return (value / shiWanValue).toFixed(1) + '十万';
                            } else if (Math.abs(value) >= wanValue) {
                                return (value / wanValue).toFixed(1) + '万';
                            } else if (Math.abs(value) >= qianValue) {
                                return (value / qianValue).toFixed(1) + '千';
                            }
                            return value;
                        }
                    }
                }
            }
        }
    });
}

// 渲染快照列表
function renderSnapshotList() {
    const snapshotList = document.getElementById('snapshotList');
    snapshotList.innerHTML = '';
    
    // 获取最近的记录日期
    const dates = [...new Set(state.data.assets.map(a => a.date))].sort().reverse();
    const latestDate = dates[0];
    
    if (!latestDate) {
        snapshotList.innerHTML = '<div class="text-center py-4 text-gray-500">暂无资产数据</div>';
        return;
    }
    
    // 获取该日期的资产快照
    const snapshot = state.data.assets.filter(a => a.date === latestDate);
    
    // 按金额排序，显示资产最多的在前面
    snapshot.sort((a, b) => b.amount - a.amount);
    
    snapshot.forEach(asset => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex justify-between items-center p-2 border-b';
        itemDiv.innerHTML = `
            <div>
                <div class="font-medium">${asset.account}</div>
                <div class="text-sm text-gray-500">${asset.date}</div>
            </div>
            <div class="text-right">
                <div class="font-medium">${formatAmountForDisplay(asset.amount, state.data.config.units.summary)} ${state.data.config.units.summary}</div>
                ${asset.note ? `<div class="text-sm text-gray-500">${asset.note}</div>` : ''}
            </div>
        `;
        snapshotList.appendChild(itemDiv);
    });
}

// 渲染设置页面
function renderSettingsPage() {
    // 显示设置
    document.getElementById('showNotesCheckbox').checked = state.data.config.showNotes;
    document.getElementById('showDecimalCheckbox').checked = state.data.config.showDecimal;
    document.getElementById('thousandsSeparatorCheckbox').checked = state.data.config.useThousandsSeparator;
    
    // 单位设置
    renderUnitButtons('recordUnits', state.data.config.units.record, 'record');
    renderUnitButtons('overviewUnits', state.data.config.units.overview, 'overview');
    renderUnitButtons('summaryUnits', state.data.config.units.summary, 'summary');
    
    // 账户管理
    renderAccountsManagement();
    
    // 历史编辑器
    renderHistoryEditor();
}

// 渲染单位按钮
function renderUnitButtons(containerId, activeUnit, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    units.forEach(unit => {
        const button = document.createElement('button');
        button.className = `px-2 py-1 text-xs rounded unit-btn ${unit === activeUnit ? 'active' : 'bg-gray-200'}`;
        button.textContent = unit;
        button.addEventListener('click', () => {
            state.data.config.units[type] = unit;
            renderUnitButtons(containerId, unit, type);
            saveData(); // 自动保存单位设置
            if (state.currentView === 'record') {
                renderRecordPage();
            } else if (state.currentView === 'overview') {
                renderOverviewPage();
            } else if (state.currentView === 'settings') {
                // 如果在设置页面，需要更新相关显示
                if (type === 'summary') {
                    updateOverviewTotal();
                } else if (type === 'overview') {
                    // 如果更改了总览单位，需要重新渲染图表
                    renderOverviewPage();
                }
            }
        });
        container.appendChild(button);
    });
}

// 渲染账户管理
function renderAccountsManagement() {
    const container = document.getElementById('accountsManagement');
    container.innerHTML = '';
    
    state.data.config.accounts.forEach((account, index) => {
        // 检查账户是否被隐藏
        const isHidden = state.data.config.hiddenAccounts && 
                        state.data.config.hiddenAccounts.includes(account);
        
        const accountDiv = document.createElement('div');
        accountDiv.className = 'flex items-center justify-between p-2 bg-gray-50 rounded';
        accountDiv.draggable = true;
        accountDiv.dataset.index = index;
        accountDiv.addEventListener('dragstart', handleDragStart);
        accountDiv.addEventListener('dragover', handleDragOver);
        accountDiv.addEventListener('drop', handleDrop);
        accountDiv.addEventListener('dragend', handleDragEnd);
        accountDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-grip-lines mr-2 text-gray-400 cursor-move drag-handle"></i>
                <span class="account-name">${account}</span>
            </div>
            <div class="flex items-center space-x-2">
                <button class="edit-account px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600" 
                        data-index="${index}">
                    编辑
                </button>
                <button class="toggle-account px-2 py-1 ${isHidden ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white text-xs rounded" 
                        data-index="${index}" data-hidden="${isHidden}">
                    ${isHidden ? '显示' : '隐藏'}
                </button>
                <button class="delete-account px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600" data-index="${index}">
                    删除
                </button>
            </div>
        `;
        container.appendChild(accountDiv);
    });
    
    // 添加删除事件监听器
    document.querySelectorAll('.delete-account').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            deleteAccount(index);
        });
    });
    
    // 添加切换隐藏/显示事件监听器
    document.querySelectorAll('.toggle-account').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            const isHidden = e.target.dataset.hidden === 'true';
            toggleAccountVisibility(index, isHidden);
        });
    });
    
    // 添加编辑事件监听器
    document.querySelectorAll('.edit-account').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            editAccountName(index);
        });
    });
}

// 拖拽处理函数
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    e.preventDefault();
    if (draggedItem !== this) {
        const fromIndex = parseInt(draggedItem.dataset.index);
        const toIndex = parseInt(this.dataset.index);
        
        // 重新排序数组
        const movedAccount = state.data.config.accounts[fromIndex];
        state.data.config.accounts.splice(fromIndex, 1);
        state.data.config.accounts.splice(toIndex, 0, movedAccount);
        
        // 重新渲染账户列表
        renderAccountsManagement();
        
        // 自动保存设置
        saveData();
    }
    return false;
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
}

// 删除账户
function deleteAccount(index) {
    const accountName = state.data.config.accounts[index];
    if (confirm(`确定要删除账户 "${accountName}" 吗？这将永久删除该账户及其所有历史记录！`)) {
        // 从账户列表中删除
        state.data.config.accounts.splice(index, 1);
        
        // 从资产数据中删除该账户的所有记录
        state.data.assets = state.data.assets.filter(asset => asset.account !== accountName);
        
        // 从隐藏账户列表中删除（如果存在）
        if (state.data.config.hiddenAccounts) {
            const hiddenIndex = state.data.config.hiddenAccounts.indexOf(accountName);
            if (hiddenIndex > -1) {
                state.data.config.hiddenAccounts.splice(hiddenIndex, 1);
            }
        }
        
        // 从筛选账户列表中删除（如果存在）
        if (state.data.config.filteredAccounts) {
            const filteredIndex = state.data.config.filteredAccounts.indexOf(accountName);
            if (filteredIndex > -1) {
                state.data.config.filteredAccounts.splice(filteredIndex, 1);
            }
        }
        
        // 重新渲染相关界面
        renderAccountsManagement();
        if (state.currentView === 'record') {
            renderRecordPage();
        } else if (state.currentView === 'overview') {
            renderOverviewPage();
        } else if (state.currentView === 'settings') {
            renderHistoryEditor();
        }

        // 保存更新到localStorage
        saveData(); // 自动保存账户设置
        saveData();
        
        showToast('账户及其所有数据已删除');
    }
}

// 切换账户可见性
function toggleAccountVisibility(index, isCurrentlyHidden) {
    const account = state.data.config.accounts[index];
    
    // 初始化隐藏账户数组（如果不存在）
    if (!state.data.config.hiddenAccounts) {
        state.data.config.hiddenAccounts = [];
    }
    
    if (isCurrentlyHidden) {
        // 当前是隐藏状态，需要显示
        const hiddenIndex = state.data.config.hiddenAccounts.indexOf(account);
        if (hiddenIndex > -1) {
            state.data.config.hiddenAccounts.splice(hiddenIndex, 1);
        }
    } else {
        // 当前是显示状态，需要隐藏
        if (!state.data.config.hiddenAccounts.includes(account)) {
            state.data.config.hiddenAccounts.push(account);
        }
    }
    
    // 重新渲染账户管理界面
    renderAccountsManagement();
    
    // 如果在总览页面，需要重新渲染图表
    if (state.currentView === 'overview') {
        renderOverviewPage();
    }

    // 自动保存设置
    saveData();

    showToast(isCurrentlyHidden ? '账户已显示' : '账户已隐藏');
}

// 编辑账户名称
function editAccountName(index) {
    const oldName = state.data.config.accounts[index];
    const newName = prompt('请输入新的账户名称:', oldName);
    
    if (newName && newName.trim() && newName !== oldName) {
        // 更新账户名称
        state.data.config.accounts[index] = newName.trim();
        
        // 更新资产数据中的账户名称
        state.data.assets.forEach(asset => {
            if (asset.account === oldName) {
                asset.account = newName.trim();
            }
        });
        
        // 更新隐藏账户列表中的名称
        if (state.data.config.hiddenAccounts) {
            const hiddenIndex = state.data.config.hiddenAccounts.indexOf(oldName);
            if (hiddenIndex > -1) {
                state.data.config.hiddenAccounts[hiddenIndex] = newName.trim();
            }
        }
        
        // 更新筛选账户列表中的名称
        if (state.data.config.filteredAccounts) {
            const filteredIndex = state.data.config.filteredAccounts.indexOf(oldName);
            if (filteredIndex > -1) {
                state.data.config.filteredAccounts[filteredIndex] = newName.trim();
            }
        }
        
        // 重新渲染相关界面
        renderAccountsManagement();
        if (state.currentView === 'record') {
            renderRecordPage();
        } else if (state.currentView === 'overview') {
            renderOverviewPage();
        } else if (state.currentView === 'settings') {
            renderHistoryEditor();
        }

        // 自动保存设置
        saveData();

        showToast('账户名称已更新');
    }
}

// 添加账户
function addAccount() {
    const accountName = prompt('请输入新账户名称:');
    if (accountName && accountName.trim()) {
        state.data.config.accounts.push(accountName.trim());
        renderAccountsManagement();
        saveData(); // 自动保存账户设置
        showToast('账户已添加');
    }
}

// 渲染历史编辑器
function renderHistoryEditor() {
    const container = document.getElementById('historyEditor');
    if (state.data.assets.length === 0) {
        container.innerHTML = '<div class="p-3 bg-gray-50 border-b font-medium">暂无历史数据</div>';
        return;
    }
    
    // 按日期分组
    const groupedAssets = {};
    state.data.assets.forEach(asset => {
        if (!groupedAssets[asset.date]) {
            groupedAssets[asset.date] = [];
        }
        groupedAssets[asset.date].push(asset);
    });
    
    container.innerHTML = '';
    Object.keys(groupedAssets).sort().reverse().forEach(date => {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'border-b';
        dateDiv.innerHTML = `
            <div class="p-3 bg-gray-100 font-medium cursor-pointer flex justify-between items-center">
                <span>${date}</span>
                <i class="fas fa-chevron-down transform rotate-180"></i>
            </div>
            <div class="history-details p-3">
                ${groupedAssets[date].map(asset => `
                    <div class="grid grid-cols-12 gap-2 mb-2 items-center">
                        <div class="col-span-3 text-sm">${asset.account}</div>
                        <input type="number" value="${asset.amount}" 
                            class="col-span-4 px-2 py-1 border rounded text-sm asset-amount"
                            data-date="${asset.date}" data-account="${asset.account}">
                        <input type="text" value="${asset.note}" 
                            class="col-span-4 px-2 py-1 border rounded text-sm asset-note"
                            data-date="${asset.date}" data-account="${asset.account}">
                        <button class="col-span-1 text-red-500 delete-asset-btn" 
                            data-date="${asset.date}" data-account="${asset.account}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(dateDiv);
    });
    
    // 添加展开/收起功能
    document.querySelectorAll('.history-details').forEach((el, index) => {
        const header = el.previousElementSibling;
        header.addEventListener('click', () => {
            el.classList.toggle('hidden');
            const icon = header.querySelector('i');
            icon.classList.toggle('rotate-180');
        });
        
        // 默认展开最新日期
        if (index === 0) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
    
    // 添加删除事件监听器
    document.querySelectorAll('.delete-asset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const date = e.target.closest('button').dataset.date;
            const account = e.target.closest('button').dataset.account;
            deleteAsset(date, account);
        });
    });
}

// 删除资产记录
function deleteAsset(date, account) {
    if (confirm(`确定要删除 ${date} 的 ${account} 记录吗？`)) {
        state.data.assets = state.data.assets.filter(
            a => !(a.date === date && a.account === account)
        );
        renderHistoryEditor();
        showToast('记录已删除');
    }
}

// 保存历史更改
function saveHistoryChanges() {
    // 更新资产金额和备注
    document.querySelectorAll('.asset-amount').forEach(input => {
        const date = input.dataset.date;
        const account = input.dataset.account;
        const amount = parseFloat(input.value) || 0;
        
        const asset = state.data.assets.find(a => 
            a.date === date && a.account === account
        );
        if (asset) {
            asset.amount = amount;
        }
    });
    
    document.querySelectorAll('.asset-note').forEach(input => {
        const date = input.dataset.date;
        const account = input.dataset.account;
        const note = input.value;
        
        const asset = state.data.assets.find(a => 
            a.date === date && a.account === account
        );
        if (asset) {
            asset.note = note;
        }
    });

    // 保存到localStorage
    saveData();

    showToast('更改已保存');
}

// 切换备注显示
function toggleNotesDisplay(e) {
    state.data.config.showNotes = e.target.checked;
    saveData(); // 自动保存设置
    if (state.currentView === 'record') {
        renderRecordPage();
    }
}

// 切换小数点显示
function toggleDecimalDisplay(e) {
    state.data.config.showDecimal = e.target.checked;
    saveData(); // 自动保存设置
    if (state.currentView === 'record') {
        renderRecordPage();
    }
}

// 切换千分位符显示（仅对总计金额）
function toggleThousandsSeparator(e) {
    state.data.config.useThousandsSeparator = e.target.checked;
    saveData(); // 自动保存设置
    // 更新总计显示
    updateTotal();
    // 如果在总览页面，更新总览页总计显示
    if (state.currentView === 'overview') {
        updateOverviewTotal();
    }
}

// 加载数据
function loadData() {
    // 尝试从localStorage加载数据
    const savedData = localStorage.getItem('assetTrackerData');
    if (savedData) {
        try {
            state.data = JSON.parse(savedData);
        } catch (e) {
            console.error('解析保存的数据失败', e);
        }
    }
}

// 保存数据到localStorage
function saveData() {
    // 验证数据
    if (!state.data.assets.length && !state.data.config.accounts.length) {
        showToast('没有数据可保存', 'error');
        return;
    }
    
    // 保存到localStorage
    localStorage.setItem('assetTrackerData', JSON.stringify(state.data));
    
    showToast('数据已保存');
}

// 导出数据到文件
function exportData() {
    // 验证数据
    if (!state.data.assets.length && !state.data.config.accounts.length) {
        showToast('没有数据可导出', 'error');
        return;
    }
    
    // 生成带时间戳的文件名
    const timestamp = new Date().toISOString().replace(/[:\-]/g, '').slice(0, 12);
    const filename = `资产记录_${timestamp}.json`;
    
    // 创建数据副本用于导出
    const dataToExport = JSON.parse(JSON.stringify(state.data));
    
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
                if (validateAssetData(data)) {
                    state.data = data;
                    localStorage.setItem('assetTrackerData', JSON.stringify(data));
                    renderRecordPage();
                    renderSettingsPage();
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

// 显示Toast提示
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    
    // 重置状态并准备显示
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg transition-all duration-300 ${
        type === 'error' ? 'bg-red-500' : 'bg-gray-800'
    } text-white translate-y-full opacity-0`;
    
    // 强制重绘
    void toast.offsetWidth;
    
    // 显示toast (同时移除translate和opacity)
    toast.classList.remove('translate-y-full', 'opacity-0');
    
    // 隐藏toast
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
    }, 3000);
}

// 填充上次数据到文本框（不保存）
function populateLastData() {
    const currentDate = document.getElementById('currentDate').textContent;
    
    // 查找最近一次有记录的日期（早于今天）
    let lastRecordDate = null;
    const earlierDates = [...new Set(state.data.assets.filter(a => a.date < currentDate).map(a => a.date))].sort();
    
    // 查找最近一次记录日期
    if (earlierDates.length > 0) {
        lastRecordDate = earlierDates[earlierDates.length - 1];
    }
    
    // 如果没有历史记录，提示用户
    if (!lastRecordDate) {
        showToast('没有历史数据可填充', 'error');
        return;
    }
    
    // 为每个账户填充数据
    state.data.config.accounts.forEach(account => {
        // 查找最近一次该账户的记录
        const accountRecords = state.data.assets
            .filter(a => a.account === account && a.date === lastRecordDate)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
            
        if (accountRecords.length > 0) {
            const lastAsset = accountRecords[0];
            
            // 填充金额输入框
            const amountInput = document.querySelector(`.amount-input[data-account="${account}"]`);
            if (amountInput) {
                amountInput.value = formatAmountForDisplay(lastAsset.amount, state.data.config.units.record);
            }
            
            // 填充备注输入框（如果有显示）
            if (state.data.config.showNotes) {
                const noteInput = document.querySelector(`.note-input[data-account="${account}"]`);
                if (noteInput) {
                    noteInput.value = lastAsset.note || '';
                }
            }
        }
    });
    
    // 更新总计
    updateTotal();
    
    showToast(`已填充${lastRecordDate}的数据`);
}

// 渲染堆叠折线图（面积图）
function renderStackedAreaChart() {
    const ctx = document.getElementById('stackedAreaChart').getContext('2d');
    
    // 准备趋势数据
    let filteredAssets = state.data.assets;
    
    // 应用时间筛选（与趋势图使用相同的筛选）
    const period = document.getElementById('trendPeriodSelect').value;
    if (period !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case '5y':
                startDate = new Date(now.setFullYear(now.getFullYear() - 5));
                break;
            case '3y':
                startDate = new Date(now.setFullYear(now.getFullYear() - 3));
                break;
            case '1y':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            case '6m':
                startDate = new Date(now.setMonth(now.getMonth() - 6));
                break;
            case '3m':
                startDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case '1m':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case '1w':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
        }
        
        filteredAssets = filteredAssets.filter(asset => new Date(asset.date) >= startDate);
    }
    
    // 过滤掉隐藏的账户和被筛选掉的账户
    if (state.data.config.hiddenAccounts && state.data.config.hiddenAccounts.length > 0) {
        filteredAssets = filteredAssets.filter(asset => 
            !state.data.config.hiddenAccounts.includes(asset.account)
        );
    }
    
    if (state.data.config.filteredAccounts && state.data.config.filteredAccounts.length > 0) {
        filteredAssets = filteredAssets.filter(asset => 
            !state.data.config.filteredAccounts.includes(asset.account)
        );
    }
    
    // 按日期和账户分组并计算每日各账户资产
    const groupedByDateAndAccount = {};
    filteredAssets.forEach(asset => {
        if (!groupedByDateAndAccount[asset.date]) {
            groupedByDateAndAccount[asset.date] = {};
        }
        if (!groupedByDateAndAccount[asset.date][asset.account]) {
            groupedByDateAndAccount[asset.date][asset.account] = 0;
        }
        groupedByDateAndAccount[asset.date][asset.account] += asset.amount;
    });
    
    // 获取所有日期并排序
    const dates = Object.keys(groupedByDateAndAccount).sort();
    
    // 获取所有账户（过滤掉隐藏账户）
    const accounts = [...new Set(filteredAssets.map(a => a.account))];
    
    // 优化：对大量数据进行采样
    const maxDataPoints = 50; // 限制最多显示50个数据点
    let sampledDates = dates;
    let sampledGroupedData = groupedByDateAndAccount;
    
    if (dates.length > maxDataPoints) {
        // 数据采样，保持首尾和关键变化点
        const step = Math.ceil(dates.length / maxDataPoints);
        sampledDates = [];
        sampledGroupedData = {};
        
        for (let i = 0; i < dates.length; i += step) {
            const date = dates[i];
            sampledDates.push(date);
            sampledGroupedData[date] = groupedByDateAndAccount[date];
        }
        
        // 确保包含最后一个数据点
        if (!sampledDates.includes(dates[dates.length - 1])) {
            sampledDates.push(dates[dates.length - 1]);
            sampledGroupedData[dates[dates.length - 1]] = groupedByDateAndAccount[dates[dates.length - 1]];
        }
    }
    
    // 为每个账户准备数据，用于堆叠面积图
    const datasets = accounts.map((account, index) => {
        const color = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
        ][index % 10];
        
        return {
            label: account,
            data: sampledDates.map(date => {
                const amount = sampledGroupedData[date][account] || 0;
                return amount / unitValues[state.data.config.units.overview];
            }),
            borderColor: color,
            backgroundColor: color.replace(')', ', 0.2)').replace('rgb', 'rgba'),
            borderWidth: 2,
            fill: true, // 填充区域形成面积图
            tension: 0.3, // 平滑曲线
            pointRadius: dates.length > 30 ? 0 : 3, // 数据点过多时隐藏点标记
            pointHoverRadius: 5
        };
    });
    
    // 如果已有图表实例，先销毁
    if (state.chartInstances.stackedArea) {
        state.chartInstances.stackedArea.destroy();
    }
    
    // 创建新图表
    state.chartInstances.stackedArea = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sampledDates,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 300 // 减少动画时间以提高性能
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 10,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            return `${label}: ${value.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} ${state.data.config.units.overview}`;
                        }
                    }
                },
                // 禁用数据标签插件
                datalabels: {
                    display: false
                }
            },
            scales: {
                y: {
                    stacked: true, // 启用堆叠
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            // 格式化Y轴标签，适配当前单位设置
                            const currentUnit = state.data.config.units.overview;
                            const baseValue = unitValues[currentUnit];
                            
                            const yiValue = unitValues["亿"] / baseValue;
                            const qianWanValue = unitValues["千万"] / baseValue;
                            const baiWanValue = unitValues["百万"] / baseValue;
                            const shiWanValue = unitValues["十万"] / baseValue;
                            const wanValue = unitValues["万"] / baseValue;
                            const qianValue = unitValues["千"] / baseValue;
                            
                            if (Math.abs(value) >= yiValue) {
                                return (value / yiValue).toFixed(1) + '亿';
                            } else if (Math.abs(value) >= qianWanValue) {
                                return (value / qianWanValue).toFixed(1) + '千万';
                            } else if (Math.abs(value) >= baiWanValue) {
                                return (value / baiWanValue).toFixed(1) + '百万';
                            } else if (Math.abs(value) >= shiWanValue) {
                                return (value / shiWanValue).toFixed(1) + '十万';
                            } else if (Math.abs(value) >= wanValue) {
                                return (value / wanValue).toFixed(1) + '万';
                            } else if (Math.abs(value) >= qianValue) {
                                return (value / qianValue).toFixed(1) + '千';
                            }
                            return value;
                        }
                    }
                },
                x: {
                    stacked: true // X轴也启用堆叠
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            hover: {
                mode: 'nearest',
                intersect: false
            }
        }
    });
}