// 仪表板 - 资产总览和分析

class Dashboard {
    constructor() {
        this.overview = null;
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadOverviewData();
        await this.loadUserInfo();
        this.renderDashboard();
        this.setupEventListeners();
    }

    async loadOverviewData() {
        try {
            this.overview = await apiClient.getDashboardOverview();
        } catch (error) {
            console.error('Failed to load overview data:', error);
            this.showToast('加载总览数据失败', 'error');
        }
    }

    renderDashboard() {
        const container = document.getElementById('dashboardContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="dashboard">
                <!-- 核心指标卡片 - 移动端优化 -->
                <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                    ${this.renderMetricCards()}
                </div>

                <!-- 今年收支对比 -->
                <div class="bg-white rounded-lg shadow-md p-4 mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-balance-scale mr-2 text-purple-500"></i>今年收支对比
                    </h3>
                    <div id="yearlyComparisonContainer" class="grid grid-cols-2 gap-4 text-sm">
                        <!-- 收支对比数据将在这里显示 -->
                    </div>
                </div>
                
                <!-- 一年收支趋势图 - 移动端优化 -->
                <div class="bg-white rounded-lg shadow-md p-4 mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-chart-line mr-2 text-green-500"></i>一年收支趋势
                    </h3>
                    <div class="relative h-64">
                        <canvas id="monthlyTrendChart"></canvas>
                    </div>
                </div>
                
                <!-- 资产分布和收益对比 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <!-- 资产分布饼图 -->
                    <div class="bg-white rounded-lg shadow-md p-4">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <i class="fas fa-chart-pie mr-2 text-blue-500"></i>资产分布
                        </h3>
                        <div class="relative h-48">
                            <canvas id="assetDistributionChart"></canvas>
                        </div>
                    </div>
                    
                    <!-- 资产收益对比 -->
                    <div class="bg-white rounded-lg shadow-md p-4">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <i class="fas fa-chart-bar mr-2 text-orange-500"></i>资产收益对比
                        </h3>
                        <div class="relative h-48">
                            <canvas id="assetReturnsChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- 详细分析 -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- 资产详情 -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-list mr-2 text-purple-500"></i>资产明细
                        </h3>
                        <div id="assetDetails" class="space-y-3">
                            <!-- 资产详情将在这里显示 -->
                        </div>
                    </div>

                    <!-- 负债情况 -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-credit-card mr-2 text-red-500"></i>负债情况
                        </h3>
                        <div id="liabilityDetails" class="space-y-3">
                            <!-- 负债详情将在这里显示 -->
                        </div>
                    </div>

                    <!-- 投资收益分析 -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-chart-bar mr-2 text-orange-500"></i>投资收益
                        </h3>
                        <div id="investmentReturns" class="space-y-3">
                            <!-- 投资收益将在这里显示 -->
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="mt-8 flex flex-wrap gap-3 justify-center">
                    <button id="refreshDashboard" class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center">
                        <i class="fas fa-sync-alt mr-2"></i>刷新数据
                    </button>
                    <button id="exportReport" class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center">
                        <i class="fas fa-file-export mr-2"></i>导出报告
                    </button>
                </div>
            </div>
        `;

        // 渲染图表和详情
        setTimeout(() => {
            this.loadYearlyComparison();
            this.renderCharts();
            this.renderAssetDetails();
            this.renderInvestmentReturns();
        }, 100);
    }

    renderMetricCards() {
        if (!this.overview) return '';

        const totalAssets = this.overview.total_assets || 0;
        const totalLiabilities = this.overview.total_liabilities || 0;
        const netWorth = this.overview.net_worth || 0;
        
        // 计算本月现金流
        const monthlyIncome = this.overview.monthly_cash_flow?.find(f => f.flow_type === 'income')?.total_amount || 0;
        const monthlyExpense = this.overview.monthly_cash_flow?.find(f => f.flow_type === 'expense')?.total_amount || 0;
        const netCashFlow = monthlyIncome - monthlyExpense;

        return `
            <div class="metric-card bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-3">
                <div class="text-center">
                    <i class="fas fa-coins text-lg mb-1"></i>
                    <p class="text-xs text-blue-100 mb-1">总资产</p>
                    <p class="text-sm sm:text-lg font-bold">¥${(totalAssets/10000).toFixed(1)}w</p>
                </div>
            </div>

            <div class="metric-card bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-3">
                <div class="text-center">
                    <i class="fas fa-credit-card text-lg mb-1"></i>
                    <p class="text-xs text-red-100 mb-1">总负债</p>
                    <p class="text-sm sm:text-lg font-bold">¥${(totalLiabilities/10000).toFixed(1)}w</p>
                </div>
            </div>

            <div class="metric-card bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-3">
                <div class="text-center">
                    <i class="fas fa-chart-line text-lg mb-1"></i>
                    <p class="text-xs text-green-100 mb-1">净资产</p>
                    <p class="text-sm sm:text-lg font-bold">¥${(netWorth/10000).toFixed(1)}w</p>
                </div>
            </div>
        `;
    }

    async loadUserInfo() {
        // 用户信息不再显示，保留方法以防其他地方调用出错
    }
    
    async loadYearlyComparison() {
        try {
            const balanceData = await apiClient.getBalanceForecast();
            const container = document.getElementById('yearlyComparisonContainer');
            
            if (container && balanceData) {
                const actual = balanceData.actual || {};
                const planned = balanceData.planned || {};
                
                container.innerHTML = `
                    <div class="text-center">
                        <p class="text-xs text-gray-500 mb-1">预计收入</p>
                        <p class="font-bold text-green-600">¥${(planned.income || 0).toLocaleString()}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-xs text-gray-500 mb-1">实际收入</p>
                        <p class="font-bold text-green-700">¥${(actual.income || 0).toLocaleString()}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-xs text-gray-500 mb-1">预计支出</p>
                        <p class="font-bold text-red-600">¥${(planned.expense || 0).toLocaleString()}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-xs text-gray-500 mb-1">实际支出</p>
                        <p class="font-bold text-red-700">¥${(actual.expense || 0).toLocaleString()}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to load yearly comparison:', error);
        }
    }

