// 资产管理器 - 处理资产相关的UI和逻辑

class AssetManager {
    constructor() {
        this.assets = [];
        this.assetTypes = [];
        this.liabilities = [];
        this.cashFlows = [];
        this.init();
    }

    async init() {
        await this.loadAssetTypes();
        await this.loadAssets();
        await this.loadLiabilities();
        this.setupEventListeners();
    }

    async loadAssetTypes() {
        try {
            this.assetTypes = await apiClient.getAssetTypes();
        } catch (error) {
            console.error('Failed to load asset types:', error);
            this.showToast('加载资产类型失败', 'error');
        }
    }

    async loadAssets() {
        try {
            this.assets = await apiClient.getAssets();
            this.renderAssetsList();
        } catch (error) {
            console.error('Failed to load assets:', error);
            this.showToast('加载资产失败', 'error');
        }
    }

    async loadLiabilities() {
        try {
            this.liabilities = await apiClient.getLiabilities();
            this.renderLiabilitiesList();
        } catch (error) {
            console.error('Failed to load liabilities:', error);
            this.showToast('加载负债失败', 'error');
        }
    }

    renderAssetsList() {
        const container = document.getElementById('assetsContainer');
        if (!container) return;

        const assetsByCategory = this.groupAssetsByCategory();
        
        container.innerHTML = Object.entries(assetsByCategory).map(([category, assets]) => `
            <div class="asset-category mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas ${this.getCategoryIcon(category)} mr-2 text-blue-500"></i>
                    ${this.getCategoryName(category)} (${assets.length}项)
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${assets.map(asset => this.renderAssetCard(asset)).join('')}
                </div>
            </div>
        `).join('');

        // 添加新增资产按钮
        container.innerHTML += `
            <div class="text-center mt-6">
                <button id="addAssetBtn" class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center mx-auto">
                    <i class="fas fa-plus mr-2"></i>添加新资产
                </button>
            </div>
        `;
    }

    renderAssetCard(asset) {
        const currentValue = parseFloat(asset.current_value);
        const purchaseValue = parseFloat(asset.purchase_value) || currentValue;
        const returnRate = ((currentValue - purchaseValue) / purchaseValue * 100).toFixed(2);
        const isProfit = currentValue >= purchaseValue;

        return `
            <div class="asset-card bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition">
                <div class="flex justify-between items-start mb-3">
                    <h4 class="font-semibold text-gray-800">${asset.name}</h4>
                    <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        ${asset.asset_type_name}
                    </span>
                </div>
                
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">当前价值:</span>
                        <span class="font-semibold text-blue-600">¥${currentValue.toLocaleString()}</span>
                    </div>
                    
                    ${purchaseValue !== currentValue ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">购入价值:</span>
                            <span class="text-gray-500">¥${purchaseValue.toLocaleString()}</span>
                        </div>
                        
                        <div class="flex justify-between">
                            <span class="text-gray-600">收益率:</span>
                            <span class="font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}">
                                ${isProfit ? '+' : ''}${returnRate}%
                            </span>
                        </div>
                    ` : ''}
                    
                    ${asset.expected_return_rate > 0 ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">预期收益:</span>
                            <span class="text-purple-600">${asset.expected_return_rate}%</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="mt-4 flex gap-2">
                    <button class="update-value-btn flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition" 
                            data-asset-id="${asset.id}">
                        更新价值
                    </button>
                    <button class="record-return-btn flex-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition"
                            data-asset-id="${asset.id}">
                        记录收益
                    </button>
                </div>
            </div>
        `;
    }

    renderLiabilitiesList() {
        const container = document.getElementById('liabilitiesContainer');
        if (!container) return;

        if (this.liabilities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-credit-card text-4xl mb-4"></i>
                    <p>暂无负债记录</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${this.liabilities.map(liability => this.renderLiabilityCard(liability)).join('')}
            </div>
            <div class="text-center mt-6">
                <button id="addLiabilityBtn" class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center mx-auto">
                    <i class="fas fa-plus mr-2"></i>添加负债
                </button>
            </div>
        `;
    }

