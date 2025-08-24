// 主应用逻辑 - 完全按照原始网站重构

// 全局变量
let currentPage = 'dashboard';
let assetTypes = [];
let assets = [];
let liabilities = [];
let cashFlows = [];
let apiClient = new ApiClient();

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    setupNavigation();
    setupMenuToggle();
    await loadInitialData();
    showPage('dashboard');
}

// 设置导航
function setupNavigation() {
    const navButtons = ['dashboardBtn', 'assetsBtn', 'liabilitiesBtn', 'cashFlowBtn'];
    
    navButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                const pageMap = {
                    'dashboardBtn': 'dashboard',
                    'assetsBtn': 'assets',
                    'liabilitiesBtn': 'liabilities',
                    'cashFlowBtn': 'cashFlow'
                };
                showPage(pageMap[buttonId]);
            });
        }
    });

    // 现金流标签页
    document.getElementById('plannedFlowTab')?.addEventListener('click', () => {
        showCashFlowTab('planned');
    });
    document.getElementById('historicalFlowTab')?.addEventListener('click', () => {
        showCashFlowTab('historical');
    });
}

// 设置菜单切换
function setupMenuToggle() {
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    menuBtn?.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
    });

    // 点击其他地方关闭菜单
    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    // 设置按钮
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
        showPage('settings');
        dropdownMenu.classList.add('hidden');
    });
}

// 加载初始数据
async function loadInitialData() {
    try {
        const [dashboardData, assetsData, liabilitiesData, cashFlowsData, assetTypesData] = await Promise.all([
            apiClient.request('/dashboard/overview'),
            apiClient.request('/assets'),
            apiClient.request('/liabilities'),
            apiClient.request('/cash-flows'),
            apiClient.request('/asset-types')
        ]);

        // 更新全局数据
        assets = assetsData;
        liabilities = liabilitiesData;
        cashFlows = cashFlowsData;
        assetTypes = assetTypesData;

        // 更新仪表板
        updateDashboard(dashboardData);
        
    } catch (error) {
        console.error('Failed to load initial data:', error);
        showToast('数据加载失败', 'error');
    }
}

// 更新仪表板
function updateDashboard(data) {
    document.getElementById('totalAssets').textContent = `￥${formatNumber(data.total_assets)}`;
    document.getElementById('totalLiabilities').textContent = `￥${formatNumber(data.total_liabilities)}`;
    document.getElementById('netWorth').textContent = `￥${formatNumber(data.net_worth)}`;

    // 更新收支对比
    const projectedIncome = data.monthly_cash_flow.reduce((sum, item) => sum + item.income, 0);
    const projectedExpense = data.monthly_cash_flow.reduce((sum, item) => sum + item.expense, 0);
    
    document.getElementById('projectedIncome').textContent = `￥${formatNumber(projectedIncome)}`;
    document.getElementById('actualIncome').textContent = `￥${formatNumber(projectedIncome)}`;
    document.getElementById('projectedExpense').textContent = `￥${formatNumber(projectedExpense)}`;
    document.getElementById('actualExpense').textContent = `￥${formatNumber(projectedExpense)}`;

    const surplus = projectedIncome - projectedExpense;
    document.getElementById('balanceText').textContent = `实际盈余￥${formatNumber(surplus)} | 预计盈余￥${formatNumber(surplus)}`;

    // 绘制图表
    drawCharts(data);
}

