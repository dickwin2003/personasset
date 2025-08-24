// 投资收益跟踪器 - 管理预期收益与实际收益对比

class InvestmentTracker {
    constructor() {
        this.investmentReturns = [];
        this.assets = [];
        this.init();
    }

    async init() {
        await this.loadInvestmentReturns();
        await this.loadAssets();
    }

    async loadInvestmentReturns() {
        try {
            this.investmentReturns = await apiClient.getInvestmentReturns();
        } catch (error) {
            console.error('Failed to load investment returns:', error);
            this.showToast('加载投资收益数据失败', 'error');
        }
    }

    async loadAssets() {
        try {
            this.assets = await apiClient.getAssets();
        } catch (error) {
            console.error('Failed to load assets:', error);
        }
    }

    renderInvestmentAnalysis(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.investmentReturns.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-chart-line text-4xl mb-4"></i>
                    <p>暂无投资收益记录</p>
                    <button id="addFirstReturn" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                        记录首次收益
                    </button>
                </div>
            `;
            return;
        }

        // 按资产分组收益数据
        const returnsByAsset = this.groupReturnsByAsset();
        
        container.innerHTML = `
            <div class="investment-analysis">
                <!-- 总体收益概览 -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    ${this.renderReturnSummaryCards()}
                </div>

                <!-- 收益对比图表 -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-chart-bar mr-2 text-orange-500"></i>预期 vs 实际收益对比
                    </h4>
                    <canvas id="returnComparisonChart" width="400" height="200"></canvas>
                </div>

                <!-- 资产收益详情 -->
                <div class="space-y-4">
                    ${Object.entries(returnsByAsset).map(([assetName, returns]) => 
                        this.renderAssetReturnCard(assetName, returns)
                    ).join('')}
                </div>

                <!-- 添加收益记录按钮 -->
                <div class="text-center mt-6">
                    <button id="addReturnRecord" class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center mx-auto">
                        <i class="fas fa-plus mr-2"></i>记录投资收益
                    </button>
                </div>
            </div>
        `;

        // 渲染图表
        setTimeout(() => {
            this.renderReturnComparisonChart();
        }, 100);

        // 绑定事件
        this.bindInvestmentEvents();
    }

    renderReturnSummaryCards() {
        const totalExpected = this.investmentReturns.reduce((sum, ret) => sum + parseFloat(ret.expected_return), 0);
        const totalActual = this.investmentReturns.reduce((sum, ret) => sum + parseFloat(ret.actual_return), 0);
        const variance = totalActual - totalExpected;
        const variancePercent = totalExpected > 0 ? ((variance / totalExpected) * 100).toFixed(1) : 0;

        return `
            <div class="summary-card bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-target text-blue-600"></i>
                    </div>
                    <div>
                        <p class="text-sm text-blue-600">预期收益</p>
                        <p class="text-xl font-bold text-blue-700">¥${totalExpected.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div class="summary-card bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-chart-line text-green-600"></i>
                    </div>
                    <div>
                        <p class="text-sm text-green-600">实际收益</p>
                        <p class="text-xl font-bold text-green-700">¥${totalActual.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div class="summary-card ${variance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} rounded-lg p-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 ${variance >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mr-3">
                        <i class="fas ${variance >= 0 ? 'fa-arrow-up text-green-600' : 'fa-arrow-down text-red-600'}"></i>
                    </div>
                    <div>
                        <p class="text-sm ${variance >= 0 ? 'text-green-600' : 'text-red-600'}">收益差异</p>
                        <p class="text-xl font-bold ${variance >= 0 ? 'text-green-700' : 'text-red-700'}">
                            ${variance >= 0 ? '+' : ''}¥${variance.toLocaleString()}
                        </p>
                        <p class="text-xs ${variance >= 0 ? 'text-green-500' : 'text-red-500'}">
                            ${variance >= 0 ? '+' : ''}${variancePercent}%
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    renderAssetReturnCard(assetName, returns) {
        const latestReturn = returns[0]; // 假设按日期排序
        const totalExpected = returns.reduce((sum, ret) => sum + parseFloat(ret.expected_return), 0);
        const totalActual = returns.reduce((sum, ret) => sum + parseFloat(ret.actual_return), 0);

        return `
            <div class="asset-return-card bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div class="flex justify-between items-start mb-3">
                    <h5 class="font-semibold text-gray-800">${assetName}</h5>
                    <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        ${returns.length} 条记录
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <p class="text-sm text-gray-600">累计预期</p>
                        <p class="font-semibold text-blue-600">¥${totalExpected.toLocaleString()}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">累计实际</p>
                        <p class="font-semibold text-green-600">¥${totalActual.toLocaleString()}</p>
                    </div>
                </div>
                
                ${latestReturn ? `
                    <div class="text-sm text-gray-500 border-t pt-2">
                        最近记录：${latestReturn.return_date} 
                        (${latestReturn.period_type === 'monthly' ? '月度' : latestReturn.period_type === 'quarterly' ? '季度' : '年度'})
                    </div>
                ` : ''}
                
                <div class="mt-3 flex gap-2">
                    <button class="view-asset-returns flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                            data-asset-name="${assetName}">
                        查看详情
                    </button>
                    <button class="add-asset-return flex-1 px-3 py-1.5 text-sm bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition"
                            data-asset-name="${assetName}">
                        记录收益
                    </button>
                </div>
            </div>
        `;
    }

    groupReturnsByAsset() {
        return this.investmentReturns.reduce((groups, returnRecord) => {
            const assetName = returnRecord.asset_name;
            if (!groups[assetName]) {
                groups[assetName] = [];
            }
            groups[assetName].push(returnRecord);
            return groups;
        }, {});
    }

    renderReturnComparisonChart() {
        const canvas = document.getElementById('returnComparisonChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 按资产分组数据
        const returnsByAsset = this.groupReturnsByAsset();
        const assetNames = Object.keys(returnsByAsset);
        
        const expectedData = assetNames.map(name => 
            returnsByAsset[name].reduce((sum, ret) => sum + parseFloat(ret.expected_return), 0)
        );
        
        const actualData = assetNames.map(name => 
            returnsByAsset[name].reduce((sum, ret) => sum + parseFloat(ret.actual_return), 0)
        );

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: assetNames,
                datasets: [
                    {
                        label: '预期收益',
                        data: expectedData,
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1
                    },
                    {
                        label: '实际收益',
                        data: actualData,
                        backgroundColor: 'rgba(16, 185, 129, 0.6)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 1
                    }
                ]
            },
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
    }

    bindInvestmentEvents() {
        document.addEventListener('click', async (e) => {
            if (e.target.id === 'addReturnRecord' || e.target.id === 'addFirstReturn') {
                this.showAddReturnModal();
            }
            
            if (e.target.classList.contains('add-asset-return')) {
                const assetName = e.target.dataset.assetName;
                this.showAddReturnModal(assetName);
            }
            
            if (e.target.classList.contains('view-asset-returns')) {
                const assetName = e.target.dataset.assetName;
                this.showAssetReturnsDetail(assetName);
            }
        });
    }

    showAddReturnModal(preselectedAsset = null) {
        const modal = this.createModal('记录投资收益', `
            <form id="addReturnForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">选择资产</label>
                    <select id="returnAssetSelect" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                        <option value="">请选择资产</option>
                        ${this.assets.map(asset => `
                            <option value="${asset.id}" ${preselectedAsset === asset.name ? 'selected' : ''}>
                                ${asset.name} (${asset.asset_type_name})
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">预期收益</label>
                        <input type="number" id="expectedReturn" class="w-full border border-gray-300 rounded-lg px-3 py-2" step="0.01" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">实际收益</label>
                        <input type="number" id="actualReturn" class="w-full border border-gray-300 rounded-lg px-3 py-2" step="0.01" required>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">收益日期</label>
                        <input type="date" id="returnDate" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">周期类型</label>
                        <select id="periodType" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="monthly">月度</option>
                            <option value="quarterly">季度</option>
                            <option value="yearly">年度</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">备注（可选）</label>
                    <textarea id="returnNotes" class="w-full border border-gray-300 rounded-lg px-3 py-2" rows="3"></textarea>
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" class="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition">
                        记录收益
                    </button>
                    <button type="button" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition" onclick="this.closest('.modal').remove()">
                        取消
                    </button>
                </div>
            </form>
        `);

        // 设置默认日期
        document.getElementById('returnDate').valueAsDate = new Date();

        document.getElementById('addReturnForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddReturn(e.target);
            modal.remove();
        });
    }

    async handleAddReturn(form) {
        const data = {
            asset_id: parseInt(document.getElementById('returnAssetSelect').value),
            expected_return: parseFloat(document.getElementById('expectedReturn').value),
            actual_return: parseFloat(document.getElementById('actualReturn').value),
            return_date: document.getElementById('returnDate').value,
            period_type: document.getElementById('periodType').value,
            notes: document.getElementById('returnNotes').value
        };

        try {
            await apiClient.createInvestmentReturn(data);
            this.showToast('投资收益记录成功');
            await this.loadInvestmentReturns();
            // 重新渲染分析
            this.renderInvestmentAnalysis('investmentReturns');
        } catch (error) {
            console.error('Failed to add investment return:', error);
            this.showToast('记录失败', 'error');
        }
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">${title}</h3>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
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

// 全局投资跟踪器实例
window.investmentTracker = new InvestmentTracker();