    renderLiabilityCard(liability) {
        const remainingAmount = parseFloat(liability.remaining_amount);
        const totalAmount = parseFloat(liability.total_amount);
        const monthlyPayment = parseFloat(liability.monthly_payment);
        const progressPercent = ((totalAmount - remainingAmount) / totalAmount * 100).toFixed(1);

        return `
            <div class="liability-card bg-white rounded-lg shadow-md p-4 border border-red-200">
                <div class="flex justify-between items-start mb-3">
                    <h4 class="font-semibold text-gray-800">${liability.name}</h4>
                    <span class="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                        ${this.getLiabilityTypeName(liability.liability_type)}
                    </span>
                </div>
                
                <div class="space-y-2 mb-4">
                    <div class="flex justify-between">
                        <span class="text-gray-600">剩余金额:</span>
                        <span class="font-semibold text-red-600">¥${remainingAmount.toLocaleString()}</span>
                    </div>
                    
                    <div class="flex justify-between">
                        <span class="text-gray-600">月还款:</span>
                        <span class="text-gray-700">¥${monthlyPayment.toLocaleString()}</span>
                    </div>
                    
                    <div class="flex justify-between">
                        <span class="text-gray-600">还款进度:</span>
                        <span class="text-green-600">${progressPercent}%</span>
                    </div>
                </div>
                
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full" style="width: ${progressPercent}%"></div>
                </div>
            </div>
        `;
    }

    groupAssetsByCategory() {
        return this.assets.reduce((groups, asset) => {
            const category = asset.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(asset);
            return groups;
        }, {});
    }

    getCategoryName(category) {
        const names = {
            'fixed': '固定资产',
            'liquid': '流动资产',
            'consumer': '消费品'
        };
        return names[category] || category;
    }

    getCategoryIcon(category) {
        const icons = {
            'fixed': 'fa-home',
            'liquid': 'fa-coins',
            'consumer': 'fa-car'
        };
        return icons[category] || 'fa-box';
    }

    getLiabilityTypeName(type) {
        const names = {
            'mortgage': '房贷',
            'car_loan': '车贷',
            'credit_card': '信用卡',
            'other': '其他'
        };
        return names[type] || type;
    }

    setupEventListeners() {
        // 添加资产按钮
        document.addEventListener('click', async (e) => {
            if (e.target.id === 'addAssetBtn' || e.target.closest('#addAssetBtn')) {
                this.showAddAssetModal();
            }
            
            if (e.target.id === 'addLiabilityBtn' || e.target.closest('#addLiabilityBtn')) {
                this.showAddLiabilityModal();
            }
            
            if (e.target.classList.contains('update-value-btn')) {
                const assetId = e.target.dataset.assetId;
                this.showUpdateValueModal(assetId);
            }
            
            if (e.target.classList.contains('record-return-btn')) {
                const assetId = e.target.dataset.assetId;
                this.showRecordReturnModal(assetId);
            }
        });
    }

    showAddAssetModal() {
        const modal = this.createModal('添加新资产', `
            <form id="addAssetForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">资产类型</label>
                    <select id="assetTypeSelect" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                        <option value="">请选择资产类型</option>
                        ${this.assetTypes.map(type => `
                            <option value="${type.id}">${type.name} (${this.getCategoryName(type.category)})</option>
                        `).join('')}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">资产名称</label>
                    <input type="text" id="assetName" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">当前价值</label>
                    <input type="number" id="currentValue" class="w-full border border-gray-300 rounded-lg px-3 py-2" step="0.01" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">购入价值（可选）</label>
                    <input type="number" id="purchaseValue" class="w-full border border-gray-300 rounded-lg px-3 py-2" step="0.01">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">购入日期（可选）</label>
                    <input type="date" id="purchaseDate" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">预期年收益率 (%)</label>
                    <input type="number" id="expectedReturn" class="w-full border border-gray-300 rounded-lg px-3 py-2" step="0.01" value="0">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">描述（可选）</label>
                    <textarea id="assetDescription" class="w-full border border-gray-300 rounded-lg px-3 py-2" rows="3"></textarea>
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" class="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                        添加资产
                    </button>
                    <button type="button" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition" onclick="this.closest('.modal').remove()">
                        取消
                    </button>
                </div>
            </form>
        `);

        document.getElementById('addAssetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddAsset(e.target);
            modal.remove();
        });
    }

    async handleAddAsset(form) {
        const formData = new FormData(form);
        const data = {
            asset_type_id: parseInt(document.getElementById('assetTypeSelect').value),
            name: document.getElementById('assetName').value,
            current_value: parseFloat(document.getElementById('currentValue').value),
            purchase_value: document.getElementById('purchaseValue').value ? parseFloat(document.getElementById('purchaseValue').value) : null,
            purchase_date: document.getElementById('purchaseDate').value || null,
            expected_return_rate: parseFloat(document.getElementById('expectedReturn').value) || 0,
            description: document.getElementById('assetDescription').value
        };

        try {
            await apiClient.createAsset(data);
            this.showToast('资产添加成功');
            await this.loadAssets();
        } catch (error) {
            console.error('Failed to add asset:', error);
            this.showToast('添加资产失败', 'error');
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

// 初始化资产管理器
window.assetManager = new AssetManager();