// 绘制图表
function drawCharts(data) {
    // 月度趋势图
    const monthlyCtx = document.getElementById('monthlyTrendChart')?.getContext('2d');
    if (monthlyCtx) {
        new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: data.monthly_cash_flow.map(item => item.month.substring(5)),
                datasets: [{
                    label: '收入',
                    data: data.monthly_cash_flow.map(item => item.income),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }, {
                    label: '支出',
                    data: data.monthly_cash_flow.map(item => item.expense),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // 资产分布图
    const distributionCtx = document.getElementById('assetDistributionChart')?.getContext('2d');
    if (distributionCtx) {
        new Chart(distributionCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data.assets_by_category),
                datasets: [{
                    data: Object.values(data.assets_by_category),
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // 资产收益图（示例数据）
    const returnsCtx = document.getElementById('assetReturnsChart')?.getContext('2d');
    if (returnsCtx) {
        new Chart(returnsCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(data.assets_by_category),
                datasets: [{
                    label: '收益率 (%)',
                    data: [5.2, 8.7, 12.3, 6.8],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// 显示页面
function showPage(pageName) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });

    // 显示目标页面
    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }

    // 更新导航按钮状态
    updateNavButtons(pageName);
    currentPage = pageName;

    // 加载页面数据
    loadPageData(pageName);
}

// 更新导航按钮状态
function updateNavButtons(activePage) {
    const navButtons = ['dashboardBtn', 'assetsBtn', 'liabilitiesBtn', 'cashFlowBtn'];
    const pageMap = {
        'dashboardBtn': 'dashboard',
        'assetsBtn': 'assets',
        'liabilitiesBtn': 'liabilities',
        'cashFlowBtn': 'cashFlow'
    };

    navButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.remove('active');
            if (pageMap[buttonId] === activePage) {
                button.classList.add('active');
            }
        }
    });
}

// 加载页面数据
function loadPageData(pageName) {
    switch (pageName) {
        case 'assets':
            renderAssets();
            break;
        case 'liabilities':
            renderLiabilities();
            break;
        case 'cashFlow':
            renderCashFlows();
            break;
    }
}

// 渲染资产列表
function renderAssets() {
    const container = document.getElementById('assetsContainer');
    if (!container) return;

    if (assets.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-coins text-4xl mb-4 opacity-50"></i><p>暂无资产记录</p><p class="text-sm">点击右上角按钮添加您的第一个资产</p></div>';
        return;
    }

    container.innerHTML = assets.map(asset => `
        <div class="bg-white rounded-lg p-4 shadow-sm mb-3">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="font-semibold text-gray-800">${asset.name}</h3>
                    <p class="text-sm text-gray-600 mb-2">${asset.description || ''}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${asset.asset_type_name || ''}</span>
                        <span class="text-lg font-bold text-green-600">${formatCurrency(asset.current_value)}</span>
                    </div>
                </div>
                <div class="ml-4 flex gap-2">
                    <button onclick="editAsset(${asset.id})" class="p-2 text-blue-500 hover:bg-blue-50 rounded">
                        <i class="fas fa-edit text-sm"></i>
                    </button>
                    <button onclick="deleteAsset(${asset.id})" class="p-2 text-red-500 hover:bg-red-50 rounded">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 渲染负债列表
function renderLiabilities() {
    const container = document.getElementById('liabilitiesContainer');
    if (!container) return;

    if (liabilities.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-credit-card text-4xl mb-4 opacity-50"></i><p>暂无负债记录</p><p class="text-sm">点击右上角按钮添加负债信息</p></div>';
        return;
    }

    container.innerHTML = liabilities.map(liability => `
        <div class="bg-white rounded-lg p-4 shadow-sm mb-3">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="font-semibold text-gray-800">${liability.name}</h3>
                    <p class="text-sm text-gray-600 mb-2">${liability.description || ''}</p>
                    <div class="flex items-center justify-between">
                        <div class="text-xs text-gray-500">
                            ${liability.interest_rate ? `利率: ${liability.interest_rate}%` : ''}
                            ${liability.monthly_payment ? ` | 月付: ${formatCurrency(liability.monthly_payment)}` : ''}
                        </div>
                        <span class="text-lg font-bold text-red-600">${formatCurrency(liability.current_balance)}</span>
                    </div>
                </div>
                <div class="ml-4 flex gap-2">
                    <button onclick="editLiability(${liability.id})" class="p-2 text-blue-500 hover:bg-blue-50 rounded">
                        <i class="fas fa-edit text-sm"></i>
                    </button>
                    <button onclick="deleteLiability(${liability.id})" class="p-2 text-red-500 hover:bg-red-50 rounded">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 渲染现金流列表
function renderCashFlows() {
    const container = document.getElementById('cashFlowContainer');
    if (!container) return;

    if (cashFlows.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-exchange-alt text-4xl mb-4 opacity-50"></i><p>暂无现金流记录</p><p class="text-sm">点击右上角按钮添加收支记录</p></div>';
        return;
    }

    container.innerHTML = cashFlows.map(flow => `
        <div class="bg-white rounded-lg p-4 shadow-sm mb-3">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="font-semibold text-gray-800">${flow.description}</h3>
                    <div class="flex items-center gap-2 mt-1 mb-2">
                        <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">${flow.flow_type}</span>
                        <span class="text-xs text-gray-500">${flow.date}</span>
                        ${flow.frequency ? `<span class="text-xs text-gray-500">频率: ${flow.frequency}</span>` : ''}
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-500">${flow.category || ''}</span>
                        <span class="text-lg font-bold ${flow.amount > 0 ? 'text-green-600' : 'text-red-600'}">
                            ${flow.amount > 0 ? '+' : ''}${formatCurrency(Math.abs(flow.amount))}
                        </span>
                    </div>
                </div>
                <div class="ml-4 flex gap-2">
                    <button onclick="editCashFlow(${flow.id})" class="p-2 text-blue-500 hover:bg-blue-50 rounded">
                        <i class="fas fa-edit text-sm"></i>
                    </button>
                    <button onclick="deleteCashFlow(${flow.id})" class="p-2 text-red-500 hover:bg-red-50 rounded">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 显示现金流标签页
function showCashFlowTab(tabName) {
    // 更新标签按钮状态
    document.getElementById('plannedFlowTab').classList.remove('active');
    document.getElementById('historicalFlowTab').classList.remove('active');
    document.getElementById(`${tabName}FlowTab`).classList.add('active');

    // 显示对应内容
    document.getElementById('plannedFlowContent').classList.toggle('hidden', tabName !== 'planned');
    document.getElementById('historicalFlowContent').classList.toggle('hidden', tabName !== 'historical');
}

// 工具函数
function formatNumber(num) {
    return new Intl.NumberFormat('zh-CN').format(num);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`;
        
        toast.classList.remove('translate-x-full');
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
        }, 3000);
    }
}

// CRUD功能实现

// 工具函数
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '￥0';
    }
    return '￥' + Number(amount).toLocaleString('zh-CN');
}

function showModal(content) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = content;
    modal.classList.remove('hidden');
}

function hideModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
}