    renderCharts() {
        this.renderAssetDistributionChart();
        this.renderMonthlyTrendChart();
        this.renderAssetReturnsChart();
    }

    renderAssetDistributionChart() {
        const canvas = document.getElementById('assetDistributionChart');
        if (!canvas || !this.overview?.assets_by_category) return;

        const ctx = canvas.getContext('2d');
        
        // 销毁现有图表
        if (this.charts.assetDistribution) {
            this.charts.assetDistribution.destroy();
        }

        const categories = this.overview.assets_by_category;
        const data = {
            labels: categories.map(cat => this.getCategoryName(cat.category)),
            datasets: [{
                data: categories.map(cat => cat.total_value),
                backgroundColor: [
                    '#3B82F6', // 蓝色 - 固定资产
                    '#10B981', // 绿色 - 流动资产
                    '#F59E0B', // 橙色 - 消费品
                    '#8B5CF6', // 紫色
                    '#EF4444'  // 红色
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        this.charts.assetDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            usePointStyle: true,
                            font: {
                                size: 12
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const dataset = data.datasets[0];
                                        return {
                                            text: label,
                                            fillStyle: dataset.backgroundColor[i],
                                            strokeStyle: dataset.borderColor,
                                            lineWidth: dataset.borderWidth,
                                            pointStyle: 'line'
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ¥${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    async renderCashFlowChart() {
        const canvas = document.getElementById('cashFlowChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 销毁现有图表
        if (this.charts.cashFlow) {
            this.charts.cashFlow.destroy();
        }

        try {
            // 获取最近6个月的现金流数据
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);
            
            const cashFlows = await apiClient.getCashFlows(
                startDate.toISOString().slice(0, 10),
                endDate.toISOString().slice(0, 10)
            );

            // 按月份分组
            const monthlyData = this.groupCashFlowsByMonth(cashFlows);
            
            const data = {
                labels: Object.keys(monthlyData).sort(),
                datasets: [
                    {
                        label: '收入',
                        data: Object.keys(monthlyData).sort().map(month => monthlyData[month].income),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: '支出',
                        data: Object.keys(monthlyData).sort().map(month => monthlyData[month].expense),
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }
                ]
            };

            this.charts.cashFlow = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ¥${context.parsed.y.toLocaleString()}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '¥' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to render cash flow chart:', error);
        }
    }

    groupCashFlowsByMonth(cashFlows) {
        return cashFlows.reduce((groups, flow) => {
            const month = flow.flow_date.slice(0, 7); // YYYY-MM
            if (!groups[month]) {
                groups[month] = { income: 0, expense: 0 };
            }
            
            const amount = parseFloat(flow.amount);
            if (flow.flow_type === 'income') {
                groups[month].income += amount;
            } else {
                groups[month].expense += amount;
            }
            
            return groups;
        }, {});
    }
    
    async renderMonthlyTrendChart() {
        const canvas = document.getElementById('monthlyTrendChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 销毁现有图表
        if (this.charts.monthlyTrend) {
            this.charts.monthlyTrend.destroy();
        }

        try {
            const monthlyData = await apiClient.getMonthlyIncomeExpense();
            
            // 处理数据格式
            const currentMonth = monthlyData.currentMonth || 8;
            const actualData = monthlyData.actual || [];
            const plannedData = monthlyData.planned || [];
            
            // 只显示有数据的月份，减少空白
            const months = [];
            const monthLabels = [];
            
            // 找到有数据的月份范围
            const allData = [...actualData, ...plannedData];
            const dataMonths = [...new Set(allData.map(d => d.month))].sort();
            
            if (dataMonths.length === 0) {
                // 如果没有数据，显示当前年份的月份
                for (let i = 1; i <= 12; i++) {
                    const monthStr = '2025-' + String(i).padStart(2, '0');
                    months.push(monthStr);
                    monthLabels.push(i + '月');
                }
            } else {
                // 使用有数据的月份范围
                const startMonth = parseInt(dataMonths[0].split('-')[1]);
                const endMonth = Math.max(parseInt(dataMonths[dataMonths.length - 1].split('-')[1]), currentMonth + 4); // 显示到未来几个月
                
                for (let i = startMonth; i <= endMonth && i <= 12; i++) {
                    const monthStr = '2025-' + String(i).padStart(2, '0');
                    months.push(monthStr);
                    monthLabels.push(i + '月');
                }
            }
            
            // 创建收入和支出数据
            const incomeData = months.map((month, index) => {
                const monthNum = parseInt(month.split('-')[1]);
                if (monthNum < currentMonth) {
                    const item = actualData.find(d => d.month === month && d.flow_type === 'income');
                    return item ? item.total_amount : 0;
                } else {
                    const item = plannedData.find(d => d.month === month && d.flow_type === 'income');
                    return item ? item.total_amount : 0;
                }
            });
            
            const expenseData = months.map((month, index) => {
                const monthNum = parseInt(month.split('-')[1]);
                if (monthNum < currentMonth) {
                    const item = actualData.find(d => d.month === month && d.flow_type === 'expense');
                    return item ? item.total_amount : 0;
                } else {
                    const item = plannedData.find(d => d.month === month && d.flow_type === 'expense');
                    return item ? item.total_amount : 0;
                }
            });
            
            // 创建分段样式：实际数据部分和预期数据部分
            const actualIncomeData = incomeData.map((value, index) => {
                const monthNum = parseInt(months[index].split('-')[1]);
                return monthNum < currentMonth ? value : null;
            });
            const plannedIncomeData = incomeData.map((value, index) => {
                const monthNum = parseInt(months[index].split('-')[1]);
                return monthNum >= currentMonth - 1 ? value : null;
            });
            const actualExpenseData = expenseData.map((value, index) => {
                const monthNum = parseInt(months[index].split('-')[1]);
                return monthNum < currentMonth ? value : null;
            });
            const plannedExpenseData = expenseData.map((value, index) => {
                const monthNum = parseInt(months[index].split('-')[1]);
                return monthNum >= currentMonth - 1 ? value : null;
            });
            
            this.charts.monthlyTrend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthLabels,
                    datasets: [{
                        label: '实际收入',
                        data: actualIncomeData,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        spanGaps: true,
                        pointRadius: 3
                    }, {
                        label: '预期收入',
                        data: plannedIncomeData,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.05)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        spanGaps: true,
                        pointRadius: 3
                    }, {
                        label: '实际支出',
                        data: actualExpenseData,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        spanGaps: true,
                        pointRadius: 3
                    }, {
                        label: '预期支出',
                        data: plannedExpenseData,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        spanGaps: true,
                        pointRadius: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: false,  // 完全禁用默认图例
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ¥${context.parsed.y.toLocaleString()}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 8000,
                            ticks: {
                                callback: function(value) {
                                    return '¥' + (value / 1000).toFixed(0) + 'k';
                                },
                                font: {
                                    size: 10
                                }
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    size: 10
                                }
                            }
                        }
                    }
                }
            });
            
            // 创建自定义图例
            this.createCustomLegend();
        } catch (error) {
            console.error('Failed to render monthly trend chart:', error);
        }
    }
    
    createCustomLegend() {
        const chartCanvas = document.getElementById('monthlyTrendChart');
        if (!chartCanvas) return;
        
        const chartContainer = chartCanvas.parentElement;
        if (!chartContainer) return;
        
        // 移除已存在的图例
        const existingLegend = chartContainer.querySelector('.custom-legend');
        if (existingLegend) {
            existingLegend.remove();
        }
        
        // 创建图例容器
        const legendContainer = document.createElement('div');
        legendContainer.className = 'custom-legend flex flex-wrap justify-center items-center gap-3 mb-3 text-xs';
        
        // 图例项数据
        const legendItems = [
            { label: '实际收入', color: 'rgb(34, 197, 94)', solid: true },
            { label: '预期收入', color: 'rgb(34, 197, 94)', solid: false },
            { label: '实际支出', color: 'rgb(239, 68, 68)', solid: true },
            { label: '预期支出', color: 'rgb(239, 68, 68)', solid: false }
        ];
        
        // 创建图例项
        legendItems.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.className = 'flex items-center gap-1';
            
            // 创建线条 - 使用SVG更精确地显示线条
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            line.setAttribute('width', '20');
            line.setAttribute('height', '3');
            line.style.display = 'block';
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            path.setAttribute('x1', '0');
            path.setAttribute('y1', '1.5');
            path.setAttribute('x2', '20');
            path.setAttribute('y2', '1.5');
            path.setAttribute('stroke', item.color);
            path.setAttribute('stroke-width', '2');
            if (!item.solid) {
                path.setAttribute('stroke-dasharray', '3,2');
            }
            
            line.appendChild(path);
            
            // 创建标签
            const label = document.createElement('span');
            label.textContent = item.label;
            label.style.color = '#6B7280';
            label.style.fontSize = '11px';
            
            legendItem.appendChild(line);
            legendItem.appendChild(label);
            legendContainer.appendChild(legendItem);
        });
        
        // 插入到图表容器顶部
        chartContainer.insertBefore(legendContainer, chartCanvas);
    }
    
    async renderAssetReturnsChart() {
        const canvas = document.getElementById('assetReturnsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 销毁现有图表
        if (this.charts.assetReturns) {
            this.charts.assetReturns.destroy();
        }

        try {
            const assetReturns = await apiClient.getAssetReturns();
            
            if (!assetReturns || assetReturns.length === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#6B7280';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('暂无资产收益数据', canvas.width / 2, canvas.height / 2);
                return;
            }
            
            // 只显示前8个资产，避免图表过于拥挤
            const topAssets = assetReturns.slice(0, 8);
            
            const labels = topAssets.map(asset => asset.asset_name.length > 6 ? asset.asset_name.substring(0, 6) + '...' : asset.asset_name);
            const returns = topAssets.map(asset => asset.return_rate || 0);
            const colors = returns.map(rate => rate >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)');
            
            this.charts.assetReturns = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '收益率(%)',
                        data: returns,
                        backgroundColor: colors,
                        borderColor: returns.map(rate => rate >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const asset = topAssets[context.dataIndex];
                                    return [
                                        `资产: ${asset.asset_name}`,
                                        `收益率: ${context.parsed.y.toFixed(2)}%`,
                                        `成本价: ¥${asset.cost_price.toLocaleString()}`,
                                        `现价: ¥${asset.current_price.toLocaleString()}`,
                                        `盈亏: ¥${asset.profit_loss.toLocaleString()}`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                },
                                font: {
                                    size: 10
                                }
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    size: 9
                                },
                                maxRotation: 45
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to render asset returns chart:', error);
        }
    }

    async renderAssetDetails() {
        const container = document.getElementById('assetDetails');
        if (!container || !this.overview?.assets_by_category) return;

        const categories = this.overview.assets_by_category;
        const totalValue = categories.reduce((sum, cat) => sum + cat.total_value, 0);

        container.innerHTML = categories.map(category => {
            const percentage = totalValue > 0 ? ((category.total_value / totalValue) * 100).toFixed(1) : 0;
            return `
                <div class="asset-category-item p-3 bg-gray-50 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-800">${this.getCategoryName(category.category)}</span>
                        <span class="text-sm text-gray-500">${category.count}项</span>
                    </div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-lg font-semibold text-blue-600">¥${category.total_value.toLocaleString()}</span>
                        <span class="text-sm font-medium text-purple-600">${percentage}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async renderInvestmentReturns() {
        const container = document.getElementById('investmentReturns');
        if (!container) return;

        try {
            // 使用投资跟踪器渲染投资收益分析
            if (window.investmentTracker) {
                await window.investmentTracker.loadInvestmentReturns();
                await window.investmentTracker.loadAssets();
                window.investmentTracker.renderInvestmentAnalysis('investmentReturns');
            } else {
                container.innerHTML = `
                    <div class="text-center py-4 text-gray-500">
                        <i class="fas fa-chart-line text-2xl mb-2"></i>
                        <p class="text-sm">投资跟踪器未初始化</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to render investment returns:', error);
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2 text-red-500"></i>
                    <p class="text-sm">加载投资数据失败</p>
                </div>
            `;
        }
    }

    getCategoryName(category) {
        const names = {
            'fixed': '固定资产',
            'liquid': '流动资产',
            'consumer': '消费品'
        };
        return names[category] || category;
    }

    setupEventListeners() {
        document.addEventListener('click', async (e) => {
            if (e.target.id === 'refreshDashboard' || e.target.closest('#refreshDashboard')) {
                await this.refreshDashboard();
            }
            
            if (e.target.id === 'exportReport' || e.target.closest('#exportReport')) {
                this.exportReport();
            }
        });
    }

    async refreshDashboard() {
        this.showToast('正在刷新数据...');
        await this.loadOverviewData();
        this.renderDashboard();
        this.showToast('数据刷新完成');
    }

    exportReport() {
        if (!this.overview) {
            this.showToast('没有数据可导出', 'error');
            return;
        }

        const report = {
            generated_at: new Date().toISOString(),
            summary: {
                total_assets: this.overview.total_assets,
                total_liabilities: this.overview.total_liabilities,
                net_worth: this.overview.net_worth
            },
            assets_by_category: this.overview.assets_by_category,
            monthly_cash_flow: this.overview.monthly_cash_flow
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-report-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('报告导出成功');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 ${
                type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }
}

// 初始化仪表板
window.dashboard = new Dashboard();
