// API客户端 - 与Cloudflare Workers后端通信

class ApiClient {
    constructor() {
        // 使用真实API数据
        this.useMockData = false;
        this.baseUrl = 'https://personasset.dickwin2003.workers.dev';
    }

    // Mock数据
    getMockData() {
        return {
            dashboard: {
                total_assets: 2182000,
                total_liabilities: 460000,
                net_worth: 1722000,
                asset_count: 8,
                liability_count: 3,
                assets_by_category: {
                    '现金': 320000,
                    '股票': 850000,
                    '房产': 800000,
                    '基金': 212000
                },
                monthly_cash_flow: [
                    { month: '2025-01', income: 15000, expense: 8000 },
                    { month: '2025-02', income: 16000, expense: 7500 },
                    { month: '2025-03', income: 14500, expense: 8200 },
                    { month: '2025-04', income: 15500, expense: 7800 },
                    { month: '2025-05', income: 16500, expense: 8500 },
                    { month: '2025-06', income: 15200, expense: 7900 },
                    { month: '2025-07', income: 17000, expense: 8300 },
                    { month: '2025-08', income: 16800, expense: 8100 }
                ]
            },
            assets: [
                { id: 1, name: '招商银行储蓄卡', asset_type_name: '现金', current_value: 320000, description: '活期存款' },
                { id: 2, name: '余额宝', asset_type_name: '现金', current_value: 85000, description: '理财产品' },
                { id: 3, name: '中国银行定期', asset_type_name: '现金', current_value: 195000, description: '1年期定期存款' },
                { id: 4, name: '中国平安', asset_type_name: '股票', current_value: 280000, description: '保险股' },
                { id: 5, name: '贵州茅台', asset_type_name: '股票', current_value: 320000, description: '白酒龙头' },
                { id: 6, name: '腾讯控股', asset_type_name: '股票', current_value: 250000, description: '港股' },
                { id: 7, name: '上海房产', asset_type_name: '房产', current_value: 800000, description: '自住房' },
                { id: 8, name: '易方达混合基金', asset_type_name: '基金', current_value: 212000, description: '指数基金' }
            ],
            liabilities: [
                { id: 1, name: '房贷', current_balance: 350000, description: '上海房产贷款', interest_rate: 4.9, monthly_payment: 8500 },
                { id: 2, name: '信用卡', current_balance: 85000, description: '招商银行信用卡', interest_rate: 18.0, monthly_payment: 2000 },
                { id: 3, name: '车贷', current_balance: 25000, description: '汽车贷款余额', interest_rate: 6.5, monthly_payment: 1200 }
            ],
            cashFlows: [
                { id: 1, description: '工资收入', amount: 15000, flow_type: '收入', category: '预期收入', date: '2025-08-01', frequency: '月度' },
                { id: 2, description: '房贷还款', amount: -8500, flow_type: '支出', category: '预期支出', date: '2025-08-01', frequency: '月度' },
                { id: 3, description: '生活费用', amount: -3000, flow_type: '支出', category: '预期支出', date: '2025-08-01', frequency: '月度' },
                { id: 4, description: '奖金收入', amount: 8000, flow_type: '收入', category: '一次性收入', date: '2025-08-15', frequency: '年度' },
                { id: 5, description: '旅游支出', amount: -5000, flow_type: '支出', category: '一次性支出', date: '2025-08-20', frequency: '一次性' }
            ],
            assetTypes: [
                { id: 1, name: '现金', color: '#10b981' },
                { id: 2, name: '股票', color: '#3b82f6' },
                { id: 3, name: '房产', color: '#f59e0b' },
                { id: 4, name: '基金', color: '#8b5cf6' }
            ]
        };
    }

    async request(endpoint, options = {}) {
        // 如果使用mock数据，直接返回mock结果
        if (this.useMockData) {
            return this.handleMockRequest(endpoint, options);
        }

        const url = `${this.baseUrl}/api${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    handleMockRequest(endpoint, options) {
        const mockData = this.getMockData();
        
        // 模拟异步请求
        return new Promise((resolve) => {
            setTimeout(() => {
                if (endpoint === '/dashboard/overview') {
                    resolve(mockData.dashboard);
                } else if (endpoint === '/assets') {
                    resolve(mockData.assets);
                } else if (endpoint === '/liabilities') {
                    resolve(mockData.liabilities);
                } else if (endpoint === '/cash-flows') {
                    resolve(mockData.cashFlows);
                } else if (endpoint === '/asset-types') {
                    resolve(mockData.assetTypes);
                } else {
                    resolve({ success: true, message: 'Mock response' });
                }
            }, 100); // 模拟网络延迟
        });
    }

    // 资产类型相关API
    async getAssetTypes() {
        return this.request('/asset-types');
    }

    async createAssetType(data) {
        return this.request('/asset-types', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteAssetType(assetTypeId) {
        return this.request(`/asset-types/${assetTypeId}`, {
            method: 'DELETE',
        });
    }

    // 资产相关API
    async getAssets() {
        return this.request('/assets');
    }

    async createAsset(data) {
        return this.request('/assets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateAssetValue(assetId, currentValue) {
        return this.request(`/assets/${assetId}/value`, {
            method: 'PUT',
            body: JSON.stringify({ current_value: currentValue }),
        });
    }

    async updateAsset(assetId, data) {
        return this.request(`/assets/${assetId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteAsset(assetId) {
        return this.request(`/assets/${assetId}`, {
            method: 'DELETE',
        });
    }

    // 负债相关API
    async getLiabilities() {
        return this.request('/liabilities');
    }

    async createLiability(data) {
        return this.request('/liabilities', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateLiability(liabilityId, data) {
        return this.request(`/liabilities/${liabilityId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteLiability(liabilityId) {
        return this.request(`/liabilities/${liabilityId}`, {
            method: 'DELETE',
        });
    }

    // 现金流相关API
    async getCashFlows(startDate = null, endDate = null) {
        let endpoint = '/cash-flows';
        if (startDate && endDate) {
            endpoint += `?start_date=${startDate}&end_date=${endDate}`;
        }
        return this.request(endpoint);
    }

    async createCashFlow(data) {
        return this.request('/cash-flows', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateCashFlow(cashFlowId, data) {
        return this.request(`/cash-flows/${cashFlowId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteCashFlow(cashFlowId) {
        return this.request(`/cash-flows/${cashFlowId}`, {
            method: 'DELETE',
        });
    }

    // 总览统计API
    async getDashboardOverview() {
        return this.request('/dashboard/overview');
    }

    // 投资收益相关API
    async getInvestmentReturns() {
        return this.request('/investment-returns');
    }

    async createInvestmentReturn(data) {
        return this.request('/investment-returns', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    
    // 用户信息相关API
    async getUserInfo() {
        return this.request('/user/info');
    }
    
    async updateUserInfo(data) {
        return this.request('/user/info', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    
    // 分析相关API
    async getMonthlyIncomeExpense() {
        return this.request('/analytics/monthly-income-expense');
    }
    
    async getBalanceForecast() {
        return this.request('/analytics/balance-forecast');
    }
    
    async getAssetReturns() {
        return this.request('/analytics/asset-returns');
    }
}

// 全局API客户端实例
window.apiClient = new ApiClient();