// 删除函数
async function deleteAsset(id) {
    if (!confirm('确定要删除这个资产吗？')) return;
    
    try {
        await apiClient.deleteAsset(id);
        showToast('删除成功');
        await loadInitialData();
        if (currentPage === 'assets') renderAssets();
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

async function deleteLiability(id) {
    if (!confirm('确定要删除这个负债吗？')) return;
    
    try {
        await apiClient.deleteLiability(id);
        showToast('删除成功');
        await loadInitialData();
        if (currentPage === 'liabilities') renderLiabilities();
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

async function deleteCashFlow(id) {
    if (!confirm('确定要删除这个现金流记录吗？')) return;
    
    try {
        await apiClient.deleteCashFlow(id);
        showToast('删除成功');
        await loadInitialData();
        if (currentPage === 'cashFlow') renderCashFlows();
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

// 编辑函数
async function editAsset(id) {
    try {
        const asset = assets.find(a => a.id === id);
        if (!asset) {
            showToast('资产不存在', 'error');
            return;
        }
        
        const modalContent = `
            <div class="p-6">
                <h2 class="text-xl font-bold mb-4">编辑资产</h2>
                <form id="editAssetForm">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">资产名称</label>
                        <input type="text" id="editAssetName" value="${asset.name}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
                        <textarea id="editAssetDescription" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3">${asset.description || ''}</textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">当前价值</label>
                        <input type="number" id="editAssetValue" value="${asset.current_value}" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="flex gap-3">
                        <button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">保存</button>
                        <button type="button" onclick="hideModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">取消</button>
                    </div>
                </form>
            </div>
        `;
        
        showModal(modalContent);
        
        document.getElementById('editAssetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('editAssetName').value.trim();
            const description = document.getElementById('editAssetDescription').value.trim();
            const currentValue = parseFloat(document.getElementById('editAssetValue').value);
            
            if (!name || isNaN(currentValue)) {
                showToast('请填写完整信息', 'error');
                return;
            }
            
            try {
                await apiClient.updateAsset(id, {
                    name,
                    description,
                    current_value: currentValue
                });
                hideModal();
                showToast('修改成功');
                await loadInitialData();
                if (currentPage === 'assets') renderAssets();
            } catch (error) {
                showToast('修改失败', 'error');
            }
        });
        
    } catch (error) {
        showToast('加载资产信息失败', 'error');
    }
}

// 添加资产模态框
function showAddAssetModal() {
    const modalContent = `
        <div class="p-6">
            <h2 class="text-xl font-bold mb-4">添加资产</h2>
            <form id="addAssetForm">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">资产名称</label>
                    <input type="text" id="addAssetName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
                    <textarea id="addAssetDescription" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">资产类型</label>
                    <select id="addAssetType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        <option value="">请选择资产类型</option>
                        ${assetTypes.map(type => `<option value="${type.id}">${type.name}</option>`).join('')}
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">当前价值</label>
                    <input type="number" id="addAssetValue" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div class="flex gap-3">
                    <button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">添加</button>
                    <button type="button" onclick="hideModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">取消</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    document.getElementById('addAssetForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('addAssetName').value.trim();
        const description = document.getElementById('addAssetDescription').value.trim();
        const assetTypeId = parseInt(document.getElementById('addAssetType').value);
        const currentValue = parseFloat(document.getElementById('addAssetValue').value);
        
        if (!name || !assetTypeId || isNaN(currentValue)) {
            showToast('请填写完整信息', 'error');
            return;
        }
        
        try {
            await apiClient.createAsset({
                name,
                description,
                asset_type_id: assetTypeId,
                current_value: currentValue
            });
            hideModal();
            showToast('添加成功');
            await loadInitialData();
            if (currentPage === 'assets') renderAssets();
        } catch (error) {
            showToast('添加失败', 'error');
        }
    });
}

// 编辑负债函数
async function editLiability(id) {
    try {
        const liability = liabilities.find(l => l.id === id);
        if (!liability) {
            showToast('负债不存在', 'error');
            return;
        }
        
        const modalContent = `
            <div class="p-6">
                <h2 class="text-xl font-bold mb-4">编辑负债</h2>
                <form id="editLiabilityForm">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">负债名称</label>
                        <input type="text" id="editLiabilityName" value="${liability.name}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
                        <textarea id="editLiabilityDescription" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3">${liability.description || ''}</textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">当前余额</label>
                        <input type="number" id="editLiabilityBalance" value="${liability.current_balance}" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">利率 (%)</label>
                        <input type="number" id="editLiabilityRate" value="${liability.interest_rate || ''}" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">月还款额</label>
                        <input type="number" id="editLiabilityPayment" value="${liability.monthly_payment || ''}" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="flex gap-3">
                        <button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">保存</button>
                        <button type="button" onclick="hideModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">取消</button>
                    </div>
                </form>
            </div>
        `;
        
        showModal(modalContent);
        
        document.getElementById('editLiabilityForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('editLiabilityName').value.trim();
            const description = document.getElementById('editLiabilityDescription').value.trim();
            const currentBalance = parseFloat(document.getElementById('editLiabilityBalance').value);
            const interestRate = parseFloat(document.getElementById('editLiabilityRate').value) || null;
            const monthlyPayment = parseFloat(document.getElementById('editLiabilityPayment').value) || null;
            
            if (!name || isNaN(currentBalance)) {
                showToast('请填写完整信息', 'error');
                return;
            }
            
            try {
                await apiClient.updateLiability(id, {
                    name,
                    description,
                    current_balance: currentBalance,
                    interest_rate: interestRate,
                    monthly_payment: monthlyPayment
                });
                hideModal();
                showToast('修改成功');
                await loadInitialData();
                if (currentPage === 'liabilities') renderLiabilities();
            } catch (error) {
                showToast('修改失败', 'error');
            }
        });
        
    } catch (error) {
        showToast('加载负债信息失败', 'error');
    }
}

// 编辑现金流函数
async function editCashFlow(id) {
    try {
        const cashFlow = cashFlows.find(cf => cf.id === id);
        if (!cashFlow) {
            showToast('现金流记录不存在', 'error');
            return;
        }
        
        const modalContent = `
            <div class="p-6">
                <h2 class="text-xl font-bold mb-4">编辑现金流</h2>
                <form id="editCashFlowForm">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
                        <input type="text" id="editCashFlowDescription" value="${cashFlow.description}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">类型</label>
                        <select id="editCashFlowType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <option value="收入" ${cashFlow.flow_type === '收入' ? 'selected' : ''}>收入</option>
                            <option value="支出" ${cashFlow.flow_type === '支出' ? 'selected' : ''}>支出</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">金额</label>
                        <input type="number" id="editCashFlowAmount" value="${Math.abs(cashFlow.amount)}" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">日期</label>
                        <input type="date" id="editCashFlowDate" value="${cashFlow.date}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
                        <input type="text" id="editCashFlowCategory" value="${cashFlow.category || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="flex gap-3">
                        <button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">保存</button>
                        <button type="button" onclick="hideModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">取消</button>
                    </div>
                </form>
            </div>
        `;
        
        showModal(modalContent);
        
        document.getElementById('editCashFlowForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const description = document.getElementById('editCashFlowDescription').value.trim();
            const flowType = document.getElementById('editCashFlowType').value;
            const amount = parseFloat(document.getElementById('editCashFlowAmount').value);
            const date = document.getElementById('editCashFlowDate').value;
            const category = document.getElementById('editCashFlowCategory').value.trim();
            
            if (!description || isNaN(amount) || !date) {
                showToast('请填写完整信息', 'error');
                return;
            }
            
            try {
                await apiClient.updateCashFlow(id, {
                    description,
                    flow_type: flowType,
                    amount: flowType === '收入' ? amount : -amount,
                    date,
                    category
                });
                hideModal();
                showToast('修改成功');
                await loadInitialData();
                if (currentPage === 'cashFlow') renderCashFlows();
            } catch (error) {
                showToast('修改失败', 'error');
            }
        });
        
    } catch (error) {
        showToast('加载现金流信息失败', 'error');
    }
}

// 添加负债模态框
function showAddLiabilityModal() {
    const modalContent = `
        <div class="p-6">
            <h2 class="text-xl font-bold mb-4">添加负债</h2>
            <form id="addLiabilityForm">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">负债名称</label>
                    <input type="text" id="addLiabilityName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
                    <textarea id="addLiabilityDescription" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">当前余额</label>
                    <input type="number" id="addLiabilityBalance" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">利率 (%)</label>
                    <input type="number" id="addLiabilityRate" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">月还款额</label>
                    <input type="number" id="addLiabilityPayment" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="flex gap-3">
                    <button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">添加</button>
                    <button type="button" onclick="hideModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">取消</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    document.getElementById('addLiabilityForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('addLiabilityName').value.trim();
        const description = document.getElementById('addLiabilityDescription').value.trim();
        const currentBalance = parseFloat(document.getElementById('addLiabilityBalance').value);
        const interestRate = parseFloat(document.getElementById('addLiabilityRate').value) || null;
        const monthlyPayment = parseFloat(document.getElementById('addLiabilityPayment').value) || null;
        
        if (!name || isNaN(currentBalance)) {
            showToast('请填写完整信息', 'error');
            return;
        }
        
        try {
            await apiClient.createLiability({
                name,
                description,
                current_balance: currentBalance,
                interest_rate: interestRate,
                monthly_payment: monthlyPayment
            });
            hideModal();
            showToast('添加成功');
            await loadInitialData();
            if (currentPage === 'liabilities') renderLiabilities();
        } catch (error) {
            showToast('添加失败', 'error');
        }
    });
}

// 添加现金流模态框
function showAddCashFlowModal() {
    const modalContent = `
        <div class="p-6">
            <h2 class="text-xl font-bold mb-4">添加现金流</h2>
            <form id="addCashFlowForm">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
                    <input type="text" id="addCashFlowDescription" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">类型</label>
                    <select id="addCashFlowType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        <option value="">请选择类型</option>
                        <option value="收入">收入</option>
                        <option value="支出">支出</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">金额</label>
                    <input type="number" id="addCashFlowAmount" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">日期</label>
                    <input type="date" id="addCashFlowDate" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
                    <input type="text" id="addCashFlowCategory" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="flex gap-3">
                    <button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">添加</button>
                    <button type="button" onclick="hideModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">取消</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    // 设置默认日期为今天
    document.getElementById('addCashFlowDate').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('addCashFlowForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = document.getElementById('addCashFlowDescription').value.trim();
        const flowType = document.getElementById('addCashFlowType').value;
        const amount = parseFloat(document.getElementById('addCashFlowAmount').value);
        const date = document.getElementById('addCashFlowDate').value;
        const category = document.getElementById('addCashFlowCategory').value.trim();
        
        if (!description || !flowType || isNaN(amount) || !date) {
            showToast('请填写完整信息', 'error');
            return;
        }
        
        try {
            await apiClient.createCashFlow({
                description,
                flow_type: flowType,
                amount: flowType === '收入' ? amount : -amount,
                date,
                category
            });
            hideModal();
            showToast('添加成功');
            await loadInitialData();
            if (currentPage === 'cashFlow') renderCashFlows();
        } catch (error) {
            showToast('添加失败', 'error');
        }
    });
}

// 设置事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 添加按钮事件
    document.getElementById('addAssetBtn')?.addEventListener('click', () => {
        showAddAssetModal();
    });
    
    document.getElementById('addLiabilityBtn')?.addEventListener('click', () => {
        showAddLiabilityModal();
    });
    
    document.getElementById('addCashFlowBtn')?.addEventListener('click', () => {
        showAddCashFlowModal();
    });
    
    // 保存用户信息
    document.getElementById('saveUserInfoBtn')?.addEventListener('click', async () => {
        const username = document.getElementById('usernameInput').value.trim();
        const phone = document.getElementById('phoneInput').value.trim();
        const email = document.getElementById('emailInput').value.trim();
        
        if (!username) {
            showToast('用户名不能为空', 'error');
            return;
        }
        
        try {
            await apiClient.updateUserInfo({ username, phone, email });
            showToast('保存成功');
        } catch (error) {
            showToast('保存失败', 'error');
        }
    });
    
    // 模态框关闭
    document.getElementById('modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            hideModal();
        }
    });
});
