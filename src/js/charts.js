// 图表渲染模块

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

// 渲染趋势图
function renderTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const period = document.getElementById('trendPeriodSelect').value;
    const useLogScale = document.getElementById('logScaleCheckbox').checked;
    
    // 准备趋势数据
    let filteredAssets = window.state.data.assets;
    
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
    if (window.state.data.config.hiddenAccounts && window.state.data.config.hiddenAccounts.length > 0) {
        filteredAssets = filteredAssets.filter(asset => 
            !window.state.data.config.hiddenAccounts.includes(asset.account)
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
                if (window.state.data.config.filteredAccounts && 
                    window.state.data.config.filteredAccounts.includes(account)) {
                    return null; // 隐藏被筛选掉的账户
                }
                return amount / window.unitValues[window.state.data.config.units.overview];
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
            if (!(window.state.data.config.filteredAccounts && 
                  window.state.data.config.filteredAccounts.includes(account))) {
                const amount = sampledGroupedData[date][account] || 0;
                total += amount;
            }
        });
        return total / window.unitValues[window.state.data.config.units.overview];
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
        order: 1,
        // 为合计线设置特殊的数据标签配置
        datalabels: {
            color: '#000000', // 黑色字体
            font: {
                weight: 'bold',
                size: 10
            },
            textAlign: 'center',
            anchor: 'center',
            align: 'top',
            offset: 2,
            borderRadius: 2,
            backgroundColor: null, // 不使用背景色
            padding: {
                top: 2,
                bottom: 2,
                left: 3,
                right: 3
            }
        }
    });
    
    // 如果已有图表实例，先销毁
    if (window.state.chartInstances.trend) {
        window.state.chartInstances.trend.destroy();
    }
    
    // 创建新图表
    window.state.chartInstances.trend = new Chart(ctx, {
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
                            })} ${window.state.data.config.units.overview} (${percentage}%)`;
                        }
                    }
                },
                // 为折线图配置数据标签插件
                datalabels: {
                    // 只在数据点较少时显示标签（避免图表过于拥挤）
                    display: function(context) {
                        const chart = context.chart;
                        const meta = chart.getDatasetMeta(context.datasetIndex);
                        // 只在数据点数量较少时显示标签
                        return meta.data.length <= 20;
                    },
                    formatter: function(value, context) {
                        // 格式化金额（根据设置决定是否显示小数点）
                        if (window.state.data.config.showDecimal) {
                            // 根据单位进行格式化（带小数点）
                            const unit = window.state.data.config.units.overview;
                            if (unit === "亿") {
                                return (value * window.unitValues[unit] / window.unitValues["亿"]).toFixed(2) + '亿';
                            } else if (unit === "千万") {
                                return (value * window.unitValues[unit] / window.unitValues["千万"]).toFixed(2) + '千万';
                            } else if (unit === "百万") {
                                return (value * window.unitValues[unit] / window.unitValues["百万"]).toFixed(2) + '百万';
                            } else if (unit === "十万") {
                                return (value * window.unitValues[unit] / window.unitValues["十万"]).toFixed(2) + '十万';
                            } else if (unit === "万") {
                                return (value * window.unitValues[unit] / window.unitValues["万"]).toFixed(2) + '万';
                            } else if (unit === "千") {
                                return (value * window.unitValues[unit] / window.unitValues["千"]).toFixed(2) + '千';
                            } else {
                                // 对于"元"单位，使用千分位符格式
                                return value.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        } else {
                            // 不显示小数点，使用整数格式
                            const unit = window.state.data.config.units.overview;
                            if (unit === "亿") {
                                return Math.round(value * window.unitValues[unit] / window.unitValues["亿"]) + '亿';
                            } else if (unit === "千万") {
                                return Math.round(value * window.unitValues[unit] / window.unitValues["千万"]) + '千万';
                            } else if (unit === "百万") {
                                return Math.round(value * window.unitValues[unit] / window.unitValues["百万"]) + '百万';
                            } else if (unit === "十万") {
                                return Math.round(value * window.unitValues[unit] / window.unitValues["十万"]) + '十万';
                            } else if (unit === "万") {
                                return Math.round(value * window.unitValues[unit] / window.unitValues["万"]) + '万';
                            } else if (unit === "千") {
                                return Math.round(value * window.unitValues[unit] / window.unitValues["千"]) + '千';
                            } else {
                                // 对于"元"单位，使用千分位符格式
                                return Math.round(value).toLocaleString();
                            }
                        }
                    },
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 10
                    },
                    textAlign: 'center',
                    anchor: 'center',
                    align: 'top',
                    offset: 2,
                    borderRadius: 1,
                    backgroundColor: function(context) {
                        // 使用数据系列的颜色作为标签背景色，但加深以提高可读性
                        const color = context.dataset.borderColor;
                        // 简单的颜色加深处理
                        return color.replace('0.2)', '0.8)');
                    },
                    padding: {
                        top: 1,
                        bottom: 1,
                        left: 2,
                        right: 2
                    }
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
                            const currentUnit = window.state.data.config.units.overview;
                            const baseValue = window.unitValues[currentUnit];
                            
                            const yiValue = window.unitValues["亿"] / baseValue;
                            const qianWanValue = window.unitValues["千万"] / baseValue;
                            const baiWanValue = window.unitValues["百万"] / baseValue;
                            const shiWanValue = window.unitValues["十万"] / baseValue;
                            const wanValue = window.unitValues["万"] / baseValue;
                            const qianValue = window.unitValues["千"] / baseValue;
                            
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

// 渲染饼图
function renderPieChart() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    // 获取最新日期
    const dates = [...new Set(window.state.data.assets.map(a => a.date))].sort();
    const latestDate = dates[dates.length - 1];
    
    // 计算各账户在最新日期的资产总和（排除隐藏账户）
    const accountTotals = {};
    window.state.data.assets.forEach(asset => {
        // 只考虑最新日期的资产记录
        if (asset.date === latestDate) {
            // 检查账户是否被筛选掉或隐藏
            const isFilteredOut = (window.state.data.config.filteredAccounts && 
                                 window.state.data.config.filteredAccounts.includes(asset.account)) ||
                                 (window.state.data.config.hiddenAccounts && 
                                 window.state.data.config.hiddenAccounts.includes(asset.account));
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
    const allAccounts = [...new Set(window.state.data.assets
        .filter(asset => !(window.state.data.config.hiddenAccounts && 
                          window.state.data.config.hiddenAccounts.includes(asset.account)))
        .map(a => a.account))];
    
    // 准备正资产数据
    const positiveAccounts = Object.keys(positiveAssets);
    const positiveData = positiveAccounts.map(account => positiveAssets[account] / window.unitValues[window.state.data.config.units.overview]);
    const positiveColors = positiveAccounts.map(account => {
        const index = allAccounts.indexOf(account);
        return colors[index % colors.length];
    });
    
    // 准备负资产数据
    const negativeAccounts = Object.keys(negativeAssets);
    const negativeData = negativeAccounts.map(account => negativeAssets[account] / window.unitValues[window.state.data.config.units.overview]);
    const negativeColors = negativeAccounts.map(account => {
        const index = allAccounts.indexOf(account);
        return colors[index % colors.length];
    });
    
    // 如果已有图表实例，先销毁
    if (window.state.chartInstances.pie) {
        window.state.chartInstances.pie.destroy();
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
    window.state.chartInstances.pie = new Chart(ctx, {
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
                            totalAssets > 0 ? (totalAssets - totalNegative) / window.unitValues[window.state.data.config.units.overview] : 0 // 透明参考块
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
                            return `${accountName}: ${displayValue} ${window.state.data.config.units.overview} (${percentage}%)`;
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
                        if (window.state.data.config.showDecimal) {
                            // 根据单位进行格式化（带小数点）
                            const unit = window.state.data.config.units.overview;
                            if (unit === "亿") {
                                formattedValue = (rawValue / window.unitValues["亿"]).toFixed(2) + '亿';
                            } else if (unit === "千万") {
                                formattedValue = (rawValue / window.unitValues["千万"]).toFixed(2) + '千万';
                            } else if (unit === "百万") {
                                formattedValue = (rawValue / window.unitValues["百万"]).toFixed(2) + '百万';
                            } else if (unit === "十万") {
                                formattedValue = (rawValue / window.unitValues["十万"]).toFixed(2) + '十万';
                            } else if (unit === "万") {
                                formattedValue = (rawValue / window.unitValues["万"]).toFixed(2) + '万';
                            } else if (unit === "千") {
                                formattedValue = (rawValue / window.unitValues["千"]).toFixed(2) + '千';
                            } else {
                                // 对于"元"单位，使用千分位符格式
                                formattedValue = rawValue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        } else {
                            // 不显示小数点，使用整数格式
                            const unit = window.state.data.config.units.overview;
                            if (unit === "亿") {
                                formattedValue = Math.round(rawValue / window.unitValues["亿"]) + '亿';
                            } else if (unit === "千万") {
                                formattedValue = Math.round(rawValue / window.unitValues["千万"]) + '千万';
                            } else if (unit === "百万") {
                                formattedValue = Math.round(rawValue / window.unitValues["百万"]) + '百万';
                            } else if (unit === "十万") {
                                formattedValue = Math.round(rawValue / window.unitValues["十万"]) + '十万';
                            } else if (unit === "万") {
                                formattedValue = Math.round(rawValue / window.unitValues["万"]) + '万';
                            } else if (unit === "千") {
                                formattedValue = Math.round(rawValue / window.unitValues["千"]) + '千';
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
                    anchor: 'end',
                    align: 'center',
                    offset: 1,
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
    const dates = [...new Set(window.state.data.assets.map(a => a.date))].sort();
    const latestDate = dates[dates.length - 1];
    
    // 计算各账户在最新日期的资产总和（排除隐藏账户）
    const accountTotals = {};
    window.state.data.assets.forEach(asset => {
        // 只考虑最新日期的资产记录
        if (asset.date === latestDate) {
            // 检查账户是否被筛选掉或隐藏
            const isFilteredOut = (window.state.data.config.filteredAccounts && 
                                 window.state.data.config.filteredAccounts.includes(asset.account)) ||
                                 (window.state.data.config.hiddenAccounts && 
                                 window.state.data.config.hiddenAccounts.includes(asset.account));
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
    const totals = sortedAccounts.map(item => item[1] / window.unitValues[window.state.data.config.units.overview]);
    
    // 定义颜色
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
                   '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];
    
    // 获取所有唯一账户名称，用于固定颜色分配（排除隐藏账户）
    const allAccounts = [...new Set(window.state.data.assets
        .filter(asset => !(window.state.data.config.hiddenAccounts && 
                          window.state.data.config.hiddenAccounts.includes(asset.account)))
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
    if (window.state.chartInstances.bar) {
        window.state.chartInstances.bar.destroy();
    }
    
    // 创建新图表
    window.state.chartInstances.bar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: accounts,
            datasets: [{
                label: '资产价值 (' + window.state.data.config.units.overview + ')',
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
                            return `${accountName}: ${displayValue} ${window.state.data.config.units.overview}`;
                        }
                    }
                },
                // 只在柱状图上添加数据标签
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: function(value) {
                        // 确保使用与设置中一致的单位
                        const unit = window.state.data.config.units.overview;
                        const unitValue = window.unitValues[unit];
                        const actualValue = value * unitValue;
                        
                        // 根据是否显示小数点来格式化数值
                        if (window.state.data.config.showDecimal) {
                            // 根据单位进行格式化（带小数点）
                            if (unit === "亿") {
                                return (actualValue / window.unitValues["亿"]).toFixed(2) + '亿';
                            } else if (unit === "千万") {
                                return (actualValue / window.unitValues["千万"]).toFixed(2) + '千万';
                            } else if (unit === "百万") {
                                return (actualValue / window.unitValues["百万"]).toFixed(2) + '百万';
                            } else if (unit === "十万") {
                                return (actualValue / window.unitValues["十万"]).toFixed(2) + '十万';
                            } else if (unit === "万") {
                                return (actualValue / window.unitValues["万"]).toFixed(2) + '万';
                            } else if (unit === "千") {
                                return (actualValue / window.unitValues["千"]).toFixed(2) + '千';
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
                                return Math.round(actualValue / window.unitValues["亿"]) + '亿';
                            } else if (unit === "千万") {
                                return Math.round(actualValue / window.unitValues["千万"]) + '千万';
                            } else if (unit === "百万") {
                                return Math.round(actualValue / window.unitValues["百万"]) + '百万';
                            } else if (unit === "十万") {
                                return Math.round(actualValue / window.unitValues["十万"]) + '十万';
                            } else if (unit === "万") {
                                return Math.round(actualValue / window.unitValues["万"]) + '万';
                            } else if (unit === "千") {
                                return Math.round(actualValue / window.unitValues["千"]) + '千';
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
                            const currentUnit = window.state.data.config.units.overview;
                            const baseValue = window.unitValues[currentUnit];
                            
                            const yiValue = window.unitValues["亿"] / baseValue;
                            const qianWanValue = window.unitValues["千万"] / baseValue;
                            const baiWanValue = window.unitValues["百万"] / baseValue;
                            const shiWanValue = window.unitValues["十万"] / baseValue;
                            const wanValue = window.unitValues["万"] / baseValue;
                            const qianValue = window.unitValues["千"] / baseValue;
                            
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

// 渲染堆叠折线图（面积图）
function renderStackedAreaChart() {
    const ctx = document.getElementById('stackedAreaChart').getContext('2d');
    
    // 准备趋势数据
    let filteredAssets = window.state.data.assets;
    
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
    if (window.state.data.config.hiddenAccounts && window.state.data.config.hiddenAccounts.length > 0) {
        filteredAssets = filteredAssets.filter(asset => 
            !window.state.data.config.hiddenAccounts.includes(asset.account)
        );
    }
    
    if (window.state.data.config.filteredAccounts && window.state.data.config.filteredAccounts.length > 0) {
        filteredAssets = filteredAssets.filter(asset => 
            !window.state.data.config.filteredAccounts.includes(asset.account)
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
                return amount / window.unitValues[window.state.data.config.units.overview];
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
    if (window.state.chartInstances.stackedArea) {
        window.state.chartInstances.stackedArea.destroy();
    }
    
    // 创建新图表
    window.state.chartInstances.stackedArea = new Chart(ctx, {
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
                            })} ${window.state.data.config.units.overview}`;
                        }
                    }
                },
                // 为堆叠图配置数据标签插件
                datalabels: {
                    // 根据数据点数量动态调整标签显示策略
                    display: function(context) {
                        const chart = context.chart;
                        const meta = chart.getDatasetMeta(context.datasetIndex);
                        
                        // 获取当前数据集的所有数据点
                        const dataPoints = meta.data.length;
                        
                        // 数据点很少时全部显示，较多时只显示关键点
                        if (dataPoints <= 15) {
                            // 数据点很少，全部显示
                            return true;
                        } else {
                            // 数据点较多时，只在起始点、结束点和值较大的点显示
                            const data = context.dataset.data;
                            const currentIndex = context.dataIndex;
                            const currentValue = data[currentIndex];
                            
                            // 起始点和结束点总是显示
                            if (currentIndex === 0 || currentIndex === data.length - 1) {
                                return true;
                            }
                            
                            // 只在值大于平均值的点显示标签
                            const sum = data.reduce((acc, val) => acc + (val || 0), 0);
                            const average = sum / data.length;
                            
                            // 在值大于平均值的点显示标签
                            return currentValue > average;
                        }
                    },
                    formatter: function(value, context) {
                        // 格式化金额（根据设置决定是否显示小数点）
                        if (window.state.data.config.showDecimal) {
                            // 根据单位进行格式化（带小数点）
                            const unit = window.state.data.config.units.overview;
                            if (unit === "亿") {
                                return (value * window.unitValues[unit] / window.unitValues["亿"]).toFixed(2) + '亿';
                            } else if (unit === "千万") {
                                return (value * window.unitValues[unit] / window.unitValues["千万"]).toFixed(2) + '千万';
                            } else if (unit === "百万") {
                                return (value * window.unitValues[unit] / window.unitValues["百万"]).toFixed(2) + '百万';
                            } else if (unit === "十万") {
                                return (value * window.unitValues[unit] / window.unitValues["十万"]).toFixed(2) + '十万';
                            } else if (unit === "万") {
                                return (value * window.unitValues[unit] / window.unitValues["万"]).toFixed(2) + '万';
                            } else if (unit === "千") {
                                return (value * window.unitValues[unit] / window.unitValues["千"]).toFixed(2) + '千';
                            } else {
                                // 对于"元"单位，使用千分位符格式
                                return value.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        } else {
                            // 不显示小数点，使用整数格式
                            const unit = window.state.data.config.units.overview;
                            if (unit === "亿") {
                                return Math.round(value * window.unitValues[unit] / window.unitValues["亿"]) + '亿';
                            } else if (unit === "千万") {
                                return Math.round(value * window.unitValues[unit] / window.unitValues["千万"]) + '千万';
                            } else if (unit === "百万") {
                                return Math.round(value * window.unitValues[unit] / window.unitValues["百万"]) + '百万';
                            } else if (unit === "十万") {
                                return Math.round(value * window.unitValues[unit] / window.unitValues["十万"]) + '十万';
                            } else if (unit === "万") {
                                return Math.round(value * window.unitValues[unit] / window.unitValues["万"]) + '万';
                            } else if (unit === "千") {
                                return Math.round(value * window.unitValues[unit] / window.unitValues["千"]) + '千';
                            } else {
                                // 对于"元"单位，使用千分位符格式
                                return Math.round(value).toLocaleString();
                            }
                        }
                    },
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 9
                    },
                    textAlign: 'center',
                    anchor: 'center',
                    align: 'center',
                    offset: 0,
                    borderRadius: 1,
                    backgroundColor: function(context) {
                        // 使用数据系列的颜色作为标签背景色，但加深以提高可读性
                        const color = context.dataset.borderColor;
                        // 简单的颜色加深处理
                        return color.replace('0.2)', '0.8)');
                    },
                    padding: {
                        top: 1,
                        bottom: 1,
                        left: 2,
                        right: 2
                    }
                }
            },
            scales: {
                y: {
                    stacked: true, // 启用堆叠
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            // 格式化Y轴标签，适配当前单位设置
                            const currentUnit = window.state.data.config.units.overview;
                            const baseValue = window.unitValues[currentUnit];
                            
                            const yiValue = window.unitValues["亿"] / baseValue;
                            const qianWanValue = window.unitValues["千万"] / baseValue;
                            const baiWanValue = window.unitValues["百万"] / baseValue;
                            const shiWanValue = window.unitValues["十万"] / baseValue;
                            const wanValue = window.unitValues["万"] / baseValue;
                            const qianValue = window.unitValues["千"] / baseValue;
                            
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

// 将函数添加到全局作用域
window.getMaxChartValue = getMaxChartValue;
window.renderTrendChart = renderTrendChart;
window.renderPieChart = renderPieChart;
window.renderBarChart = renderBarChart;
window.renderStackedAreaChart = renderStackedAreaChart;